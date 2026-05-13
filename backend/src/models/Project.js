
import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    project_code: String,
    title: {
      type: String,
      required: true,
    },
    slug: String,
    short_description: String,
    description: String,

    category_id: String,
    category_name: {
      type: String,
      default: "",
    },

    location_id: String,
    status_id: String,

    status: {
      type: String,
      default: "pending",
    },

    reviewer_status: {
      type: String,
      enum: ["pending", "approved", "rejected", "reviewing","suspended"],
      default: "pending",
    },
    review_note: {
      type: String,
      default: "",
    },
    review_by: {
      type: String,
      default: "",
    },
review_at:{
      type: Date,
      default: null,

},

ai_risk_score: {
  type: Number,
  default: 0,
},

ai_risk_level: {
  type: String,
  enum: ["low", "medium", "high"],
  default: "low",
},

ai_risk_flags: {
  type: [String],
  default: [],
},
    capital_needed: {
      type: Number,
      default: 0,
    },
    capital_currency: {
      type: String,
      default: "VND",
    },

    roi_expected: {
      type: Number,
      default: 0,
    },

    risk_level: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    project_duration_months: {
      type: Number,
      default: 0,
    },

    carbon_reduction_est: {
      type: Number,
      default: 0,
    },

    jobs_created_est: {
      type: Number,
      default: 0,
    },

    thumbnail_url: {
      type: String,
      default: "",
    },

    views: {
      type: Number,
      default: 0,
    },

    investors: {
      type: Number,
      default: 0,
    },

    esg_score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true, strict: false }
);

export default mongoose.model("Project", projectSchema);