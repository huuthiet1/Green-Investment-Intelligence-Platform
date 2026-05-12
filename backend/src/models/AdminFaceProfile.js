import mongoose from "mongoose";

const adminFaceProfileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    face_descriptor: {
      type: [Number],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 128,
        message: "Descriptor phải có đúng 128 phần tử",
      },
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

const AdminFaceProfile = mongoose.model(
  "AdminFaceProfile",
  adminFaceProfileSchema
);

export default AdminFaceProfile;