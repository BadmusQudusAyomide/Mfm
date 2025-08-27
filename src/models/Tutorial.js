import mongoose from "mongoose";

const TutorialSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    topic: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    type: {
      type: String,
      enum: ["pdf", "video"],
      required: true,
      default: "pdf",
    },
    pdf: {
      url: { type: String },
      publicId: { type: String },
      bytes: { type: Number },
      originalName: { type: String },
      contentType: { type: String, default: "application/pdf" },
    },
    video: {
      url: { type: String },
      publicId: { type: String },
      bytes: { type: Number },
      originalName: { type: String },
      duration: { type: Number }, // in seconds
      thumbnail: { type: String },
    },
    published: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

TutorialSchema.index({ course: 1, topic: 1 });
TutorialSchema.index({ course: 1, published: 1 });
TutorialSchema.index({ course: 1, type: 1 });

const Tutorial = mongoose.model("Tutorial", TutorialSchema);
export default Tutorial;
