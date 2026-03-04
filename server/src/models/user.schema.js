import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [
        'manager',
        'driver',
        'dispatcher',
        'safety_officer',
        'financial_analyst',
      ],
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
