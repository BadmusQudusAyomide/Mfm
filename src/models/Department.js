import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    college: { type: mongoose.Schema.Types.ObjectId, ref: 'College', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

DepartmentSchema.index({ college: 1, code: 1 });

const Department = mongoose.model('Department', DepartmentSchema);
export default Department;
