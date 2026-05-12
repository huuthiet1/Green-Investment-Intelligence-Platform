import express from "express";
import Project from "../models/Project.js";
import InvestorProfile from "../models/InvestorProfile.js";

const router = express.Router();

function calcMatchScore(project, investor) {
  let score = 0;
  const reasons = [];

  const category = project.category_name || "";

  if (
    investor.preferred_categories?.length &&
    investor.preferred_categories.includes(category)
  ) {
    score += 25;
    reasons.push("Phù hợp lĩnh vực đầu tư");
  }

  const capital = Number(project.capital_needed || 0);

  if (
    capital >= Number(investor.min_budget || 0) &&
    capital <= Number(investor.max_budget || Number.MAX_SAFE_INTEGER)
  ) {
    score += 25;
    reasons.push("Phù hợp ngân sách đầu tư");
  }

  const esg = Number(project.esg_score || 0);

  if (esg >= Number(investor.min_esg_score || 0)) {
    score += 20;
    reasons.push("Đạt ngưỡng ESG mong muốn");
  }

  if (
    investor.preferred_risk === "any" ||
    investor.preferred_risk === project.risk_level
  ) {
    score += 15;
    reasons.push("Phù hợp mức rủi ro");
  }

  const roi = Number(project.roi_expected || 0);

  if (roi >= Number(investor.expected_roi || 0)) {
    score += 15;
    reasons.push("ROI đạt kỳ vọng");
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
}

router.get("/investors", async (req, res) => {
  try {
    const investors = await InvestorProfile.find().sort({ createdAt: -1 });
    res.json({ investors });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/investors", async (req, res) => {
  try {
    const investor = await InvestorProfile.create(req.body);
    res.status(201).json({ investor });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/match", async (req, res) => {
  try {
    const { investor_id } = req.body;

    if (!investor_id) {
      return res.status(400).json({ message: "Thiếu investor_id" });
    }

    const investor = await InvestorProfile.findById(investor_id);

    if (!investor) {
      return res.status(404).json({ message: "Không tìm thấy nhà đầu tư" });
    }

    const projects = await Project.find().sort({ createdAt: -1 });

    const results = projects
      .map((project) => {
        const match = calcMatchScore(project, investor);

        return {
          project,
          score: match.score,
          reasons: match.reasons,
        };
      })
      .sort((a, b) => b.score - a.score);

    res.json({
      investor,
      matches: results,
    });
  } catch (error) {
    console.error("MATCHING ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;