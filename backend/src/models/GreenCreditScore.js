import mongoose from "mongoose";

const greenCreditScoreSchema = new mongoose.Schema(
  {
    business_id: {
      type: String,
      required: true,
    },

    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    business_name: {
      type: String,
      default: "",
    },

    current_ratio: { type: Number, default: 0 },
    quick_ratio: { type: Number, default: 0 },
    debt_to_equity: { type: Number, default: 0 },
    debt_to_asset: { type: Number, default: 0 },
    roe: { type: Number, default: 0 },
    roa: { type: Number, default: 0 },
    ebitda_margin: { type: Number, default: 0 },
    operating_cash_flow_to_debt: { type: Number, default: 0 },

    energy_saving_rate: { type: Number, default: 0 },
    recycled_material_rate: { type: Number, default: 0 },
    carbon_reduction_rate: { type: Number, default: 0 },
    waste_treatment_rate: { type: Number, default: 0 },
    green_certificate_score: { type: Number, default: 0 },
    governance_score: { type: Number, default: 0 },

    financial_score: { type: Number, default: 0 },
    esg_score: { type: Number, default: 0 },
    total_score: { type: Number, default: 0 },

    rating: {
      type: String,
      enum: ["A", "B", "C", "D"],
      default: "D",
    },

    risk_level: {
      type: String,
      enum: ["low", "medium", "high", "very_high"],
      default: "very_high",
    },

    probability_of_default: { type: Number, default: 0 },
    loss_given_default: { type: Number, default: 0 },
    exposure_at_default: { type: Number, default: 0 },
    expected_loss: { type: Number, default: 0 },

    suggested_interest_rate: { type: Number, default: 0 },

    loan_recommendation: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("GreenCreditScore", greenCreditScoreSchema);