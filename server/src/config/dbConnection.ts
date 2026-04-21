import mongoose, { Connection } from 'mongoose';
import runtimeConfig from './runtime';

/**
 * Database connection utility
 * Initializes MongoDB connection using Mongoose
 */
const dbConnect = async (): Promise<void> => {
  try {
    const mongoUri = runtimeConfig.mongoUri;
    
    if (!mongoUri) {
      throw new Error('MONGO_URI environment variable is not defined');
    }

    await mongoose.connect(mongoUri);
  } catch (err: any) {
    console.error('Mongoose connection error:', err.message);
    process.exit(1);
  }
};

export default dbConnect;
