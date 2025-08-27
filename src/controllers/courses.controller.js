import Course from "../models/Course.js";
import College from "../models/College.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all courses (admin only)
export const getAllCourses = asyncHandler(async (req, res) => {
  const {
    college,
    level,
    q,
    published,
    page = 1,
    limit = 20,
    sort = "level code",
  } = req.query;

  const filter = {};
  if (college) filter.colleges = college; // Updated to use colleges array
  if (level) filter.level = level;
  if (typeof published !== "undefined")
    filter.published = String(published) === "true";
  if (q) {
    const s = String(q).trim();
    filter.$or = [{ title: new RegExp(s, "i") }, { code: new RegExp(s, "i") }];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, courses] = await Promise.all([
    Course.countDocuments(filter),
    Course.find(filter)
      .populate("colleges", "name abbr")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
  ]);

  res.json({
    data: courses,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// Create a new course (admin only)
export const createCourse = asyncHandler(async (req, res) => {
  const { code, title, level, colleges, description } = req.body;

  if (
    !code ||
    !title ||
    !level ||
    !colleges ||
    !Array.isArray(colleges) ||
    colleges.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "code, title, level, and colleges array are required" });
  }

  // Verify all colleges exist
  const collegeDocs = await College.find({ _id: { $in: colleges } });
  if (collegeDocs.length !== colleges.length) {
    return res.status(404).json({ message: "One or more colleges not found" });
  }

  // Check if course code already exists
  const exists = await Course.findOne({ code: code.toUpperCase() });
  if (exists) {
    return res.status(409).json({ message: "Course code already exists" });
  }

  const course = await Course.create({
    code: code.toUpperCase(),
    title,
    level,
    colleges: collegeDocs.map((c) => c._id),
    description,
    createdBy: req.user?._id,
  });

  res.status(201).json({ data: course });
});

// Update a course (admin only)
export const updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // If colleges are being updated, verify they exist
  if (req.body.colleges && Array.isArray(req.body.colleges)) {
    const collegeDocs = await College.find({ _id: { $in: req.body.colleges } });
    if (collegeDocs.length !== req.body.colleges.length) {
      return res
        .status(404)
        .json({ message: "One or more colleges not found" });
    }
  }

  const course = await Course.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  res.json({ data: course });
});

// Delete a course (admin only)
export const deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await Course.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ message: "Course not found" });
  }

  res.json({ message: "Course deleted successfully" });
});

// Toggle course publish status (admin only)
export const toggleCoursePublish = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { published } = req.body || {};

  const course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  course.published = Boolean(published);
  await course.save();

  res.json({ id: course._id, published: course.published });
});
