import mongoose from 'mongoose';

const TutorialSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    pdf: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
      bytes: { type: Number },
      originalName: { type: String },
      contentType: { type: String, default: 'application/pdf' },
    },
    published: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

TutorialSchema.index({ subject: 1, title: 1 });
TutorialSchema.index({ course: 1, title: 1 });

const Tutorial = mongoose.model('Tutorial', TutorialSchema);
export default Tutorial;
