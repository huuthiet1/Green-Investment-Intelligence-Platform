import express from "express";
import ESGScore from "../models/ESGScore.js";
import Project from "../models/Project.js";

const router = express.Router();

function getLevel(total) {
  if (total >= 85) return "excellent";
  if (total >= 70) return "good";
  if (total >= 50) return "average";
  return "poor";
}

router.get("/", async (req, res) => {
  try {
    const scores = await ESGScore.find()
      .populate("project_id", "title thumbnail_url category_name")
      .sort({ total_score: -1 });

    res.json({ scores });
  } catch (error) {
    console.error("GET ESG ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      project_id,
      environment_score,
      social_score,
      governance_score,
      evaluation_note,
    } = req.body || {};

    if (!project_id) {
      return res.status(400).json({ message: "Thiếu project_id" });
    }

    const project = await Project.findById(project_id);

    if (!project) {
      return res.status(404).json({ message: "Không tìm thấy dự án" });
    }

    const e = Number(environment_score || 0);
    const s = Number(social_score || 0);
    const g = Number(governance_score || 0);
    const total = Math.round((e + s + g) / 3);

    const score = await ESGScore.findOneAndUpdate(
      { project_id },
      {
        project_id,
        environment_score: e,
        social_score: s,
        governance_score: g,
        total_score: total,
        esg_level: getLevel(total),
        evaluation_note: evaluation_note || "",
      },
      { new: true, upsert: true }
    );

    await Project.findByIdAndUpdate(project_id, {
      esg_score: total,
    });

    res.status(201).json({
      message: "Lưu điểm ESG thành công",
      score,
    });
  } catch (error) {
    console.error("SAVE ESG ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await ESGScore.findByIdAndDelete(req.params.id);
    res.json({ message: "Xóa điểm ESG thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;