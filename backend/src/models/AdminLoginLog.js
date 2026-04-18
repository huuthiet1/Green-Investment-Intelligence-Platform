const mongoose = require("mongoose");

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
      default: null,
    },
    user_agent: {
      type: String,
      default: null,
    },
    device_info: {
      type: String,
      default: null,
    },
    face_confidence: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    failure_reason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

adminLoginLogSchema.index({ admin_user_id: 1 });
adminLoginLogSchema.index({ login_time: 1 });
adminLoginLogSchema.index({ login_status: 1 });

module.exports = mongoose.model("AdminLoginLog", adminLoginLogSchema);