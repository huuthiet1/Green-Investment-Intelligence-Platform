import mongoose from "mongoose";

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
      default: "",
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
  { timestamps: true }
);

const AdminFaceProfile = mongoose.model("AdminFaceProfile", adminFaceProfileSchema);
export default AdminFaceProfile;