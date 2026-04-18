import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, "Họ và tên là bắt buộc"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    organization_name: {
      type: String,
      default: "",
      trim: true,
    },
    password: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "investor", "business"],
      default: "investor",
    },
    avatar_url: {
      type: String,
      default: "",
    },
    google_id: {
      type: String,
      default: "",
    },
    login_provider: {
      type: String,
      enum: ["local", "google", "otp"],
      default: "local",
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;