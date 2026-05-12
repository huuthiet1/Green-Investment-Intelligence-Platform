import mongoose from "mongoose";

const esgScoreSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      unique: true,
    },
    environment_score: {
      type: Number,
      default: 0,
    },
    social_score: {
      type: Number,
      default: 0,
    },
    governance_score: {
      type: Number,
      default: 0,
    },
    total_score: {
      type: Number,
      default: 0,
    },
    esg_level: {
      type: String,
      enum: ["excellent", "good", "average", "poor"],
      default: "poor",
    },
    evaluation_note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ESGScore", esgScoreSchema);