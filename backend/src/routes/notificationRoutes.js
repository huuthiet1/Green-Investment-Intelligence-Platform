import express from "express";
import Notification from "../models/Notification.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    const unread = await Notification.countDocuments({ is_read: false });

    res.json({ notifications, unread });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    req.app.get("io")?.emit("new_notification", notification);

    res.status(201).json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true }
    );

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({}, { is_read: true });
    res.json({ message: "Đã đọc tất cả" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;