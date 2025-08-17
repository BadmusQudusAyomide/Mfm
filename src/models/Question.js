import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    section: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],
    text: { type: String, required: true },
    options: {
      type: [String],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 2 && arr.length <= 5,
        message: 'Options must have between 2 and 5 choices',
      },
      required: true,
    },
    correctIndex: { type: Number, min: 0, max: 4, required: true },
    explanation: { type: String, default: '' },
    points: { type: Number, default: 1 },
  },
  { timestamps: true }
);

questionSchema.index({ quiz: 1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
