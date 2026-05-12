import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

favoriteSchema.index(
  { investor_id: 1, project_id: 1 },
  { unique: true }
);

export default mongoose.model("Favorite", favoriteSchema);