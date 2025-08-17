import { cloudinary } from '../config/cloudinary.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const uploadBufferToCloudinary = (buffer, folder = 'profiles') =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) return res.status(404).json({ message: 'User not found' });

  const {
    name,
    username,
    age,
    level,
    gender,
    dob,
    faculty,
    college,
    department,
    isChurchMember,
    subjectOfInterest,
    bestSubject,
    phone,
  } = req.body;

  if (name !== undefined) user.name = name;
  if (username !== undefined) user.username = String(username).toLowerCase();
  if (age !== undefined) user.age = age;
  if (level !== undefined) user.level = String(level);
  if (gender !== undefined) user.gender = String(gender).toLowerCase();
  if (dob !== undefined) user.dob = typeof dob === 'string' ? new Date(dob) : dob;
  if (faculty !== undefined) user.faculty = faculty;
  if (college !== undefined) user.college = college;
  if (department !== undefined) user.department = department;
  if (isChurchMember !== undefined) user.isChurchMember = isChurchMember;
  if (subjectOfInterest !== undefined) user.subjectOfInterest = subjectOfInterest;
  if (bestSubject !== undefined) user.bestSubject = bestSubject;
  if (phone !== undefined) user.phone = phone;

  // Handle image upload if present
  if (req.file && req.file.buffer) {
    // Delete old image if exists
    if (user.profileImage?.publicId) {
      try {
        await cloudinary.uploader.destroy(user.profileImage.publicId);
      } catch (e) {
        // log and continue
        console.warn('Failed to delete old Cloudinary image', e?.message || e);
      }
    }

    const result = await uploadBufferToCloudinary(req.file.buffer, 'church_fellowship/profiles');
    user.profileImage = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  await user.save();
  const safe = await User.findById(user._id).select('-password');
  res.json(safe);
});
