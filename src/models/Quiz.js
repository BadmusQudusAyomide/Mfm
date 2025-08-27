import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    timeLimit: { type: Number, default: 0 }, // in minutes, 0 = no limit
    passingScore: { type: Number, default: 70 }, // percentage
    maxAttempts: { type: Number, default: 3 },
    isRandomized: { type: Boolean, default: false },
    showResults: { type: Boolean, default: true },
    published: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

QuizSchema.index({ course: 1, published: 1 });
QuizSchema.index({ published: 1, createdAt: -1 });

const Quiz = mongoose.model("Quiz", QuizSchema);
export default Quiz;
