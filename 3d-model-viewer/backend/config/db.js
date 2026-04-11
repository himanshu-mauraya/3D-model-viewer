import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("\n❌ FATAL ERROR: MONGODB_URI environment variable is not defined!");
      console.error("👉 To fix this in Render: Go to your Web Service Dashboard -> Environment -> Environment Variables.");
      console.error("👉 Add a new variable named 'MONGODB_URI' and paste your MongoDB connection string.\n");
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('\n⚠️ WARNING: Database connection failed!');
    console.error('⚠️ Your MongoDB cluster may be deleted or paused (ENOTFOUND).');
    console.error('⚠️ The server will continue running, but database features will return 500 errors.');
    console.error('Error details:', error.message);
    // process.exit(1); -> Removed to allow the server to boot even if DB is dead
  }
};

export default connectDB;
