import mongoose from "mongoose";

const BibleQuoteSchema = new mongoose.Schema(
  {
    verse: { type: String, required: true, trim: true },
    reference: { type: String, required: true, trim: true }, // e.g., "John 3:16"
    text: { type: String, required: true, trim: true },
    translation: { type: String, default: "NIV" },
    category: { type: String, trim: true }, // e.g., "love", "faith", "hope"
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true }, // 24 hours from creation
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

BibleQuoteSchema.index({ isActive: 1, expiresAt: 1 });
BibleQuoteSchema.index({ category: 1 });

const BibleQuote = mongoose.model("BibleQuote", BibleQuoteSchema);
export default BibleQuote;
