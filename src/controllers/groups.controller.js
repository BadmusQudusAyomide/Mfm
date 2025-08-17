import { Group } from '../models/Group.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find().sort({ createdAt: -1 });
  res.json(groups);
});

export const createGroup = asyncHandler(async (req, res) => {
  const { name, description, type } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  const exists = await Group.findOne({ name });
  if (exists) return res.status(409).json({ message: 'Group name already exists' });
  const group = await Group.create({ name, description, type });
  res.status(201).json(group);
});

export const getGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json(group);
});

export const updateGroup = asyncHandler(async (req, res) => {
  const { name, description, type } = req.body;
  const group = await Group.findByIdAndUpdate(
    req.params.id,
    { name, description, type },
    { new: true, runValidators: true }
  );
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json(group);
});

export const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findByIdAndDelete(req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found' });
  res.json({ message: 'Group deleted' });
});
