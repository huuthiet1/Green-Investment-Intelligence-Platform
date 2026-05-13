import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    investor_id: {
      type: String,
      required: true,
    },

    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    funding_round_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FundingRound",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      default: 0,
    },

    note: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    rejection_reason: {
      type: String,
      default: "",
    },

    approved_at: {
      type: Date,
      default: null,
    },

    rejected_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Investment", investmentSchema);