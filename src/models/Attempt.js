import mongoose from "mongoose";

const AttemptSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    quiz: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Quiz", 
      required: true 
    },
    answers: [{
      question: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Question",
        required: true
      },
      selectedIndex: { 
        type: Number, 
        required: true 
      },
      isCorrect: { 
        type: Boolean, 
        default: false 
      },
      points: { 
        type: Number, 
        default: 0 
      }
    }],
    score: { 
      type: Number, 
      default: 0 
    },
    maxScore: { 
      type: Number, 
      required: true 
    },
    startedAt: { 
      type: Date, 
      default: Date.now 
    },
    submittedAt: { 
      type: Date 
    },
    timeSpent: { 
      type: Number, 
      default: 0 
    },
    isPassed: { 
      type: Boolean, 
      default: false 
    },
    questionOrder: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Question" 
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes
AttemptSchema.index({ user: 1, quiz: 1 });
AttemptSchema.index({ submittedAt: -1 });

const Attempt = mongoose.model("Attempt", AttemptSchema);
export default Attempt;
