import express from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import Favorite from "../models/Favorite.js";
import InvestorInterest from "../models/InvestorInterest.js";
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

// ======================================================
// GET ALL INVESTORS / INTERESTS
// API: GET /api/investors
// Dùng cho Business Investors Page / Dashboard
// ======================================================

router.get("/", async (req, res) => {
  try {
    const interests = await InvestorInterest.find()
      .populate("project_id")
      .sort({ createdAt: -1 });

    const investors = interests.map((item) => ({
      _id: item._id,
      investor_id: item.investor_id,
      investor_name: item.investor_id || "Nhà đầu tư",
      name: item.investor_id || "Nhà đầu tư",

      project_id: item.project_id?._id || item.project_id,
      project_title: item.project_id?.title || "Dự án",

      estimated_budget: item.estimated_budget || 0,
      budget: item.estimated_budget || 0,

      status: item.status || "interested",
      message: item.message || "",

      createdAt: item.createdAt,
    }));

    res.json({
      investors,
      interests,
    });
  } catch (error) {
    console.error("GET INVESTORS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// GET FAVORITES
// API: GET /api/investors/favorites
// ======================================================

router.get("/favorites", async (req, res) => {
  try {
    const investorId = getInvestorId(req);

    const favorites = await Favorite.find({
      investor_id: investorId,
    })
      .populate("project_id")
      .sort({ createdAt: -1 });

    res.json({ favorites });
  } catch (error) {
    console.error("GET FAVORITES ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// CREATE FAVORITE
// API: POST /api/investors/favorites
// Body: { project_id }
// ======================================================

router.post("/favorites", async (req, res) => {
  try {
    const investorId = getInvestorId(req);
    const { project_id } = req.body || {};

    if (!project_id) {
      return res.status(400).json({
        message: "Thiếu project_id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project_id)) {
      return res.status(400).json({
        message: "project_id không hợp lệ",
      });
    }

    const project = await Project.findById(project_id);

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    const favorite = await Favorite.findOneAndUpdate(
      {
        investor_id: investorId,
        project_id,
      },
      {
        investor_id: investorId,
        project_id,
      },
      {
        new: true,
        upsert: true,
      }
    ).populate("project_id");

    res.status(201).json({
      message: "Đã lưu dự án yêu thích",
      favorite,
    });
  } catch (error) {
    console.error("CREATE FAVORITE ERROR:", error);

    if (error.code === 11000) {
      return res.status(200).json({
        message: "Dự án đã có trong yêu thích",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// DELETE FAVORITE
// API: DELETE /api/investors/favorites/:id
// ======================================================

router.delete("/favorites/:id", async (req, res) => {
  try {
    const favorite = await Favorite.findByIdAndDelete(req.params.id);

    if (!favorite) {
      return res.status(404).json({
        message: "Không tìm thấy yêu thích",
      });
    }

    res.json({
      message: "Đã xóa khỏi yêu thích",
    });
  } catch (error) {
    console.error("DELETE FAVORITE ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// GET INTERESTS
// API: GET /api/investors/interests
// ======================================================

router.get("/interests", async (req, res) => {
  try {
    const investorId = getInvestorId(req);

    const interests = await InvestorInterest.find({
      investor_id: investorId,
    })
      .populate("project_id")
      .sort({ createdAt: -1 });

    res.json({ interests });
  } catch (error) {
    console.error("GET INTERESTS ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// CREATE INTEREST
// API: POST /api/investors/interests
// Body: { project_id, message, estimated_budget }
// ======================================================

router.post("/interests", async (req, res) => {
  try {
    const investorId = getInvestorId(req);

    const {
      project_id,
      message = "Tôi quan tâm đến dự án này.",
      estimated_budget = 0,
    } = req.body || {};

    if (!project_id) {
      return res.status(400).json({
        message: "Thiếu project_id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project_id)) {
      return res.status(400).json({
        message: "project_id không hợp lệ",
      });
    }

    const project = await Project.findById(project_id);

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    const interest = await InvestorInterest.findOneAndUpdate(
      {
        investor_id: investorId,
        project_id,
      },
      {
        investor_id: investorId,
        project_id,
        message,
        estimated_budget: Number(estimated_budget || 0),
        status: "interested",
      },
      {
        new: true,
        upsert: true,
      }
    ).populate("project_id");

    const notification = await Notification.create({
      user_id: "business-demo",
      title: "Có nhà đầu tư quan tâm",
      content: `Nhà đầu tư vừa quan tâm đến dự án "${project.title}".`,
      type: "interest",
      metadata: {
        project_id: project._id,
        investor_id: investorId,
      },
    });

    req.app.get("io")?.emit("new_notification", notification);

    res.status(201).json({
      message: "Đã gửi quan tâm đầu tư",
      interest,
    });
  } catch (error) {
    console.error("CREATE INTEREST ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// UPDATE INTEREST
// API: PUT /api/investors/interests/:id
// Body: { status, estimated_budget, message }
// ======================================================

router.put("/interests/:id", async (req, res) => {
  try {
    const { status, estimated_budget, message } = req.body || {};

    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (message !== undefined) {
      updateData.message = message;
    }

    if (estimated_budget !== undefined) {
      updateData.estimated_budget = Number(estimated_budget || 0);
    }

    const interest = await InvestorInterest.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("project_id");

    if (!interest) {
      return res.status(404).json({
        message: "Không tìm thấy quan tâm đầu tư",
      });
    }

    res.json({
      message: "Cập nhật quan tâm đầu tư thành công",
      interest,
    });
  } catch (error) {
    console.error("UPDATE INTEREST ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// DELETE INTEREST
// API: DELETE /api/investors/interests/:id
// ======================================================

router.delete("/interests/:id", async (req, res) => {
  try {
    const interest = await InvestorInterest.findByIdAndDelete(req.params.id);

    if (!interest) {
      return res.status(404).json({
        message: "Không tìm thấy quan tâm đầu tư",
      });
    }

    res.json({
      message: "Đã xóa quan tâm đầu tư",
    });
  } catch (error) {
    console.error("DELETE INTEREST ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;