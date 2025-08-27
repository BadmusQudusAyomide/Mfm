import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true, trim: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: "Comment" }, // for replies
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    isEdited: { type: Boolean, default: false },
    editedAt: { type: Date },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CommentSchema.index({ post: 1, createdAt: 1 });
CommentSchema.index({ author: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1, createdAt: 1 });

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
