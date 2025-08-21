import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    // new relation: subject belongs to a course
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    // legacy fields kept optional for backward-compat
    level: { type: String, enum: ['100','200','300','400','500','600','700'], default: undefined },
    department: { type: String, default: '' },
    description: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
