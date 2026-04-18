const mongoose = require("mongoose");

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
      required: true,
      min: 0,
      max: 100,
    },
    social_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    governance_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    total_score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    esg_level: {
      type: String,
      enum: ["excellent", "good", "average", "poor"],
      default: null,
    },
    evaluation_note: {
      type: String,
      default: null,
    },
    scored_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    scored_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

esgScoreSchema.index({ total_score: 1 });
esgScoreSchema.index({ esg_level: 1 });
esgScoreSchema.index({ scored_by: 1 });

module.exports = mongoose.model("ESGScore", esgScoreSchema);