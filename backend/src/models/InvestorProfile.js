import mongoose from "mongoose";

const investorProfileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    organization: { type: String, default: "" },

    preferred_categories: {
      type: [String],
      default: [],
    },

    min_budget: {
      type: Number,
      default: 0,
    },

    max_budget: {
      type: Number,
      default: 0,
    },

    preferred_risk: {
      type: String,
      enum: ["low", "medium", "high", "any"],
      default: "any",
    },

    min_esg_score: {
      type: Number,
      default: 0,
    },

    expected_roi: {
      type: Number,
      default: 0,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("InvestorProfile", investorProfileSchema);