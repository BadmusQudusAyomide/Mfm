import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date },
    location: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);
