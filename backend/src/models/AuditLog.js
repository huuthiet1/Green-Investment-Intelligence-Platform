import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor_id: {
      type: String,
      default: "admin-demo",
    },

    actor_role: {
      type: String,
      default: "admin",
    },

    action: {
      type: String,
      required: true,
    },

    module: {
      type: String,
      enum: [
        "auth",
        "project",
        "user",
        "report",
        "kyc",
        "fraud",
        "system",
        "notification",
        "admin",
      ],
      default: "admin",
    },

    target_id: {
      type: String,
      default: "",
    },

    target_name: {
      type: String,
      default: "",
    },

    old_data: {
      type: Object,
      default: {},
    },

    new_data: {
      type: Object,
      default: {},
    },

    ip_address: {
      type: String,
      default: "",
    },

    user_agent: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);