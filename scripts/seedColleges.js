import mongoose from "mongoose";
import College from "../src/models/College.js";
import { config } from "dotenv";

// Load environment variables
config();

const colleges = [
  { name: "College of Science, Engineering and Technology", abbr: "SET" },
  { name: "College of Health Sciences", abbr: "CHS" },
  { name: "Joint Universities Preliminary Examinations Board", abbr: "JUPEP" },
];

async function seedColleges() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing colleges
    await College.deleteMany({});
    console.log("Cleared existing colleges");

    // Insert hardcoded colleges
    const insertedColleges = await College.insertMany(colleges);
    console.log(
      "Inserted colleges:",
      insertedColleges.map((c) => c.abbr)
    );

    console.log("College seeding completed successfully");
  } catch (error) {
    console.error("Error seeding colleges:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the seeding function
seedColleges();
