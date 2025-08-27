import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    question: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["multiple_choice", "true_false", "short_answer"],
      default: "multiple_choice",
    },
    options: [String], // for multiple choice questions
    correctAnswer: { type: String, required: true },
    explanation: { type: String, trim: true },
    points: { type: Number, default: 1 },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

QuestionSchema.index({ quiz: 1, order: 1 });
QuestionSchema.index({ published: 1 });

const Question = mongoose.model("Question", QuestionSchema);
export default Question;
