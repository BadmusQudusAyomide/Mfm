import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const signToken = (user) => {
  const payload = { id: user._id, role: user.role };
  const secret = process.env.JWT_SECRET || 'dev';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn });
};

export const register = asyncHandler(async (req, res) => {
  const {
    name,
    username,
    email,
    password,
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

  if (!name || !username || !email || !password) {
    return res.status(400).json({ message: 'name, username, email and password are required' });
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) return res.status(409).json({ message: 'Email already registered' });

  const usernameExists = await User.findOne({ username });
  if (usernameExists) return res.status(409).json({ message: 'Username already taken' });

  const allowedLevels = ['100','200','300','400','500','600','700'];
  if (level && !allowedLevels.includes(String(level))) {
    return res.status(400).json({ message: 'level must be one of 100,200,300,400,500,600,700' });
  }

  const allowedGenders = ['male','female','other'];
  if (gender && !allowedGenders.includes(String(gender).toLowerCase())) {
    return res.status(400).json({ message: 'gender must be male, female, or other' });
  }

  let dobValue = dob;
  if (dob && typeof dob === 'string') {
    const parsed = new Date(dob);
    if (isNaN(parsed.getTime())) {
      return res.status(400).json({ message: 'dob must be a valid date (ISO string or yyyy-mm-dd)' });
    }
    dobValue = parsed;
  }

  const user = await User.create({
    name,
    username: String(username).toLowerCase(),
    email,
    password,
    age,
    level: level ? String(level) : undefined,
    gender: gender ? String(gender).toLowerCase() : undefined,
    dob: dobValue,
    faculty,
    college,
    department,
    isChurchMember,
    subjectOfInterest,
    bestSubject,
    phone,
  });
  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await user.comparePassword(password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const me = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  return res.json({ user: req.user });
});
