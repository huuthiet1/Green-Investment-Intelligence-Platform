import mongoose from "mongoose";

const projectDocumentSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    document_name: {
      type: String,
      required: true,
      trim: true,
    },
    document_type: {
      type: String,
      enum: ["pdf", "doc", "docx", "image", "xls", "xlsx", "other"],
      required: true,
    },
    file_url: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number,
      default: null,
      min: 0,
    },
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

projectDocumentSchema.index({ project_id: 1 });
projectDocumentSchema.index({ uploaded_by: 1 });

const ProjectDocument = mongoose.model("ProjectDocument", projectDocumentSchema);
export default ProjectDocument;