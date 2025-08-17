import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['unit', 'cell', 'other'], default: 'unit' },
  },
  { timestamps: true }
);

export const Group = mongoose.model('Group', groupSchema);
