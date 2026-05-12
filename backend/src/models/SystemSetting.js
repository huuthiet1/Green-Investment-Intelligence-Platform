import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
    },

    value: {
      type: mongoose.Schema.Types.Mixed,
      default: "",
    },

    group: {
      type: String,
      default: "general",
    },

    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("SystemSetting", systemSettingSchema);