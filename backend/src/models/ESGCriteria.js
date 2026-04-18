const mongoose = require("mongoose");

const esgCriteriaSchema = new mongoose.Schema(
  {
    criterion_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    criterion_name: {
      type: String,
      required: true,
      trim: true,
    },
    pillar: {
      type: String,
      enum: ["E", "S", "G"],
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    max_score: {
      type: Number,
      default: 100,
      min: 1,
    },
    data_type: {
      type: String,
      enum: ["number", "boolean", "text", "select"],
      default: "number",
    },
    input_hint: {
      type: String,
      default: null,
    },
    is_required: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    sort_order: {
      type: Number,
      default: 1,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

esgCriteriaSchema.index({ criterion_code: 1 }, { unique: true });
esgCriteriaSchema.index({ pillar: 1 });
esgCriteriaSchema.index({ is_active: 1 });
esgCriteriaSchema.index({ sort_order: 1 });

module.exports = mongoose.model("ESGCriteria", esgCriteriaSchema);