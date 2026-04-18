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
      trim: true,
    },
    round_order: {
      type: Number,
      default: 1,
      min: 1,
    },
    target_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    raised_amount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: "VND",
      trim: true,
    },
    equity_offered: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    valuation_pre_money: {
      type: Number,
      default: null,
      min: 0,
    },
    valuation_post_money: {
      type: Number,
      default: null,
      min: 0,
    },
    start_date: {
      type: Date,
      default: null,
    },
    end_date: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["upcoming", "open", "closed", "cancelled"],
      default: "upcoming",
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

fundingRoundSchema.index({ project_id: 1 });
fundingRoundSchema.index({ status: 1 });

const FundingRound = mongoose.model("FundingRound", fundingRoundSchema);
export default FundingRound;