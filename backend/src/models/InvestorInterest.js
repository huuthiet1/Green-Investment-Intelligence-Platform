import mongoose from "mongoose";

const investorInterestSchema = new mongoose.Schema(
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

    message: {
      type: String,
      default: "",
    },

    estimated_budget: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "interested",
        "contacted",
        "negotiating",
        "invested",
        "cancelled",
        "pending",
      ],
      default: "interested",
    },
  },
  { timestamps: true }
);

investorInterestSchema.index(
  { investor_id: 1, project_id: 1 },
  { unique: true }
);

export default mongoose.model("InvestorInterest", investorInterestSchema);