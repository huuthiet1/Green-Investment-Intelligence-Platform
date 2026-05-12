import express from "express";
import SystemSetting from "../models/SystemSetting.js";

const router = express.Router();

router.get("/settings", async (req, res) => {
  try {
    const settings = await SystemSetting.find().sort({
      createdAt: -1,
    });

    res.json({ settings });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.post("/settings", async (req, res) => {
  try {
    const {
      key,
      value,
      group = "general",
      description = "",
    } = req.body || {};

    if (!key) {
      return res.status(400).json({
        message: "Thiếu key",
      });
    }

    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      {
        key,
        value,
        group,
        description,
      },
      {
        new: true,
        upsert: true,
      }
    );

    res.status(201).json({
      message: "Lưu cấu hình thành công",
      setting,
    });
  } catch (error) {
    console.error("SAVE SETTINGS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.delete("/settings/:id", async (req, res) => {
  try {
    await SystemSetting.findByIdAndDelete(req.params.id);

    res.json({
      message: "Xóa cấu hình thành công",
    });
  } catch (error) {
    console.error("DELETE SETTINGS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;