import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category_name: {
      type: String,
      required: true,
      trim: true,
    },
    location_name: {
      type: String,
      default: "",
      trim: true,
    },
    region_name: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "closed", "funded"],
      default: "pending",
    },

    project_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    short_description: {
      type: String,
      default: "",
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },

    capital_needed: {
      type: Number,
      required: true,
      min: 0,
    },
    capital_currency: {
      type: String,
      default: "VND",
      trim: true,
    },
    roi_expected: {
      type: Number,
      default: null,
      min: 0,
    },
    risk_level: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    project_duration_months: {
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

    carbon_reduction_est: {
      type: Number,
      default: null,
      min: 0,
    },
    jobs_created_est: {
      type: Number,
      default: null,
      min: 0,
    },
    thumbnail_url: {
      type: String,
      default: "",
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    published_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

projectSchema.index({ owner_id: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ category_name: 1 });
projectSchema.index({ location_name: 1 });
projectSchema.index({ risk_level: 1 });
projectSchema.index({ project_code: 1 }, { unique: true });
projectSchema.index({ slug: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);
export default Project;