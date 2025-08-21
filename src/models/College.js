import mongoose from 'mongoose';

const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    abbr: { type: String, required: true, trim: true, uppercase: true, unique: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const College = mongoose.model('College', CollegeSchema);
export default College;
