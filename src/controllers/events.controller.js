import { Event } from '../models/Event.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listEvents = asyncHandler(async (req, res) => {
  const events = await Event.find().sort({ startsAt: 1 });
  res.json(events);
});

export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, startsAt, endsAt, location } = req.body;
  if (!title || !startsAt) return res.status(400).json({ message: 'title and startsAt are required' });
  const event = await Event.create({ title, description, startsAt, endsAt, location });
  res.status(201).json(event);
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

export const updateEvent = asyncHandler(async (req, res) => {
  const { title, description, startsAt, endsAt, location } = req.body;
  const event = await Event.findByIdAndUpdate(
    req.params.id,
    { title, description, startsAt, endsAt, location },
    { new: true, runValidators: true }
  );
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json(event);
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  res.json({ message: 'Event deleted' });
});
