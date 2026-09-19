import mongoose from 'mongoose';

const DEFAULT_URI = 'mongodb://127.0.0.1:27017/restaurantQR';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('<username>')
    ? process.env.MONGODB_URI
    : DEFAULT_URI;

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('MongoDB connection unavailable. Continuing with in-memory/local fallback mode.', error.message);
  }
};

export default connectDB;
