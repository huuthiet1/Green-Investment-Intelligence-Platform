import express from "express";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { module, action, keyword } = req.query || {};

    const query = {};

    if (module && module !== "all") {
      query.module = module;
    }

    if (action && action !== "all") {
      query.action = action;
    }

    if (keyword) {
      query.$or = [
        { action: { $regex: keyword, $options: "i" } },
        { target_name: { $regex: keyword, $options: "i" } },
        { actor_id: { $regex: keyword, $options: "i" } },
        { note: { $regex: keyword, $options: "i" } },
      ];
    }

    const logs = await AuditLog.find(query).sort({ createdAt: -1 }).limit(300);

    res.json({ logs });
  } catch (error) {
    console.error("GET AUDIT LOGS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await AuditLog.findByIdAndDelete(req.params.id);

    res.json({
      message: "Xóa audit log thành công",
    });
  } catch (error) {
    console.error("DELETE AUDIT LOG ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    await AuditLog.deleteMany({});

    res.json({
      message: "Đã xóa toàn bộ audit logs",
    });
  } catch (error) {
    console.error("CLEAR AUDIT LOGS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;