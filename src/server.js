import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';

dotenv.config();


const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // Configure Cloudinary (if env set)
    configureCloudinary();
    // Attempt DB connection if URI provided
    const uri = process.env.MONGO_URI;
    if (uri) {
      await connectDB(uri);
      console.log('MongoDB connected');
    } else {
      console.warn('MONGO_URI not set. Running without database. Set it in .env to enable DB.');
    }

    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
