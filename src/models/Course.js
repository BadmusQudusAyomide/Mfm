import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, unique: true }, // e.g. CSC101
    title: { type: String, required: true, trim: true },
    level: { type: String, enum: ['100','200','300','400','500','600','700'], required: true },
    // legacy string department for backward-compat
    department: { type: String, required: true, trim: true },
    // new relational fields
    departmentRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    collegeRef: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    description: { type: String, trim: true },
    published: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

CourseSchema.index({ department: 1, level: 1 });

const Course = mongoose.model('Course', CourseSchema);
export default Course;
