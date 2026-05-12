import mongoose from "mongoose";

const adminLoginLogSchema = new mongoose.Schema(
  {
    admin_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    login_status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
    ip_address: {
      type: String,
      default: "",
    },
    user_agent: {
      type: String,
      default: "",
    },
    device_info: {
      type: String,
      default: "",
    },
    face_confidence: {
      type: Number,
      default: 0,
    },
    failure_reason: {
      type: String,
      default: "",
    },
    login_time: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const AdminLoginLog = mongoose.model("AdminLoginLog", adminLoginLogSchema);

export default AdminLoginLog;