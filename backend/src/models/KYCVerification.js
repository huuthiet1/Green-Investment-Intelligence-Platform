import mongoose from "mongoose";

const kycVerificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    user_role: {
      type: String,
      enum: ["business", "investor"],
      required: true,
    },

    full_name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      default: "",
    },

    organization_name: {
      type: String,
      default: "",
    },

    tax_code: {
      type: String,
      default: "",
    },

    document_type: {
      type: String,
      enum: [
        "cccd",
        "business_license",
        "tax_certificate",
        "investment_license",
        "other",
      ],
      default: "other",
    },

    document_url: {
      type: String,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "reviewing", "approved", "rejected"],
      default: "pending",
    },

    admin_note: {
      type: String,
      default: "",
    },

    reviewed_by: {
      type: String,
      default: "",
    },

    reviewed_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("KYCVerification", kycVerificationSchema);