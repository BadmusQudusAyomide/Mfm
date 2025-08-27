import Post from "../models/Post.js";
import Comment from "../models/Comment.js";
import { cloudinary } from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all posts (public)
export const getAllPosts = asyncHandler(async (req, res) => {
  const {
    q,
    tags,
    author,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = req.query;

  const filter = { published: true };
  if (tags) filter.tags = { $in: tags.split(",") };
  if (author) filter.author = author;
  if (q) {
    const s = String(q).trim();
    filter.$or = [
      { content: new RegExp(s, "i") },
      { tags: { $in: [new RegExp(s, "i")] } },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, posts] = await Promise.all([
    Post.countDocuments(filter),
    Post.find(filter)
      .populate("author", "name department profilePicture")
      .populate("likes", "name")
      .populate("shares", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
  ]);

  res.json({
    data: posts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// Get a specific post (public)
export const getPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id)
    .populate("author", "name department profilePicture")
    .populate("likes", "name")
    .populate("shares", "name")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "name department profilePicture",
      },
    });

  if (!post || !post.published) {
    return res.status(404).json({ message: "Post not found" });
  }

  res.json({ data: post });
});

// Create a new post (authenticated users)
export const createPost = asyncHandler(async (req, res) => {
  const { content, tags } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: "Content is required" });
  }

  let postData = {
    author: req.user._id,
    content: content.trim(),
    tags: tags ? tags.split(",").map((t) => t.trim()) : [],
  };

  // Handle image uploads if provided
  if (req.files && req.files.length > 0) {
    const imagePromises = req.files.map(async (file) => {
      const buffer = file.buffer;
      const originalName = file.originalname;
      const folder = `community/${req.user._id}`;

      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            use_filename: true,
            unique_filename: true,
            filename_override: originalName,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(buffer);
      });

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    });

    postData.images = await Promise.all(imagePromises);
  }

  const post = await Post.create(postData);

  // Populate author info for response
  await post.populate("author", "name department profilePicture");

  res.status(201).json({ data: post });
});

// Update a post (author only)
export const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (post.author.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to edit this post" });
  }

  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      ...req.body,
      isEdited: true,
      editedAt: new Date(),
    },
    { new: true, runValidators: true }
  ).populate("author", "name department profilePicture");

  res.json({ data: updatedPost });
});

// Delete a post (author or admin only)
export const deletePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

  if (
    post.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this post" });
  }

  // Delete images from Cloudinary
  if (post.images && post.images.length > 0) {
    const deletePromises = post.images.map(async (image) => {
      if (image.publicId) {
        try {
          await cloudinary.uploader.destroy(image.publicId);
        } catch (e) {}
      }
    });
    await Promise.all(deletePromises);
  }

  await post.deleteOne();
  res.json({ message: "Post deleted successfully" });
});

// Like/unlike a post
export const togglePostLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  if (!post || !post.published) {
    return res.status(404).json({ message: "Post not found" });
  }

  const userId = req.user._id;
  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    // Unlike
    post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    // Like
    post.likes.push(userId);
    post.likesCount += 1;
  }

  await post.save();
  res.json({
    message: `Post ${isLiked ? "unliked" : "liked"} successfully`,
    data: { likesCount: post.likesCount, isLiked: !isLiked },
  });
});

// Share a post
export const sharePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);
  if (!post || !post.published) {
    return res.status(404).json({ message: "Post not found" });
  }

  const userId = req.user._id;
  if (!post.shares.includes(userId)) {
    post.shares.push(userId);
    post.sharesCount += 1;
    await post.save();
  }

  res.json({
    message: "Post shared successfully",
    data: { sharesCount: post.sharesCount },
  });
});

// Get comments for a post
export const getPostComments = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { page = 1, limit = 20, sort = "createdAt" } = req.query;

  const filter = { post: postId, published: true, parentComment: null }; // Only top-level comments

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, comments] = await Promise.all([
    Comment.countDocuments(filter),
    Comment.find(filter)
      .populate("author", "name department profilePicture")
      .populate("likes", "name")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "name department profilePicture",
        },
      })
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
  ]);

  res.json({
    data: comments,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// Create a comment
export const createComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { content, parentComment } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ message: "Content is required" });
  }

  const commentData = {
    post: postId,
    author: req.user._id,
    content: content.trim(),
    parentComment: parentComment || null,
  };

  const comment = await Comment.create(commentData);

  // Populate author info for response
  await comment.populate("author", "name department profilePicture");

  // Update post comment count
  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  res.status(201).json({ data: comment });
});

// Like/unlike a comment
export const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment || !comment.published) {
    return res.status(404).json({ message: "Comment not found" });
  }

  const userId = req.user._id;
  const isLiked = comment.likes.includes(userId);

  if (isLiked) {
    // Unlike
    comment.likes = comment.likes.filter(
      (id) => id.toString() !== userId.toString()
    );
    comment.likesCount = Math.max(0, comment.likesCount - 1);
  } else {
    // Like
    comment.likes.push(userId);
    comment.likesCount += 1;
  }

  await comment.save();
  res.json({
    message: `Comment ${isLiked ? "unliked" : "liked"} successfully`,
    data: { likesCount: comment.likesCount, isLiked: !isLiked },
  });
});

// Update a comment (author only)
export const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  if (comment.author.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to edit this comment" });
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      ...req.body,
      isEdited: true,
      editedAt: new Date(),
    },
    { new: true, runValidators: true }
  ).populate("author", "name department profilePicture");

  res.json({ data: updatedComment });
});

// Delete a comment (author or admin only)
export const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  if (
    comment.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this comment" });
  }

  // Update post comment count
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });

  await comment.deleteOne();
  res.json({ message: "Comment deleted successfully" });
});
