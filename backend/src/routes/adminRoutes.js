import express from "express";
import Project from "../models/Project.js";
import User from "../models/User.js";
import Report from "../models/Report.js";
import ESGScore from "../models/ESGScore.js";
import { createAuditLog } from "../utils/audit.js";
import Notification from "../models/Notification.js";
const router = express.Router();

router.get("/overview", async (req, res) => {
  try {
    const projects = await Project.countDocuments();
    const users = await User.countDocuments();
    const reports = await Report.countDocuments();
    const esgScores = await ESGScore.find();

    const pendingProjects = await Project.countDocuments({
      status: "pending",
    });

    const approvedProjects = await Project.countDocuments({
      status: "approved",
    });

    const rejectedProjects = await Project.countDocuments({
      status: "rejected",
    });

    const avgESG =
      esgScores.length > 0
        ? Math.round(
            esgScores.reduce((sum, e) => sum + Number(e.total_score || 0), 0) /
              esgScores.length
          )
        : 0;

    res.json({
      stats: {
        projects,
        users,
        reports,
        avgESG,
        pendingProjects,
        approvedProjects,
        rejectedProjects,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= PROJECTS =================
router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.put("/projects/:id/review", async (req, res) => {
  try {
    const {
      review_status,
      review_note = "",
      reviewed_by = "admin-demo",
    } = req.body || {};

    const allowed = [
      "pending",
      "reviewing",
      "approved",
      "rejected",
      "suspended",
    ];

    if (!allowed.includes(review_status)) {
      return res.status(400).json({
        message: "Trạng thái duyệt không hợp lệ",
      });
    }

    const updateData = {
      review_status,
      review_note,
      reviewed_by,
      reviewed_at: new Date(),
    };

    if (review_status === "approved") {
      updateData.status = "approved";
      updateData.published_at = new Date();
    }

    if (review_status === "rejected") {
      updateData.status = "rejected";
    }

    if (review_status === "suspended") {
      updateData.status = "closed";
    }

    if (review_status === "reviewing") {
      updateData.status = "pending";
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    const notification = await Notification.create({
      user_id: "admin",
      title: "Admin đã cập nhật trạng thái duyệt dự án",
      content: `Dự án "${project.title}" chuyển sang trạng thái ${review_status}.`,
      type: "project",
      metadata: {
        project_id: project._id,
        review_status,
      },
    });

    req.app.get("io")?.emit("new_notification", notification);

    res.json({
      message: "Cập nhật workflow duyệt dự án thành công",
      project,
    });
  } catch (error) {
    console.error("REVIEW PROJECT ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
});
router.put("/projects/:id/esg-score", async (req, res) => {
  try {
    const { esg_score } = req.body;

    if (
      esg_score === undefined ||
      esg_score === null
    ) {
      return res.status(400).json({
        message: "Thiếu điểm ESG",
      });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        esg_score: Number(esg_score),
      },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    res.json({
      message: "Cập nhật ESG thành công",
      project,
    });
  } catch (error) {
    console.error("UPDATE ESG ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});
router.put("/projects/:id/status", async (req, res) => {
  try {
    const oldProject = await Project.findById(req.params.id);

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    
    res.json({ project });
  } catch (error) {
    console.error("UPDATE PROJECT STATUS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa dự án" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ================= USERS =================
router.get("/users", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -password_hash")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { role, is_active, status } = req.body || {};

    const updateData = {};

    if (role) {
      updateData.role = role;
    }

    if (typeof is_active === "boolean") {
      updateData.is_active = is_active;
      updateData.status = is_active ? "active" : "banned";
    }

    if (status) {
      updateData.status = status;
      updateData.is_active = status === "active";
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password -password_hash");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({
      message: "Cập nhật người dùng thành công",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const currentUserId = req.user?._id?.toString();

    if (currentUserId && currentUserId === req.params.id) {
      return res.status(400).json({
        message: "Không thể tự xóa tài khoản admin đang đăng nhập",
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({
      message: "Xóa người dùng thành công",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//================= REPORTS =================

router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("project_id", "title")
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/reports/:id", async (req, res) => {
  try {
    const { status, handled_note } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        handled_note,
        handled_at: new Date(),
      },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Không tìm thấy báo cáo" });
    }

    res.json({
      message: "Cập nhật báo cáo thành công",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/reports/:id", async (req, res) => {
  try {
    await Report.findByIdAndDelete(req.params.id);

    res.json({ message: "Xóa báo cáo thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;