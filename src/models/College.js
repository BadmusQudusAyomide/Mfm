import mongoose from "mongoose";


const CollegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    abbr: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Static method to get hardcoded colleges
CollegeSchema.statics.getHardcodedColleges = function () {
  return [
    { name: "College of Science, Engineering and Technology", abbr: "SET" },
    { name: "College of Health Sciences", abbr: "CHS" },
    {
      name: "Joint Universities Preliminary Examinations Board",
      abbr: "JUPEP",
    },
  ];
};

const College = mongoose.model("College", CollegeSchema);
export default College;
