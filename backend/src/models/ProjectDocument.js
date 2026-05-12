import mongoose from "mongoose";

const projectDocumentSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    document_type: {
      type: String,
      enum: [
        "legal",
        "financial",
        "esg",
        "pitchdeck",
        "other",
      ],
      default: "other",
    },

    file_url: {
      type: String,
      required: true,
    },

    uploaded_by: {
      type: String,
      default: "business-demo",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ProjectDocument",
  projectDocumentSchema
);