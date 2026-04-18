import mongoose from "mongoose";

const investorInterestSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    investor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    estimated_budget: {
      type: Number,
      default: null,
      min: 0,
    },
    status: {
      type: String,
      enum: ["interested", "contacted", "negotiating", "invested", "cancelled"],
      default: "interested",
    },
  },
  { timestamps: true }
);

investorInterestSchema.index({ project_id: 1 });
investorInterestSchema.index({ investor_id: 1 });
investorInterestSchema.index({ status: 1 });

const InvestorInterest = mongoose.model("InvestorInterest", investorInterestSchema);
export default InvestorInterest;