import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      default: "business-demo",
    },

    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: [
        "system",
        "interest",
        "project",
        "esg",
        "funding",
        "message",

        // THEM
        "report",
        "user",
        "admin",
      ],
      default: "system",
    },

    is_read: {
      type: Boolean,
      default: false,
    },

    action_url: {
      type: String,
      default: "",
    },

    metadata: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);