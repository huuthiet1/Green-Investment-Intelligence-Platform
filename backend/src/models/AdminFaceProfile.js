const mongoose = require("mongoose");

const adminFaceProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    face_embedding: {
      type: [Number],
      required: true,
      default: [],
    },
    face_image_url: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    enrolled_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

adminFaceProfileSchema.index({ user_id: 1 }, { unique: true });
adminFaceProfileSchema.index({ is_active: 1 });

module.exports = mongoose.model("AdminFaceProfile", adminFaceProfileSchema);