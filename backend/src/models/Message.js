import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    conversation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },

    sender_id: {
      type: String,
      required: true,
    },

    receiver_id: {
      type: String,
      required: true,
    },

    message_type: {
      type: String,
      enum: ["text", "image", "file", "audio", "system"],
      default: "text",
    },

    content: {
      type: String,
      default: "",
    },

    attachment_url: {
      type: String,
      default: "",
    },

    attachment_name: {
      type: String,
      default: "",
    },

    is_read: {
      type: Boolean,
      default: false,
    },

    read_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);