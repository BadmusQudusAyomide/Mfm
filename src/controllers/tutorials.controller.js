import { cloudinary } from '../config/cloudinary.js';
import Course from '../models/Course.js';
import Subject from '../models/Subject.js';
import Tutorial from '../models/Tutorial.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Courses
export const listCourses = asyncHandler(async (req, res) => {
  const { level, department, q, published, page = 1, limit = 20, sort = 'level code' } = req.query;
  const filter = {};
  if (level) filter.level = level;
  if (department) filter.department = department;
  if (typeof published !== 'undefined') filter.published = String(published) === 'true';
  if (q) {
    const s = String(q).trim();
    filter.$or = [{ title: new RegExp(s, 'i') }, { code: new RegExp(s, 'i') }];
  }
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;
  const [total, courses] = await Promise.all([
    Course.countDocuments(filter),
    Course.find(filter).sort(sort).skip(skip).limit(limitNum),
  ]);
  res.json({ data: courses, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
});

export const createCourse = asyncHandler(async (req, res) => {
  const { code, title, level, department, description } = req.body;
  if (!code || !title || !level || !department) {
    return res.status(400).json({ message: 'code, title, level, department are required' });
  }
  const exists = await Course.findOne({ code: code.toUpperCase() });
  if (exists) return res.status(409).json({ message: 'Course code already exists' });
  const course = await Course.create({ code: code.toUpperCase(), title, level, department, description, createdBy: req.user?._id });
  res.status(201).json(course);
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const course = await Course.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await Course.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ message: 'Course not found' });
  res.json({ message: 'Course deleted' });
});

export const toggleCoursePublish = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { published } = req.body || {};
  const course = await Course.findById(id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  course.published = Boolean(published);
  await course.save();
  res.json({ id: course._id, published: course.published });
});

// Tutorials
export const listTutorialsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { q, published, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const filter = { course: courseId };
  if (typeof published !== 'undefined') filter.published = String(published) === 'true';
  if (q) {
    const s = String(q).trim();
    filter.$or = [{ title: new RegExp(s, 'i') }, { description: new RegExp(s, 'i') }];
  }
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;
  const [total, tutorials] = await Promise.all([
    Tutorial.countDocuments(filter),
    Tutorial.find(filter).sort(sort).skip(skip).limit(limitNum),
  ]);
  res.json({ data: tutorials, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
});

// New: Tutorials per subject
export const listTutorialsBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const { q, published, page = 1, limit = 20, sort = '-createdAt' } = req.query;
  const filter = { subject: subjectId };
  if (typeof published !== 'undefined') filter.published = String(published) === 'true';
  if (q) {
    const s = String(q).trim();
    filter.$or = [{ title: new RegExp(s, 'i') }, { description: new RegExp(s, 'i') }];
  }
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;
  const [total, tutorials] = await Promise.all([
    Tutorial.countDocuments(filter),
    Tutorial.find(filter).sort(sort).skip(skip).limit(limitNum),
  ]);
  res.json({ data: tutorials, pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) } });
});

export const uploadTutorialPDF = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title, description } = req.body;
  if (!req.file) return res.status(400).json({ message: 'PDF file is required' });
  if (!title) return res.status(400).json({ message: 'title is required' });

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  // Upload to Cloudinary as raw file (PDF)
  const buffer = req.file.buffer;
  const originalName = req.file.originalname;
  const bytes = req.file.size;

  const folder = `tutorials/${course.code}`;

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder,
        use_filename: true,
        unique_filename: true,
        filename_override: originalName,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

  const tutorial = await Tutorial.create({
    subject: undefined, // legacy path: no subject specified
    course: course._id,
    title,
    description,
    pdf: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      bytes,
      originalName,
      contentType: 'application/pdf',
    },
    uploadedBy: req.user?._id,
  });

  res.status(201).json(tutorial);
});

// New: upload by subject
export const uploadTutorialPDFBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const { title, description } = req.body;
  if (!req.file) return res.status(400).json({ message: 'PDF file is required' });
  if (!title) return res.status(400).json({ message: 'title is required' });

  const subject = await Subject.findById(subjectId).populate('course');
  if (!subject) return res.status(404).json({ message: 'Subject not found' });

  // Upload to Cloudinary as raw file (PDF)
  const buffer = req.file.buffer;
  const originalName = req.file.originalname;
  const bytes = req.file.size;

  // Use course code if available for folder naming
  const courseCode = subject.course?.code || String(subject.course || 'unknown');
  const folder = `tutorials/${courseCode}`;

  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        folder,
        use_filename: true,
        unique_filename: true,
        filename_override: originalName,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

  const tutorial = await Tutorial.create({
    subject: subject._id,
    course: subject.course?._id, // backfill legacy for now
    title,
    description,
    pdf: {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      bytes,
      originalName,
      contentType: 'application/pdf',
    },
    uploadedBy: req.user?._id,
  });

  res.status(201).json(tutorial);
});

export const viewPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const t = await Tutorial.findById(id);
  if (!t) return res.status(404).json({ message: 'Tutorial not found' });
  // For viewing in browser, redirect to the secure URL
  return res.redirect(t.pdf.url);
});

export const downloadPDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const t = await Tutorial.findById(id);
  if (!t) return res.status(404).json({ message: 'Tutorial not found' });
  // Force download using Cloudinary attachment flag
  // For raw resources, appending `?fl_attachment` triggers download
  const downloadUrl = `${t.pdf.url}${t.pdf.url.includes('?') ? '&' : '?'}fl_attachment`;
  return res.redirect(downloadUrl);
});

export const updateTutorial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tut = await Tutorial.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
  if (!tut) return res.status(404).json({ message: 'Tutorial not found' });
  res.json(tut);
});

export const deleteTutorial = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tut = await Tutorial.findById(id);
  if (!tut) return res.status(404).json({ message: 'Tutorial not found' });
  // Attempt to delete from Cloudinary best-effort
  try { if (tut.pdf?.publicId) { await cloudinary.uploader.destroy(tut.pdf.publicId, { resource_type: 'raw' }); } } catch (e) {}
  await tut.deleteOne();
  res.json({ message: 'Tutorial deleted' });
});

export const toggleTutorialPublish = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { published } = req.body || {};
  const tut = await Tutorial.findById(id);
  if (!tut) return res.status(404).json({ message: 'Tutorial not found' });
  tut.published = Boolean(published);
  await tut.save();
  res.json({ id: tut._id, published: tut.published });
});
