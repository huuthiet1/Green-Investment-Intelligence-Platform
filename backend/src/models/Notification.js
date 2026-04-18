const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["system", "interest", "project", "esg", "admin"],
      default: "system",
    },
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

notificationSchema.index({ user_id: 1 });
notificationSchema.index({ is_read: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ created_at: 1 });

module.exports = mongoose.model("Notification", notificationSchema);