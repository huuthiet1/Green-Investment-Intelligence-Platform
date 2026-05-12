import express from "express";
import Project from "../models/Project.js";
import ESGScore from "../models/ESGScore.js";

const router = express.Router();

function getRiskLevel(project) {
  const capital = Number(project.capital_needed || 0);
  const roi = Number(project.roi_expected || 0);
  const esg = Number(project.esg_score || 0);

  let score = 0;
  const reasons = [];

  if (capital > 10000000000) {
    score += 30;
    reasons.push("Số vốn cần gọi lớn");
  }

  if (roi > 25) {
    score += 25;
    reasons.push("ROI kỳ vọng cao, cần chứng minh tính khả thi");
  }

  if (esg < 50) {
    score += 25;
    reasons.push("Điểm ESG còn thấp");
  }

  if (!project.description) {
    score += 20;
    reasons.push("Thiếu mô tả chi tiết dự án");
  }

  if (score >= 60) return { level: "high", score, reasons };
  if (score >= 30) return { level: "medium", score, reasons };
  return { level: "low", score, reasons };
}

router.get("/projects", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json({ projects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/esg-score/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    const carbon = Number(project.carbon_reduction_est || 0);
    const jobs = Number(project.jobs_created_est || 0);
    const hasDescription = Boolean(project.description);
    const hasImage = Boolean(project.thumbnail_url);

    const environment_score = Math.min(100, 50 + carbon / 100);
    const social_score = Math.min(100, 50 + jobs * 2);
    const governance_score = hasDescription && hasImage ? 80 : 55;

    const total_score = Math.round(
      (environment_score + social_score + governance_score) / 3
    );

    const esg_level =
      total_score >= 85
        ? "excellent"
        : total_score >= 70
        ? "good"
        : total_score >= 50
        ? "average"
        : "poor";

    const score = await ESGScore.findOneAndUpdate(
      { project_id: project._id },
      {
        project_id: project._id,
        environment_score,
        social_score,
        governance_score,
        total_score,
        esg_level,
        evaluation_note:
          "AI tự động chấm điểm dựa trên giảm CO2, việc làm tạo ra, mô tả và hình ảnh dự án.",
      },
      { new: true, upsert: true }
    );

    await Project.findByIdAndUpdate(project._id, {
      esg_score: total_score,
    });

    res.json({
      message: "AI đã chấm điểm ESG",
      score,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/risk/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    const risk = getRiskLevel(project);

    res.json({
      project,
      risk,
      advice: [
        "Bổ sung tài liệu pháp lý và tài chính",
        "Giải thích rõ cơ sở ROI kỳ vọng",
        "Cập nhật tiến độ gọi vốn thường xuyên",
        "Tăng minh bạch thông tin ESG",
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/summary/:projectId", async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    const summary = `
${project.title} là dự án thuộc lĩnh vực ${
      project.category_name || "đầu tư xanh"
    }, hướng tới phát triển bền vững và tạo tác động tích cực về môi trường.

Dự án cần huy động ${Number(project.capital_needed || 0).toLocaleString(
      "vi-VN"
    )} VND, với ROI kỳ vọng ${project.roi_expected || 0}%.

Điểm nổi bật của dự án là khả năng giảm phát thải, tạo việc làm và phù hợp với xu hướng ESG. Đây là cơ hội phù hợp cho các nhà đầu tư quan tâm đến tăng trưởng xanh, tác động xã hội và hiệu quả tài chính dài hạn.
`;

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;