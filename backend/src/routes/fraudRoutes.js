import express from "express";
import Project from "../models/Project.js";
import ProjectDocument from "../models/ProjectDocument.js";
import Notification from "../models/Notification.js";
import { createAuditLog } from "../utils/audit.js";

const router = express.Router();

function analyzeFraud(project, documents = []) {
  let score = 0;
  const flags = [];

  const roi = Number(project.roi_expected || 0);
  const capital = Number(project.capital_needed || 0);
  const esg = Number(project.esg_score || 0);
  const description = `${project.title || ""} ${project.description || ""}`.toLowerCase();

  if (roi >= 40) {
    score += 25;
    flags.push("ROI kỳ vọng quá cao, có thể thiếu cơ sở thực tế");
  }

  if (capital >= 10000000000) {
    score += 15;
    flags.push("Số vốn cần gọi lớn, cần kiểm tra tính minh bạch");
  }

  if (esg > 0 && esg < 40) {
    score += 20;
    flags.push("Điểm ESG thấp");
  }

  if (!project.description || project.description.length < 80) {
    score += 15;
    flags.push("Mô tả dự án quá ngắn hoặc thiếu thông tin");
  }

  if (!project.thumbnail_url) {
    score += 8;
    flags.push("Dự án chưa có hình ảnh đại diện");
  }

  if (!documents.length) {
    score += 20;
    flags.push("Chưa có tài liệu xác minh dự án");
  }

  const suspiciousWords = [
    "cam kết lợi nhuận",
    "lợi nhuận chắc chắn",
    "không rủi ro",
    "100%",
    "đảm bảo hoàn vốn",
    "siêu lợi nhuận",
  ];

  suspiciousWords.forEach((word) => {
    if (description.includes(word)) {
      score += 20;
      flags.push(`Có cụm từ nghi ngờ: "${word}"`);
    }
  });

  score = Math.min(score, 100);

  let level = "low";
  if (score >= 70) level = "high";
  else if (score >= 40) level = "medium";

  return {
    fraud_score: score,
    fraud_level: level,
    flags,
    recommendation:
      level === "high"
        ? "Nên tạm khóa hoặc yêu cầu doanh nghiệp bổ sung hồ sơ xác minh."
        : level === "medium"
        ? "Nên chuyển sang trạng thái đang xem xét và yêu cầu bổ sung tài liệu."
        : "Dự án chưa có dấu hiệu gian lận nghiêm trọng.",
  };
}

router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });

    const results = await Promise.all(
      projects.map(async (project) => {
        const documents = await ProjectDocument.find({
          project_id: project._id,
        });

        const analysis = analyzeFraud(project, documents);

        return {
          project,
          documents_count: documents.length,
          ...analysis,
        };
      })
    );

    res.json({ results });
  } catch (error) {
    console.error("GET FRAUD PROJECTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/projects/:id/analyze", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    const documents = await ProjectDocument.find({
      project_id: project._id,
    });

    const analysis = analyzeFraud(project, documents);

    project.ai_risk_score = analysis.fraud_score;
    project.ai_risk_level = analysis.fraud_level;
    project.ai_risk_flags = analysis.flags;
    await project.save();

    await createAuditLog({
  req,
  action: "ANALYZE_FRAUD",
  module: "project",
  target_id: project?._id,
  target_name: project?.title,
  new_data: {
    ai_risk_score: project.ai_risk_score,
    ai_risk_level: project.ai_risk_level,
    ai_risk_flags: project.ai_risk_flags,
  },
  note: "Admin phân tích rủi ro gian lận cho dự án",
});

    if (analysis.fraud_level === "high") {
      const notification = await Notification.create({
        user_id: "admin",
        title: "AI phát hiện dự án rủi ro cao",
        content: `Dự án "${project.title}" có Fraud Score ${analysis.fraud_score}%.`,
        type: "admin",
        metadata: {
          project_id: project._id,
          fraud_score: analysis.fraud_score,
        },
      });

      req.app.get("io")?.emit("new_notification", notification);
    }

    res.json({
      message: "AI Fraud Detection hoàn tất",
      project,
      documents_count: documents.length,
      ...analysis,
    });
  } catch (error) {
    console.error("AI FRAUD ANALYZE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/projects/:id/suspend", async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      {
        status: "closed",
        review_status: "suspended",
        review_note: "Dự án bị tạm khóa do AI Fraud Detection phát hiện rủi ro.",
        reviewed_at: new Date(),
      },
      { new: true }
    );

    res.json({
      message: "Đã tạm khóa dự án",
      project,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;