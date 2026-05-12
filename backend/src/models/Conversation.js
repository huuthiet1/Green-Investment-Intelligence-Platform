import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false,
    },
    participants: [
      {
        type: String,
        required: true,
      },
    ],
    title: {
      type: String,
      default: "Cuộc trò chuyện",
    },
    last_message: {
      type: String,
      default: "",
    },
    last_message_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", conversationSchema);