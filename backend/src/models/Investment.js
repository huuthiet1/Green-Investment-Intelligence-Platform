import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema(
  {
    investor_id: {
      type: String,
      default: "investor-demo",
    },

    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    funding_round_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FundingRound",
      required: false,
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
  },
  { timestamps: true }
);

export default mongoose.model("Investment", investmentSchema);