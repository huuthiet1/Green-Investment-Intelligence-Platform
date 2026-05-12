import express from "express";
import mongoose from "mongoose";
import Investment from "../models/Investment.js";
import FundingRound from "../models/FundingRound.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";

const router = express.Router();

const DEMO_INVESTOR_ID = "investor-demo";

function getInvestorId(req) {
  return (
    req.user?._id?.toString() ||
    req.body?.investor_id ||
    req.query?.investor_id ||
    DEMO_INVESTOR_ID
  );
}

router.get("/", async (req, res) => {
  try {
    const investorId = getInvestorId(req);

    const investments = await Investment.find({ investor_id: investorId })
      .populate("project_id")
      .populate("funding_round_id")
      .sort({ createdAt: -1 });

    res.json({ investments });
  } catch (error) {
    console.error("GET INVESTMENTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const investorId = getInvestorId(req);

    const {
      project_id,
      funding_round_id,
      amount,
      note = "",
    } = req.body || {};

    if (!project_id) {
      return res.status(400).json({ message: "Thiếu project_id" });
    }

    if (!mongoose.Types.ObjectId.isValid(project_id)) {
      return res.status(400).json({ message: "project_id không hợp lệ" });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Số tiền đầu tư phải lớn hơn 0" });
    }

    const project = await Project.findById(project_id);

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    let round = null;

    if (funding_round_id && mongoose.Types.ObjectId.isValid(funding_round_id)) {
      round = await FundingRound.findById(funding_round_id);
    }

    const investment = await Investment.create({
      investor_id: investorId,
      project_id,
      funding_round_id: round?._id,
      amount: Number(amount),
      note,
      status: "pending",
    });

    const notification = await Notification.create({
      user_id: "business-demo",
      title: "Có đề nghị góp vốn mới",
      content: `Nhà đầu tư đề nghị góp ${Number(amount).toLocaleString(
        "vi-VN"
      )} VND vào dự án "${project.title}".`,
      type: "funding",
      metadata: {
        project_id: project._id,
        investment_id: investment._id,
      },
    });

    req.app.get("io")?.emit("new_notification", notification);

    res.status(201).json({
      message: "Gửi đề nghị góp vốn thành công",
      investment,
    });
  } catch (error) {
    console.error("CREATE INVESTMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body || {};

    const allowed = ["pending", "approved", "rejected", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const investment = await Investment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("funding_round_id");

    if (!investment) {
      return res.status(404).json({ message: "Không tìm thấy góp vốn" });
    }

    if (status === "approved" && investment.funding_round_id?._id) {
      await FundingRound.findByIdAndUpdate(investment.funding_round_id._id, {
        $inc: { raised_amount: Number(investment.amount || 0) },
      });
    }

    res.json({
      message: "Cập nhật trạng thái góp vốn thành công",
      investment,
    });
  } catch (error) {
    console.error("UPDATE INVESTMENT STATUS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Investment.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa đề nghị góp vốn" });
  } catch (error) {
    console.error("DELETE INVESTMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;