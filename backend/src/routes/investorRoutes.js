import express from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import Favorite from "../models/Favorite.js";
import InvestorInterest from "../models/InvestorInterest.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

const router = express.Router();

// ======================================================
// GET CURRENT INVESTOR ID
// ======================================================

function getInvestorId(req) {
  return req.user._id.toString();
}

// ======================================================
// GET ALL INVESTORS / INTERESTS
// Business xem investor quan tâm project của họ
// API: GET /api/investors
// ======================================================

router.get("/", async (req, res) => {
  try {
    const myProjects = await Project.find({
      owner_id: req.user._id.toString(),
    });

    const projectIds = myProjects.map((p) => p._id);

    const interests = await InvestorInterest.find({
      project_id: { $in: projectIds },
    })
      .populate("project_id", "title owner_id")
      .sort({ createdAt: -1 });

    const investorIds = interests.map((i) => i.investor_id);

    const users = await User.find({
      _id: { $in: investorIds },
    }).select("name full_name email role");

    const userMap = {};

    users.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    const investors = interests.map((item) => {
      const user = userMap[item.investor_id];

      return {
        _id: item._id,
        interest_id: item._id,

        investor_id: item.investor_id,

        name:
          user?.full_name ||
          user?.name ||
          user?.email ||
          "Nhà đầu tư",

        investor_name:
          user?.full_name ||
          user?.name ||
          user?.email ||
          "Nhà đầu tư",

        email: user?.email || "",

        project_id: item.project_id?._id,
        project_title: item.project_id?.title || "Dự án",

        estimated_budget: item.estimated_budget || 0,
        budget: item.estimated_budget || 0,

        status: item.status || "interested",
        message: item.message || "",

        createdAt: item.createdAt,
      };
    });

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
// Investor chỉ thấy favorite của mình
// API: GET /api/investors/favorites
// ======================================================

router.get("/favorites", async (req, res) => {
  try {
    const investorId = getInvestorId(req);

    const favorites = await Favorite.find({
      investor_id: investorId,
    })
      .populate("project_id")
      .sort({
        createdAt: -1,
      });

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

    const favorite =
      await Favorite.findOneAndUpdate(
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
        message:
          "Dự án đã có trong yêu thích",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
});

// ======================================================
// DELETE FAVORITE
// ======================================================

router.delete("/favorites/:id", async (req, res) => {
  try {
    const favorite = await Favorite.findById(
      req.params.id
    );

    if (!favorite) {
      return res.status(404).json({
        message:
          "Không tìm thấy yêu thích",
      });
    }

    // chỉ owner mới xóa được
    if (
      favorite.investor_id?.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Không có quyền",
      });
    }

    await Favorite.findByIdAndDelete(
      req.params.id
    );

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
// Investor chỉ thấy interest của mình
// ======================================================

router.get("/interests", async (req, res) => {
  try {
    const investorId = getInvestorId(req);

    const interests =
      await InvestorInterest.find({
        investor_id: investorId,
      })
        .populate("project_id")
        .sort({
          createdAt: -1,
        });

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
        message:
          "project_id không hợp lệ",
      });
    }

    const project = await Project.findById(
      project_id
    );

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    const interest =
      await InvestorInterest.findOneAndUpdate(
        {
          investor_id: investorId,
          project_id,
        },
        {
          investor_id: investorId,
          project_id,
          message,
          estimated_budget: Number(
            estimated_budget || 0
          ),
          status: "interested",
        },
        {
          new: true,
          upsert: true,
        }
      ).populate("project_id");

    // notification cho business owner
    const notification =
      await Notification.create({
        user_id:
          project.owner_id?.toString(),

        title:
          "Có nhà đầu tư quan tâm",

        content: `Có nhà đầu tư quan tâm dự án "${project.title}".`,

        type: "interest",

        metadata: {
          project_id: project._id,
          investor_id: investorId,
        },
      });

    req.app
      .get("io")
      ?.emit("new_notification", notification);

    res.status(201).json({
      message:
        "Đã gửi quan tâm đầu tư",
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
// ======================================================

router.put("/interests/:id", async (req, res) => {
  try {
    const interest =
      await InvestorInterest.findById(
        req.params.id
      );

    if (!interest) {
      return res.status(404).json({
        message:
          "Không tìm thấy quan tâm đầu tư",
      });
    }

    // chỉ owner sửa được
    if (
      interest.investor_id?.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Không có quyền",
      });
    }

    const {
      status,
      estimated_budget,
      message,
    } = req.body || {};

    const updateData = {};

    if (status) {
      updateData.status = status;
    }

    if (message !== undefined) {
      updateData.message = message;
    }

    if (estimated_budget !== undefined) {
      updateData.estimated_budget =
        Number(estimated_budget || 0);
    }

    const updatedInterest =
      await InvestorInterest.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      ).populate("project_id");

    res.json({
      message:
        "Cập nhật quan tâm đầu tư thành công",
      interest: updatedInterest,
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
// ======================================================

router.delete("/interests/:id", async (req, res) => {
  try {
    const interest =
      await InvestorInterest.findById(
        req.params.id
      );

    if (!interest) {
      return res.status(404).json({
        message:
          "Không tìm thấy quan tâm đầu tư",
      });
    }

    // chỉ owner xóa được
    if (
      interest.investor_id?.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Không có quyền",
      });
    }

    await InvestorInterest.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Đã xóa quan tâm đầu tư",
    });
  } catch (error) {
    console.error("DELETE INTEREST ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;