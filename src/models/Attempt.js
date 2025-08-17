import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedIndex: { type: Number, min: 0, max: 4, required: true },
    isCorrect: { type: Boolean, default: false },
    earnedPoints: { type: Number, default: 0 },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    durationSec: { type: Number, default: 0 },
    questionOrder: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    answers: [answerSchema],
    questionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

attemptSchema.index({ user: 1, quiz: 1, createdAt: -1 });

const Attempt = mongoose.model('Attempt', attemptSchema);
export default Attempt;
