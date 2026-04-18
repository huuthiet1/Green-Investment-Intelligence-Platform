import mongoose from "mongoose";

const emailOTPSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otp_code: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["login", "register", "verify_email"],
      default: "login",
    },
    expires_at: {
      type: Date,
      required: true,
    },
    is_used: {
      type: Boolean,
      default: false,
    },
    attempt_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const EmailOTP = mongoose.model("EmailOTP", emailOTPSchema);

export default EmailOTP;