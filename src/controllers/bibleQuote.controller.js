import BibleQuote from "../models/BibleQuote.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get current active Bible quote (changes every 24 hours)
export const getCurrentQuote = asyncHandler(async (req, res) => {
  const now = new Date();

  // Find the current active quote that hasn't expired
  let quote = await BibleQuote.findOne({
    isActive: true,
    expiresAt: { $gt: now },
  });

  // If no active quote, get a random one and make it active for 24 hours
  if (!quote) {
    const allQuotes = await BibleQuote.find({ isActive: false });
    if (allQuotes.length === 0) {
      return res.status(404).json({ message: "No Bible quotes available" });
    }

    // Select random quote
    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    quote = allQuotes[randomIndex];

    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Update quote to be active
    quote.isActive = true;
    quote.expiresAt = expiresAt;
    await quote.save();
  }

  res.json({ data: quote });
});

// Get all Bible quotes (admin only)
export const getAllQuotes = asyncHandler(async (req, res) => {
  const { category, q, page = 1, limit = 20, sort = "-createdAt" } = req.query;

  const filter = {};
  if (category) filter.category = category;
  if (q) {
    const s = String(q).trim();
    filter.$or = [
      { verse: new RegExp(s, "i") },
      { reference: new RegExp(s, "i") },
      { text: new RegExp(s, "i") },
    ];
  }

  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, quotes] = await Promise.all([
    BibleQuote.countDocuments(filter),
    BibleQuote.find(filter).sort(sort).skip(skip).limit(limitNum),
  ]);

  res.json({
    data: quotes,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    },
  });
});

// Create a new Bible quote (admin only)
export const createQuote = asyncHandler(async (req, res) => {
  const { verse, reference, text, translation, category } = req.body;

  if (!verse || !reference || !text) {
    return res.status(400).json({
      message: "verse, reference, and text are required",
    });
  }

  // Set expiration to 24 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const quote = await BibleQuote.create({
    verse,
    reference,
    text,
    translation: translation || "NIV",
    category,
    expiresAt,
    createdBy: req.user?._id,
  });

  res.status(201).json({ data: quote });
});

// Update a Bible quote (admin only)
export const updateQuote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const quote = await BibleQuote.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!quote) {
    return res.status(404).json({ message: "Quote not found" });
  }

  res.json({ data: quote });
});

// Delete a Bible quote (admin only)
export const deleteQuote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await BibleQuote.findByIdAndDelete(id);
  if (!deleted) {
    return res.status(404).json({ message: "Quote not found" });
  }

  res.json({ message: "Quote deleted successfully" });
});

// Manually rotate to a new quote (admin only)
export const rotateQuote = asyncHandler(async (req, res) => {
  // Deactivate current active quote
  await BibleQuote.updateMany({ isActive: true }, { isActive: false });

  // Get a random inactive quote
  const inactiveQuotes = await BibleQuote.find({ isActive: false });
  if (inactiveQuotes.length === 0) {
    return res.status(404).json({ message: "No inactive quotes available" });
  }

  const randomIndex = Math.floor(Math.random() * inactiveQuotes.length);
  const newQuote = inactiveQuotes[randomIndex];

  // Set expiration to 24 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  // Activate new quote
  newQuote.isActive = true;
  newQuote.expiresAt = expiresAt;
  await newQuote.save();

  res.json({
    message: "Quote rotated successfully",
    data: newQuote,
  });
});
