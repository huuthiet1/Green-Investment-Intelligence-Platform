import express from "express";
import mongoose from "mongoose";
import Investment from "../models/Investment.js";
import FundingRound from "../models/FundingRound.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const router = express.Router();

function currentUserId(req) {
  return req.user._id.toString();
}

// Investor xem yêu cầu góp vốn của mình
router.get("/", async (req, res) => {
  try {
    const investments = await Investment.find({
      investor_id: currentUserId(req),
    })
      .populate("project_id")
      .populate("funding_round_id")
      .sort({ createdAt: -1 });

    res.json({ investments });
  } catch (error) {
    console.error("GET INVESTMENTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// Business xem yêu cầu góp vốn vào dự án của mình
router.get("/business", async (req, res) => {
  try {
    const myProjects = await Project.find({
      owner_id: currentUserId(req),
    }).select("_id title owner_id");

    const projectIds = myProjects.map((p) => p._id);

    const investments = await Investment.find({
      project_id: { $in: projectIds },
    })
      .populate("project_id")
      .populate("funding_round_id")
      .sort({ createdAt: -1 });

    const investorIds = investments.map((i) => i.investor_id);

    const users = await User.find({
      _id: { $in: investorIds },
    }).select("name full_name email role");

    const userMap = {};
    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    const requests = investments.map((item) => {
      const investor = userMap[item.investor_id];

      return {
        _id: item._id,
        investor_id: item.investor_id,
        investor_name:
          investor?.full_name ||
          investor?.name ||
          investor?.email ||
          "Nhà đầu tư",
        investor_email: investor?.email || "",
        project_id: item.project_id,
        project_title: item.project_id?.title || "Dự án",
        funding_round_id: item.funding_round_id,
        round_name: item.funding_round_id?.round_name || "Vòng gọi vốn",
        amount: item.amount || 0,
        note: item.note || "",
        status: item.status || "pending",
        rejection_reason: item.rejection_reason || "",
        createdAt: item.createdAt,
      };
    });

    res.json({ investments: requests });
  } catch (error) {
    console.error("GET BUSINESS INVESTMENTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// Investor gửi yêu cầu góp vốn
router.post("/", async (req, res) => {
  try {
    const investorId = currentUserId(req);

    const { project_id, funding_round_id, amount, note = "" } = req.body || {};

    if (!project_id) {
      return res.status(400).json({ message: "Thiếu project_id" });
    }

    if (!funding_round_id) {
      return res.status(400).json({ message: "Thiếu funding_round_id" });
    }

    if (!mongoose.Types.ObjectId.isValid(project_id)) {
      return res.status(400).json({ message: "project_id không hợp lệ" });
    }

    if (!mongoose.Types.ObjectId.isValid(funding_round_id)) {
      return res.status(400).json({ message: "funding_round_id không hợp lệ" });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Số tiền góp vốn phải lớn hơn 0",
      });
    }

    const project = await Project.findById(project_id);

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    const round = await FundingRound.findById(funding_round_id);

    if (!round) {
      return res.status(404).json({ message: "Không tìm thấy vòng gọi vốn" });
    }

    const investment = await Investment.create({
      investor_id: investorId,
      project_id,
      funding_round_id,
      amount: Number(amount),
      note,
      status: "pending",
    });

    await Notification.create({
      user_id: project.owner_id?.toString(),
      title: "Có yêu cầu góp vốn mới",
      content: `Nhà đầu tư gửi yêu cầu góp ${Number(amount).toLocaleString(
        "vi-VN"
      )} VND vào dự án "${project.title}".`,
      type: "funding",
      metadata: {
        project_id: project._id,
        funding_round_id,
        investment_id: investment._id,
        investor_id: investorId,
      },
    });

    req.app.get("io")?.emit("new_notification");

    res.status(201).json({
      message: "Gửi yêu cầu góp vốn thành công",
      investment,
    });
  } catch (error) {
    console.error("CREATE INVESTMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// Business approve / reject yêu cầu góp vốn
router.put("/:id/status", async (req, res) => {
  try {
    const businessId = currentUserId(req);
    const { status, rejection_reason = "" } = req.body || {};

    if (!["approved", "rejected", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu góp vốn" });
    }

    const project = await Project.findById(investment.project_id);

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    if (project.owner_id?.toString() !== businessId) {
      return res.status(403).json({
        message: "Bạn không có quyền xử lý yêu cầu góp vốn này",
      });
    }

    if (investment.status !== "pending") {
      return res.status(400).json({
        message: "Yêu cầu này đã được xử lý",
      });
    }

    investment.status = status;

    if (status === "approved") {
      investment.approved_at = new Date();

      await FundingRound.findByIdAndUpdate(investment.funding_round_id, {
        $inc: {
          raised_amount: Number(investment.amount || 0),
        },
      });

      await Notification.create({
        user_id: investment.investor_id,
        title: "Yêu cầu góp vốn được duyệt",
        content: `Yêu cầu góp vốn vào dự án "${project.title}" đã được doanh nghiệp duyệt.`,
        type: "funding",
        metadata: {
          project_id: project._id,
          investment_id: investment._id,
        },
      });
    }

    if (status === "rejected") {
      investment.rejected_at = new Date();
      investment.rejection_reason = rejection_reason;

      await Notification.create({
        user_id: investment.investor_id,
        title: "Yêu cầu góp vốn bị từ chối",
        content: `Yêu cầu góp vốn vào dự án "${project.title}" đã bị từ chối.`,
        type: "funding",
        metadata: {
          project_id: project._id,
          investment_id: investment._id,
        },
      });
    }

    await investment.save();

    req.app.get("io")?.emit("new_notification");

    res.json({
      message: "Cập nhật trạng thái góp vốn thành công",
      investment,
    });
  } catch (error) {
    console.error("UPDATE INVESTMENT STATUS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// Investor hủy yêu cầu góp vốn của mình nếu còn pending
router.delete("/:id", async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu góp vốn" });
    }

    if (investment.investor_id !== currentUserId(req)) {
      return res.status(403).json({ message: "Không có quyền xóa" });
    }

    if (investment.status !== "pending") {
      return res.status(400).json({
        message: "Chỉ có thể hủy yêu cầu đang chờ",
      });
    }

    await Investment.findByIdAndDelete(req.params.id);

    res.json({ message: "Đã hủy yêu cầu góp vốn" });
  } catch (error) {
    console.error("DELETE INVESTMENT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;