import express from "express";
import Project from "../models/Project.js";
import ESGScore from "../models/ESGScore.js";

const router = express.Router();

router.post("/analyze", async (req, res) => {
  try {
    const { project_id } = req.body || {};

    if (!project_id) {
      return res.status(400).json({
        message: "Thiếu project_id",
      });
    }

    const project = await Project.findById(project_id);

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    const esg = await ESGScore.findOne({
      project_id,
    });

    const esgScore =
      esg?.total_score ||
      Number(project.esg_score || 0);

    const riskScore =
      Number(project.ai_risk_score || 0);

    const roi =
      Number(project.roi_expected || 0);

    let investmentScore = 50;

    investmentScore += esgScore * 0.3;
    investmentScore += roi * 1.5;
    investmentScore -= riskScore * 0.5;

    investmentScore = Math.max(
      0,
      Math.min(100, Math.round(investmentScore))
    );

    let recommendation = "neutral";

    if (investmentScore >= 75) {
      recommendation = "strong_buy";
    } else if (investmentScore >= 60) {
      recommendation = "buy";
    } else if (investmentScore >= 40) {
      recommendation = "watch";
    } else {
      recommendation = "avoid";
    }

    const strengths = [];
    const risks = [];
    const aiInsights = [];

    // ESG
    if (esgScore >= 80) {
      strengths.push(
        "Dự án có ESG rất cao, phù hợp đầu tư bền vững."
      );
    } else if (esgScore < 50) {
      risks.push(
        "Điểm ESG thấp có thể ảnh hưởng đến sustainability."
      );
    }

    // ROI
    if (roi >= 20) {
      strengths.push(
        "ROI kỳ vọng cao."
      );
    } else if (roi < 8) {
      risks.push(
        "ROI tương đối thấp."
      );
    }

    // Risk
    if (riskScore >= 70) {
      risks.push(
        "AI phát hiện mức rủi ro cao."
      );
    }

    // AI insights
    if (investmentScore >= 75) {
      aiInsights.push(
        "AI đánh giá đây là dự án có tiềm năng đầu tư mạnh."
      );
    }

    if (riskScore >= 60 && roi >= 25) {
      aiInsights.push(
        "High Risk - High Return investment profile."
      );
    }

    if (esgScore >= 85) {
      aiInsights.push(
        "Dự án phù hợp quỹ ESG/Green Finance."
      );
    }

    res.json({
      analysis: {
        project: {
          id: project._id,
          title: project.title,
        },

        metrics: {
          esg_score: esgScore,
          risk_score: riskScore,
          roi,
          investment_score: investmentScore,
        },

        recommendation,

        strengths,
        risks,
        ai_insights: aiInsights,
      },
    });
  } catch (error) {
    console.error("INVESTOR AI ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;