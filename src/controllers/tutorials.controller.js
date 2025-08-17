import { cloudinary } from '../config/cloudinary.js';
import Course from '../models/Course.js';
import Tutorial from '../models/Tutorial.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Courses
export const listCourses = asyncHandler(async (req, res) => {
  const { level, department } = req.query;
  const filter = {};
  if (level) filter.level = level;
  if (department) filter.department = department;
  const courses = await Course.find(filter).sort({ level: 1, code: 1 });
  res.json(courses);
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

// Tutorials
export const listTutorialsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const tutorials = await Tutorial.find({ course: courseId }).sort({ createdAt: -1 });
  res.json(tutorials);
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
