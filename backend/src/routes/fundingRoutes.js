import express from "express";
import mongoose from "mongoose";
import FundingRound from "../models/FundingRound.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const rounds = await FundingRound.find()
      .populate("project_id", "title thumbnail_url")
      .sort({ createdAt: -1 });

    res.json({ rounds });
  } catch (error) {
    console.error("GET FUNDING ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const query = req.query || {};

    console.log("BACKEND FUNDING BODY:", body);
    console.log("BACKEND FUNDING QUERY:", query);

    const projectId =
      body.project_id ||
      query.project_id ||
      body.projectId ||
      body.form?.project_id;

    if (!projectId) {
      return res.status(400).json({ message: "Thiếu project_id" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "project_id không hợp lệ" });
    }

    const round = await FundingRound.create({
      project_id: projectId,
      round_name: body.round_name || query.round_name || "Vòng gọi vốn",
      target_amount: Number(body.target_amount || query.target_amount || 0),
      raised_amount: Number(body.raised_amount || query.raised_amount || 0),
      equity_offered: Number(body.equity_offered || query.equity_offered || 0),
      status: body.status || query.status || "upcoming",
      start_date: body.start_date || query.start_date || "",
      end_date: body.end_date || query.end_date || "",
      description: body.description || query.description || "",
    });

    res.status(201).json({
      message: "Tạo vòng gọi vốn thành công",
      round,
    });
  } catch (error) {
    console.error("CREATE FUNDING ERROR:", error);
    res.status(500).json({
      message: error.message || "Lỗi tạo vòng gọi vốn",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const body = req.body || {};
    const projectId =
  body.project_id ||
  req.query?.project_id ||
  body.projectId ||
  body.form?.project_id;
    if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "project_id không hợp lệ" });
    }

    const updateData = {
      round_name: body.round_name || "Vòng gọi vốn",
      target_amount: Number(body.target_amount || 0),
      raised_amount: Number(body.raised_amount || 0),
      equity_offered: Number(body.equity_offered || 0),
      status: body.status || "upcoming",
      start_date: body.start_date || "",
      end_date: body.end_date || "",
      description: body.description || "",
    };

    if (projectId) {
      updateData.project_id = projectId;
    }

    const round = await FundingRound.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!round) {
      return res.status(404).json({ message: "Không tìm thấy vòng gọi vốn" });
    }

    res.json({
      message: "Cập nhật vòng gọi vốn thành công",
      round,
    });
  } catch (error) {
    console.error("UPDATE FUNDING ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const round = await FundingRound.findByIdAndDelete(req.params.id);

    if (!round) {
      return res.status(404).json({ message: "Không tìm thấy vòng gọi vốn" });
    }

    res.json({ message: "Xóa vòng gọi vốn thành công" });
  } catch (error) {
    console.error("DELETE FUNDING ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;