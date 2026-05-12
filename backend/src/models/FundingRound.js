import mongoose from "mongoose";

const fundingRoundSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    round_name: {
      type: String,
      required: true,
    },
    target_amount: {
      type: Number,
      default: 0,
    },
    raised_amount: {
      type: Number,
      default: 0,
    },
    equity_offered: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["upcoming", "open", "closed", "cancelled"],
      default: "upcoming",
    },
    start_date: {
      type: String,
      default: "",
    },
    end_date: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("FundingRound", fundingRoundSchema);