import Event from "../models/Event.js";
import { cloudinary } from "../config/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all events (public)
export const getAllEvents = asyncHandler(async (req, res) => {
  const {
    category,
    q,
    upcoming,
    page = 1,
    limit = 20,
    sort = "date",
  } = req.query;

  const filter = { published: true };
  if (category) filter.category = category;
  if (upcoming === "true") {
    filter.date = { $gte: new Date() };
  }
  if (q) {
    const s = String(q).trim();
    filter.$or = [
      { title: new RegExp(s, "i") },
      { description: new RegExp(s, "i") },
      { location: new RegExp(s, "i") },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, events] = await Promise.all([
    Event.countDocuments(filter),
    Event.find(filter)
      .populate("createdBy", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
  ]);

  res.json({
    data: events,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// Get a specific event (public)
export const getEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id)
    .populate("createdBy", "name")
    .populate("attendees", "name");

  if (!event || !event.published) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.json({ data: event });
});

// Create a new event (admin only)
export const createEvent = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    category,
    isRecurring,
    recurringPattern,
    maxAttendees,
  } = req.body;

  if (!title || !description || !date || !startTime || !endTime || !location) {
    return res.status(400).json({
      message:
        "title, description, date, startTime, endTime, and location are required",
    });
  }

  let eventData = {
    title,
    description,
    date: new Date(date),
    startTime,
    endTime,
    location,
    category: category || "other",
    isRecurring: Boolean(isRecurring),
    recurringPattern,
    maxAttendees: maxAttendees ? Number(maxAttendees) : undefined,
    createdBy: req.user?._id,
  };

  // Handle image upload if provided
  if (req.file) {
    const buffer = req.file.buffer;
    const originalName = req.file.originalname;
    const folder = `events/${title.toLowerCase().replace(/\s+/g, "_")}`;

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
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

    eventData.image = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  }

  const event = await Event.create(eventData);
  res.status(201).json({ data: event });
});

// Update an event (admin only)
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title } = req.body;

  let updateData = { ...req.body };
  
  // Handle image upload if provided
  if (req.file) {
    // Delete old image if exists
    const oldEvent = await Event.findById(id);
    if (oldEvent?.image?.publicId) {
      try {
        await cloudinary.uploader.destroy(oldEvent.image.publicId);
      } catch (e) {
        console.error('Error deleting old image:', e);
      }
    }

    // Upload new image
    const buffer = req.file.buffer;
    const originalName = req.file.originalname;
    const folder = `events/${title?.toLowerCase().replace(/\s+/g, "_") || 'events'}`;

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
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

    updateData.image = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  }

  const event = await Event.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
});

// Delete an event (admin only)
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  // Delete image from Cloudinary if exists
  if (event.image?.publicId) {
    try {
      await cloudinary.uploader.destroy(event.image.publicId);
    } catch (e) {}
  }

  await event.deleteOne();
  res.json({ message: "Event deleted successfully" });
});

// Toggle event publish status (admin only)
export const toggleEventPublish = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { published } = req.body || {};

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  event.published = Boolean(published);
  await event.save();

  res.json({ id: event._id, published: event.published });
});

// RSVP to an event (authenticated users)
export const rsvpEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // "join" or "leave"

  const event = await Event.findById(id);
  if (!event || !event.published) {
    return res.status(404).json({ message: "Event not found" });
  }

  if (action === "join") {
    if (event.maxAttendees && event.currentAttendees >= event.maxAttendees) {
      return res.status(400).json({ message: "Event is full" });
    }
    if (!event.attendees.includes(req.user._id)) {
      event.attendees.push(req.user._id);
      event.currentAttendees += 1;
    }
  } else if (action === "leave") {
    const index = event.attendees.indexOf(req.user._id);
    if (index > -1) {
      event.attendees.splice(index, 1);
      event.currentAttendees = Math.max(0, event.currentAttendees - 1);
    }
  }

  await event.save();
  res.json({
    message: `Successfully ${action === "join" ? "joined" : "left"} event`,
    data: { currentAttendees: event.currentAttendees },
  });
});
