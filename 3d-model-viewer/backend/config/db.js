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
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
