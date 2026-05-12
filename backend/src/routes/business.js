import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

router.get("/overview", async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const filter = userId ? { owner_id: userId } : {};

    const projects = await Project.find(filter).sort({ createdAt: -1 });

    const totalProjects = projects.length;

    const totalViews = projects.reduce(
      (sum, p) => sum + Number(p.views || p.totalViews || 0),
      0
    );

    const totalInvestors = projects.reduce(
      (sum, p) => sum + Number(p.investors || p.totalInvestors || 0),
      0
    );

    const totalCapital = projects.reduce(
      (sum, p) => sum + Number(p.capital_needed || p.capitalNeeded || 0),
      0
    );

    res.json({
      stats: {
        totalProjects,
        totalViews,
        totalInvestors,
        totalCapital: `${(totalCapital / 1_000_000_000).toFixed(1)} tỷ`,
      },
      summary: [
        {
          id: 1,
          label: "Dự án chờ duyệt",
          value: projects.filter((p) => p.status === "pending").length,
        },
        {
          id: 2,
          label: "Dự án đã duyệt",
          value: projects.filter((p) => p.status === "approved").length,
        },
        {
          id: 3,
          label: "Tổng dự án",
          value: totalProjects,
        },
      ],
      projects: projects.slice(0, 5).map((p) => ({
        id: p._id,
        name: p.title || p.name,
        status: p.status || "pending",
        views: p.views || 0,
        investors: p.investors || 0,
        capital: p.capital_needed
          ? `${(p.capital_needed / 1_000_000_000).toFixed(1)} tỷ`
          : "0 tỷ",
        esg: p.esg_score || p.esg || 0,
      })),
      activities: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi lấy dashboard doanh nghiệp" });
  }
});

export default router;