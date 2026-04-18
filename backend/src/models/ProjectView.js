import mongoose from "mongoose";

const projectViewSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    viewer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    ip_address: {
      type: String,
      default: "",
    },
    viewed_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

projectViewSchema.index({ project_id: 1 });
projectViewSchema.index({ viewer_id: 1 });
projectViewSchema.index({ viewed_at: 1 });

const ProjectView = mongoose.model("ProjectView", projectViewSchema);
export default ProjectView;