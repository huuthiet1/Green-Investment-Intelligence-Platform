const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message_type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    content: {
      type: String,
      default: null,
    },
    attachment_url: {
      type: String,
      default: null,
    },
    is_read: {
      type: Boolean,
      default: false,
    },
    read_at: {
      type: Date,
      default: null,
    },
    is_deleted_by_sender: {
      type: Boolean,
      default: false,
    },
    is_deleted_by_receiver: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ project_id: 1 });
messageSchema.index({ sender_id: 1 });
messageSchema.index({ receiver_id: 1 });
messageSchema.index({ is_read: 1 });
messageSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);