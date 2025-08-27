import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true, trim: true },
    images: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    likesCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    published: { type: Boolean, default: true },
    tags: [String], // e.g., ["prayer", "testimony", "announcement"]
  },
  { timestamps: true }
);

PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ published: 1, createdAt: -1 });
PostSchema.index({ tags: 1, published: 1 });

const Post = mongoose.model("Post", PostSchema);
export default Post;
