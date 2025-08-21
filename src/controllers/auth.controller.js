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
    adminCode,
    execCode,
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

  // Decide role: first ever user becomes admin; otherwise allow codes
  let roleToSet = 'member';
  const totalUsers = await User.countDocuments();
  if (totalUsers === 0) {
    roleToSet = 'admin';
  } else if (adminCode && adminCode === (process.env.ADMIN_SIGNUP_CODE || '')) {
    roleToSet = 'admin';
  } else if (execCode && execCode === (process.env.EXEC_SIGNUP_CODE || '')) {
    roleToSet = 'exec';
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
    role: roleToSet,
  });
  const token = signToken(user);
  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email, username: user.username, role: user.role },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { identifier, email, username, password } = req.body;
  const id = (identifier ?? email ?? username ?? '').toString().trim();
  if (!id || !password) {
    return res.status(400).json({ message: 'email/username and password are required' });
  }

  // Determine whether id looks like an email; otherwise treat as username
  const looksLikeEmail = /.+@.+\..+/.test(id);
  const query = looksLikeEmail
    ? { email: id.toLowerCase() }
    : { username: id.toLowerCase() };

  const user = await User.findOne(query).select('+password');
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  // Disallow login if account is deactivated
  if (user.active === false) return res.status(403).json({ message: 'Account is deactivated. Contact an admin.' });

  const match = await user.comparePassword(password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user);
  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email, username: user.username, role: user.role },
  });
});

export const me = asyncHandler(async (req, res) => {
  // req.user is set by protect middleware
  return res.json({ user: req.user });
});

export const promoteSelf = asyncHandler(async (req, res) => {
  const { role, code } = req.body || {};
  if (!role || !code) return res.status(400).json({ message: 'role and code are required' });
  if (!['admin', 'exec'].includes(String(role))) return res.status(400).json({ message: 'role must be admin or exec' });

  const isValid =
    (role === 'admin' && code === (process.env.ADMIN_SIGNUP_CODE || '')) ||
    (role === 'exec' && code === (process.env.EXEC_SIGNUP_CODE || ''));
  if (!isValid) return res.status(403).json({ message: 'Invalid code' });

  // Prevent demotion path and unnecessary writes
  if (req.user.role === role) return res.json({ message: 'No change', user: req.user });

  req.user.role = role;
  await req.user.save();
  return res.json({ message: 'Role updated', user: { id: req.user._id, name: req.user.name, email: req.user.email, username: req.user.username, role: req.user.role } });
});
