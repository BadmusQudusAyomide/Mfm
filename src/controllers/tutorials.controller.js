import { cloudinary } from "../config/cloudinary.js";
import College from "../models/College.js";
import Course from "../models/Course.js";
import Tutorial from "../models/Tutorial.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get hardcoded colleges (SET, CHS, JUPEP)
export const getColleges = asyncHandler(async (req, res) => {
  const colleges = College.getHardcodedColleges();
  res.json({ data: colleges });
});

// Get courses for a specific college
export const getCoursesByCollege = asyncHandler(async (req, res) => {
  const { collegeAbbr } = req.params;
  const {
    level,
    q,
    published,
    page = 1,
    limit = 20,
    sort = "level code",
  } = req.query;

  // Find the college by abbreviation
  const college = await College.findOne({ abbr: collegeAbbr.toUpperCase() });
  if (!college) {
    return res.status(404).json({ message: "College not found" });
  }

  const filter = { colleges: college._id }; // Updated to use colleges array
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
    Course.find(filter).sort(sort).skip(skip).limit(limitNum),
  ]);

  res.json({
    data: courses,
    college: { name: college.name, abbr: college.abbr },
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// Get topics (tutorials) for a specific course
export const getTopicsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const {
    q,
    published,
    type,
    page = 1,
    limit = 20,
    sort = "-createdAt",
  } = req.query;

  // Verify course exists
  const course = await Course.findById(courseId).populate("colleges");
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const filter = { course: courseId };
  if (typeof published !== "undefined")
    filter.published = String(published) === "true";
  if (type) filter.type = type;
  if (q) {
    const s = String(q).trim();
    filter.$or = [
      { title: new RegExp(s, "i") },
      { topic: new RegExp(s, "i") },
      { description: new RegExp(s, "i") },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, topics] = await Promise.all([
    Tutorial.countDocuments(filter),
    Tutorial.find(filter).sort(sort).skip(skip).limit(limitNum),
  ]);

  res.json({
    data: topics,
    course: {
      code: course.code,
      title: course.title,
      level: course.level,
      colleges: course.colleges,
    },
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// Get a specific topic document
export const getTopicDocument = asyncHandler(async (req, res) => {
  const { topicId } = req.params;

  const topic = await Tutorial.findById(topicId)
    .populate("course")
    .populate("uploadedBy", "name email");

  if (!topic) {
    return res.status(404).json({ message: "Topic not found" });
  }

  res.json({ data: topic });
});

// Upload a new topic document (admin only)
export const uploadTopicDocument = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { topic, title, description, type = "pdf" } = req.body;

  if (!req.file) return res.status(400).json({ message: "File is required" });
  if (!topic || !title)
    return res.status(400).json({ message: "topic and title are required" });

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  const buffer = req.file.buffer;
  const originalName = req.file.originalname;
  const bytes = req.file.size;
  const folder = `tutorials/${course.code}/${topic}`;

  let uploadResult;
  let tutorialData = {
    course: course._id,
    topic,
    title,
    description,
    type,
    uploadedBy: req.user?._id,
  };

  if (type === "pdf") {
    uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
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

    tutorialData.pdf = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      bytes,
      originalName,
      contentType: "application/pdf",
    };
  } else if (type === "video") {
    uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
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

    tutorialData.video = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      bytes,
      originalName,
      duration: uploadResult.duration,
      thumbnail: uploadResult.thumbnail_url,
    };
  }

  const tutorial = await Tutorial.create(tutorialData);
  res.status(201).json({ data: tutorial });
});

// Update a topic document (admin only)
export const updateTopicDocument = asyncHandler(async (req, res) => {
  const { topicId } = req.params;

  const topic = await Tutorial.findByIdAndUpdate(topicId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!topic) return res.status(404).json({ message: "Topic not found" });
  res.json({ data: topic });
});

// Delete a topic document (admin only)
export const deleteTopicDocument = asyncHandler(async (req, res) => {
  const { topicId } = req.params;

  const topic = await Tutorial.findById(topicId);
  if (!topic) return res.status(404).json({ message: "Topic not found" });

  // Delete from Cloudinary
  try {
    if (topic.pdf?.publicId) {
      await cloudinary.uploader.destroy(topic.pdf.publicId, {
        resource_type: "raw",
      });
    }
    if (topic.video?.publicId) {
      await cloudinary.uploader.destroy(topic.video.publicId, {
        resource_type: "video",
      });
    }
  } catch (e) {}

  await topic.deleteOne();
  res.json({ message: "Topic deleted successfully" });
});

// Toggle topic publish status (admin only)
export const toggleTopicPublish = asyncHandler(async (req, res) => {
  const { topicId } = req.params;
  const { published } = req.body || {};

  const topic = await Tutorial.findById(topicId);
  if (!topic) return res.status(404).json({ message: "Topic not found" });

  topic.published = Boolean(published);
  await topic.save();

  res.json({ id: topic._id, published: topic.published });
});

// View PDF document
export const viewPDF = asyncHandler(async (req, res) => {
  const { topicId } = req.params;

  const topic = await Tutorial.findById(topicId);
  if (!topic) return res.status(404).json({ message: "Topic not found" });

  if (topic.type !== "pdf") {
    return res
      .status(400)
      .json({ message: "This topic is not a PDF document" });
  }

  // Redirect to the secure URL for viewing in browser
  return res.redirect(topic.pdf.url);
});

// Download PDF document
export const downloadPDF = asyncHandler(async (req, res) => {
  const { topicId } = req.params;

  const topic = await Tutorial.findById(topicId);
  if (!topic) return res.status(404).json({ message: "Topic not found" });

  if (topic.type !== "pdf") {
    return res
      .status(400)
      .json({ message: "This topic is not a PDF document" });
  }

  // Force download using Cloudinary attachment flag
  const downloadUrl = `${topic.pdf.url}${
    topic.pdf.url.includes("?") ? "&" : "?"
  }fl_attachment`;
  return res.redirect(downloadUrl);
});

// Get video stream
export const getVideo = asyncHandler(async (req, res) => {
  const { topicId } = req.params;

  const topic = await Tutorial.findById(topicId);
  if (!topic) return res.status(404).json({ message: "Topic not found" });

  if (topic.type !== "video") {
    return res.status(400).json({ message: "This topic is not a video" });
  }

  // Redirect to the video URL
  return res.redirect(topic.video.url);
});
