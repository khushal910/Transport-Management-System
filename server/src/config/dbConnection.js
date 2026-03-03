import mongoose from 'mongoose';

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Mongoose connection error:', err.message);
    process.exit(1);
  }
};

export default dbConnect;
