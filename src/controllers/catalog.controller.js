import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';
import College from '../models/College.js';
import Department from '../models/Department.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';

// Colleges
export const listColleges = asyncHandler(async (req, res) => {
  const items = await College.find({}).sort({ abbr: 1 });
  res.json(items);
});

export const createCollege = asyncHandler(async (req, res) => {
  const { name, abbr } = req.body;
  if (!name || !abbr) return res.status(400).json({ message: 'name and abbr are required' });
  const exists = await College.findOne({ abbr: String(abbr).toUpperCase() });
  if (exists) return res.status(409).json({ message: 'College abbr already exists' });
  const college = await College.create({ name, abbr: String(abbr).toUpperCase(), createdBy: req.user?._id });
  res.status(201).json(college);
});

export const updateCollege = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await College.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'College not found' });
  res.json(item);
});

export const deleteCollege = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const used = await Department.exists({ college: id });
  if (used) return res.status(400).json({ message: 'Cannot delete college with departments' });
  const del = await College.findByIdAndDelete(id);
  if (!del) return res.status(404).json({ message: 'College not found' });
  res.json({ message: 'College deleted' });
});

// Departments
export const listDepartments = asyncHandler(async (req, res) => {
  const { college } = req.query;
  const filter = {};
  if (college) {
    if (!mongoose.isValidObjectId(college)) return res.status(400).json({ message: 'Invalid college id' });
    filter.college = college;
  }
  const items = await Department.find(filter).populate('college', 'name abbr').sort({ code: 1 });
  res.json(items);
});

export const createDepartment = asyncHandler(async (req, res) => {
  const { name, code, college } = req.body;
  if (!name || !code || !college) return res.status(400).json({ message: 'name, code, college are required' });
  if (!mongoose.isValidObjectId(college)) return res.status(400).json({ message: 'Invalid college id' });
  const col = await College.findById(college);
  if (!col) return res.status(404).json({ message: 'College not found' });
  const exists = await Department.findOne({ code: String(code).toUpperCase() });
  if (exists) return res.status(409).json({ message: 'Department code already exists' });
  const dep = await Department.create({ name, code: String(code).toUpperCase(), college, createdBy: req.user?._id });
  res.status(201).json(dep);
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const item = await Department.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Department not found' });
  res.json(item);
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const used = await Course.exists({ departmentRef: id });
  if (used) return res.status(400).json({ message: 'Cannot delete department with courses' });
  const del = await Department.findByIdAndDelete(id);
  if (!del) return res.status(404).json({ message: 'Department not found' });
  res.json({ message: 'Department deleted' });
});

// Courses
export const listCourses = asyncHandler(async (req, res) => {
  const { department, college } = req.query;
  const filter = {};
  if (department) {
    if (!mongoose.isValidObjectId(department)) return res.status(400).json({ message: 'Invalid department id' });
    filter.departmentRef = department;
  }
  if (college) {
    if (!mongoose.isValidObjectId(college)) return res.status(400).json({ message: 'Invalid college id' });
    filter.collegeRef = college;
  }
  const items = await Course.find(filter).populate('departmentRef', 'name code').populate('collegeRef', 'name abbr').sort({ level: 1, code: 1 });
  res.json(items);
});

export const createCourse = asyncHandler(async (req, res) => {
  const { code, title, level, department } = req.body;
  if (!code || !title || !level || !department) return res.status(400).json({ message: 'code, title, level, department are required' });
  if (!mongoose.isValidObjectId(department)) return res.status(400).json({ message: 'Invalid department id' });
  const dep = await Department.findById(department).populate('college');
  if (!dep) return res.status(404).json({ message: 'Department not found' });
  const exists = await Course.findOne({ code: String(code).toUpperCase() });
  if (exists) return res.status(409).json({ message: 'Course code already exists' });
  const course = await Course.create({ code: String(code).toUpperCase(), title, level, department: dep.code, departmentRef: dep._id, collegeRef: dep.college, createdBy: req.user?._id });
  res.status(201).json(course);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = { ...req.body };
  if (body.department) {
    if (!mongoose.isValidObjectId(body.department)) return res.status(400).json({ message: 'Invalid department id' });
    const dep = await Department.findById(body.department).populate('college');
    if (!dep) return res.status(404).json({ message: 'Department not found' });
    body.department = dep.code; // legacy string
    body.departmentRef = dep._id;
    body.collegeRef = dep.college;
  }
  const item = await Course.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Course not found' });
  res.json(item);
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const used = await Subject.exists({ course: id });
  if (used) return res.status(400).json({ message: 'Cannot delete course with subjects' });
  const del = await Course.findByIdAndDelete(id);
  if (!del) return res.status(404).json({ message: 'Course not found' });
  res.json({ message: 'Course deleted' });
});

// Subjects
export const listSubjects = asyncHandler(async (req, res) => {
  const { course } = req.query;
  const filter = {};
  if (course) {
    if (!mongoose.isValidObjectId(course)) return res.status(400).json({ message: 'Invalid course id' });
    filter.course = course;
  }
  const items = await Subject.find(filter).populate({ path: 'course', select: 'code title', populate: { path: 'departmentRef', select: 'code name', model: 'Department' } }).sort({ code: 1 });
  res.json(items);
});

export const createSubject = asyncHandler(async (req, res) => {
  const { name, code, course, description } = req.body;
  if (!name || !code || !course) return res.status(400).json({ message: 'name, code, course are required' });
  if (!mongoose.isValidObjectId(course)) return res.status(400).json({ message: 'Invalid course id' });
  const c = await Course.findById(course);
  if (!c) return res.status(404).json({ message: 'Course not found' });
  const exists = await Subject.findOne({ code: String(code).toUpperCase() });
  if (exists) return res.status(409).json({ message: 'Subject code already exists' });
  const sub = await Subject.create({ name, code: String(code).toUpperCase(), course, description, createdBy: req.user?._id });
  res.status(201).json(sub);
});

export const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const body = { ...req.body };
  if (body.course) {
    if (!mongoose.isValidObjectId(body.course)) return res.status(400).json({ message: 'Invalid course id' });
    const c = await Course.findById(body.course);
    if (!c) return res.status(404).json({ message: 'Course not found' });
  }
  const item = await Subject.findByIdAndUpdate(id, body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ message: 'Subject not found' });
  res.json(item);
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const del = await Subject.findByIdAndDelete(id);
  if (!del) return res.status(404).json({ message: 'Subject not found' });
  res.json({ message: 'Subject deleted' });
});
