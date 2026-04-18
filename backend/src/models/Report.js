const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reported_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
    comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    message_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    report_type: {
      type: String,
      enum: ["project", "comment", "message", "user", "other"],
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    evidence_url: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "resolved", "rejected"],
      default: "pending",
    },
    handled_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    handled_note: {
      type: String,
      default: null,
    },
    handled_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ reporter_id: 1 });
reportSchema.index({ reported_user_id: 1 });
reportSchema.index({ project_id: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ report_type: 1 });
reportSchema.index({ handled_by: 1 });

module.exports = mongoose.model("Report", reportSchema);