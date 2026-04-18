const mongoose = require("mongoose");

const projectESGEvaluationSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    criterion_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ESGCriteria",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    note: {
      type: String,
      default: null,
    },
    evaluated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    evaluated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

projectESGEvaluationSchema.index(
  { project_id: 1, criterion_id: 1 },
  { unique: true }
);
projectESGEvaluationSchema.index({ project_id: 1 });
projectESGEvaluationSchema.index({ criterion_id: 1 });
projectESGEvaluationSchema.index({ evaluated_by: 1 });

module.exports = mongoose.model("ProjectESGEvaluation", projectESGEvaluationSchema);