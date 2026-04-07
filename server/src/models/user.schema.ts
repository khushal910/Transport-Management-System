import mongoose, { Document, Schema, Model } from 'mongoose';

type UserRole = 'manager' | 'driver' | 'dispatcher' | 'safety_officer' | 'financial_analyst';

interface IUser extends Document {
  name: string;
  email: string;
  password: string | null;
  isPasswordSet: boolean;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  pendingNewEmail?: string | null;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  role: UserRole;
  company?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
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
      default: null,
    },
    isPasswordSet: {
      type: Boolean,
      default: false,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    pendingNewEmail: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    emailVerificationToken: {
      type: String,
      default: null,
    },
    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ['manager', 'driver', 'dispatcher', 'safety_officer', 'financial_analyst'],
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.model('User', userSchema);
export { User, IUser, UserRole };
export default User;
