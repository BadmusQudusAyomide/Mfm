import mongoose from "mongoose";

const EventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., "18:00"
    endTime: { type: String, required: true }, // e.g., "20:00"
    location: { type: String, required: true, trim: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    category: {
      type: String,
      enum: [
        "worship",
        "prayer",
        "bible_study",
        "fellowship",
        "outreach",
        "other",
      ],
      default: "other",
    },
    isRecurring: { type: Boolean, default: false },
    recurringPattern: { type: String }, // e.g., "weekly", "monthly"
    maxAttendees: { type: Number },
    currentAttendees: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

EventSchema.index({ date: 1, published: 1 });
EventSchema.index({ category: 1, published: 1 });
EventSchema.index({ isRecurring: 1, published: 1 });

const Event = mongoose.model("Event", EventSchema);
export default Event;
