import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import { Role } from "@/types/permissions";

export interface IUser extends Document {
  _id: any;
  name: string;
  email: string;
  password: string;
  role: Role;
  mobile?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: Date;
  internRef?: mongoose.Types.ObjectId;
  department?: string;
  position?: string;
  createdBy?: mongoose.Types.ObjectId;
  twoFactorEnabled?: boolean;
  sessionToken?: string;
  passwordChangedAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  preferences: {
    theme: "light" | "dark" | "system";
    color: "zinc" | "slate" | "stone" | "gray" | "neutral" | "red" | "rose" | "orange" | "green" | "blue" | "yellow" | "violet";
    language: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    compactMode: boolean;
    timezone: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email format",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: [
        "admin",
        "intern",
        "employee",
        "hr_manager",
        "finance_manager",
        "marketing_manager",
      ],
      required: [true, "Role is required"],
    },
    mobile: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    internRef: { type: Schema.Types.ObjectId, ref: "Intern" },
    department: { type: String, trim: true },
    position: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    twoFactorEnabled: { type: Boolean, default: false },
    sessionToken: { type: String, select: false },
    passwordChangedAt: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      color: {
        type: String,
        enum: ["zinc", "slate", "stone", "gray", "neutral", "red", "rose", "orange", "green", "blue", "yellow", "violet"],
        default: "zinc",
      },
      language: { type: String, default: "en" },
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      compactMode: { type: Boolean, default: false },
      timezone: { type: String, default: "Asia/Colombo" },
    },
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next: any) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    if (!this.isNew) this.passwordChangedAt = new Date();
    next();
  } catch (error) {
    next(error as Error);
  }
});

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

UserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

UserSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < new Date()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }
  const updates: any = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.isLocked()) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  }
  await this.updateOne(updates);
};

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);