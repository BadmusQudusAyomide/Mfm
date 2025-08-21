import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['member', 'exec', 'admin'], default: 'member' },
    active: { type: Boolean, default: true },
    age: { type: Number, min: 0, max: 150 },
    level: { type: String, enum: ['100','200','300','400','500','600','700'], default: '100' },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    dob: { type: Date },
    faculty: { type: String, default: '' },
    college: { type: String, default: '' },
    department: { type: String, default: '' },
    isChurchMember: { type: Boolean, default: false },
    subjectOfInterest: { type: String, default: '' },
    bestSubject: { type: String, default: '' },
    phone: { type: String, default: '' },
    profileImage: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model('User', userSchema);
