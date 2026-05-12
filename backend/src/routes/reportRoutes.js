import express from "express";
import Report from "../models/Report.js";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("project_id", "title")
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const report = await Report.create(req.body);

    const notification = await Notification.create({
      user_id: "admin",
      title: "Báo cáo mới",
      content: `Có một báo cáo mới được tạo: "${report.title}".`,
      type: "report",
    });

    req.app.get("io")?.emit("new_notification", notification);

    res.status(201).json({
      message: "Tạo báo cáo thành công",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    const notification = await Notification.create({
      user_id: "admin",
      title: "Báo cáo đã được cập nhật",
      content: `Báo cáo "${report.title}" đã được cập nhật.`,
      type: "report",
    });

    req.app.get("io")?.emit("new_notification", notification);

    res.json({
      message: "Cập nhật báo cáo thành công",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);

    res.json({
      message: "Xóa báo cáo thành công",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;