import mongoose, { Connection } from 'mongoose';

/**
 * Database connection utility
 * Initializes MongoDB connection using Mongoose
 */
const dbConnect = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
  } catch (err: any) {
    console.error('Mongoose connection error:', err.message);
    process.exit(1);
  }
};

export default dbConnect;
