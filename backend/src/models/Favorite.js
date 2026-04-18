const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    investor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

favoriteSchema.index({ investor_id: 1, project_id: 1 }, { unique: true });
favoriteSchema.index({ project_id: 1 });

module.exports = mongoose.model("Favorite", favoriteSchema);