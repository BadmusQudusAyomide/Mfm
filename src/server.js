import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';


const PORT = process.env.PORT || 4000;

async function start() {
  try {
    // Configure Cloudinary (if env set)
    configureCloudinary();
    // Attempt DB connection if URI provided
    const uri = process.env.MONGO_URI;
    if (uri) {
      try {
        await connectDB(uri);
        console.log('MongoDB connected');
      } catch (dbErr) {
        console.error('MongoDB connection failed:', dbErr?.message || dbErr);
        console.warn('Continuing to start server without database connection.');
      }
    } else {
      console.warn('MONGO_URI not set. Running without database. Set it in .env to enable DB.');
    }

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
