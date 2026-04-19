import mongoose from "mongoose";

const adminLoginLogSchema = new mongoose.Schema(
  {
    admin_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    login_time: {
      type: Date,
      default: Date.now,
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
      default: null,
    },
    failure_reason: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

const AdminLoginLog = mongoose.model("AdminLoginLog", adminLoginLogSchema);
export default AdminLoginLog;