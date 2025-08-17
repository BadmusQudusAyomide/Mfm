import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    description: { type: String, default: '' },
    timeLimitSec: { type: Number, default: 0 }, // 0 = no limit
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    attemptLimit: { type: Number, default: 0 }, // 0 = unlimited
    isActive: { type: Boolean, default: true },
    totalPoints: { type: Number, default: 0 }, // recalculated from questions on change
    sections: [
      {
        name: { type: String, trim: true },
        description: { type: String, default: '' },
      },
    ],
    tags: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

quizSchema.index({ subject: 1, isActive: 1 });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
