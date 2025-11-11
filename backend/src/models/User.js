import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { baseFields, baseOptions, applySoftDelete } from "./common.js";

const userSchema = new mongoose.Schema(
  {
    ...baseFields,

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
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
    },

    phone: {
      type: String,
      required: false,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    role: {
      type: String,
      enum: ["admin", "doctor", "receptionist", "pharmacist", "accountant", "patient"],
      required: true,
      default: "patient",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
      default: null,
    }
  },
  baseOptions
);

// Password hashing before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Soft delete support
applySoftDelete(userSchema);

// Search index
userSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  role: "text",
});

const User = mongoose.model("User", userSchema);
export default User;
