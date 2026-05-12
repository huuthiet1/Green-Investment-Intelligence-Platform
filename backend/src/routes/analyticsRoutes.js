import express from "express";
import Project from "../models/Project.js";
import FundingRound from "../models/FundingRound.js";
import ESGScore from "../models/ESGScore.js";
import InvestorInterest from "../models/InvestorInterest.js";

const router = express.Router();

router.get("/business", async (req, res) => {
  try {
    const projects = await Project.find();
    const fundingRounds = await FundingRound.find();
    const esgScores = await ESGScore.find();
    const investors = await InvestorInterest.find();

    const totalCapital = projects.reduce(
      (sum, p) => sum + Number(p.capital_needed || 0),
      0
    );

    const totalRaised = fundingRounds.reduce(
      (sum, f) => sum + Number(f.raised_amount || 0),
      0
    );

    const avgESG =
      esgScores.length > 0
        ? Math.round(
            esgScores.reduce((sum, e) => sum + Number(e.total_score || 0), 0) /
              esgScores.length
          )
        : 0;

    const fundingChart = fundingRounds.map((f) => ({
      name: f.round_name || "Vòng gọi vốn",
      target: Number(f.target_amount || 0),
      raised: Number(f.raised_amount || 0),
    }));

    const esgChart = esgScores.map((e) => ({
      name: "ESG",
      E: Number(e.environment_score || 0),
      S: Number(e.social_score || 0),
      G: Number(e.governance_score || 0),
      total: Number(e.total_score || 0),
    }));

    res.json({
      summary: {
        totalProjects: projects.length,
        totalCapital,
        totalRaised,
        totalInvestors: investors.length,
        avgESG,
      },
      fundingChart,
      esgChart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;