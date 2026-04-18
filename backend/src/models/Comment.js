const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent_comment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    content: {
      type: String,
      required: true,
    },
    is_edited: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["visible", "hidden", "pending"],
      default: "visible",
    },
  },
  {
    timestamps: true,
  }
);

commentSchema.index({ project_id: 1 });
commentSchema.index({ user_id: 1 });
commentSchema.index({ parent_comment_id: 1 });
commentSchema.index({ status: 1 });
commentSchema.index({ createdAt: 1 });

module.exports = mongoose.model("Comment", commentSchema);