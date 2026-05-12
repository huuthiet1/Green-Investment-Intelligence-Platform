import AuditLog from "../models/AuditLog.js";

export async function createAuditLog({
  req,
  actor_id = "admin-demo",
  actor_role = "admin",
  action,
  module = "admin",
  target_id = "",
  target_name = "",
  old_data = {},
  new_data = {},
  note = "",
}) {
  try {
    await AuditLog.create({
      actor_id,
      actor_role,
      action,
      module,
      target_id: String(target_id || ""),
      target_name,
      old_data,
      new_data,
      note,
      ip_address:
        req?.headers?.["x-forwarded-for"] ||
        req?.socket?.remoteAddress ||
        "",
      user_agent: req?.headers?.["user-agent"] || "",
    });
  } catch (error) {
    console.error("CREATE AUDIT LOG ERROR:", error.message);
  }
}