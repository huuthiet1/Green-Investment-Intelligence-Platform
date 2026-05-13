import express from "express";
import mongoose from "mongoose";
import Project from "../models/Project.js";
import upload from "../middleware/upload.js";
import InvestorInterest from "../models/InvestorInterest.js";

const router = express.Router();

// ======================================================
// CATEGORY MAP
// ======================================================

const categoryMap = {
  1: "Năng lượng tái tạo",
  2: "Nông nghiệp xanh",
  3: "Xử lý rác thải",
  4: "Công nghệ sạch",
  5: "Giao thông xanh",
  6: "Tiết kiệm năng lượng",
};

// ======================================================
// STATUS MAP
// ======================================================

const statusMap = {
  1: "draft",
  2: "pending",
  3: "approved",
  4: "rejected",
  5: "closed",
  6: "funded",
};

// ======================================================
// GET PUBLIC PROJECTS
// Investor xem project approved
// API: GET /api/projects
// ======================================================

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({
      status: "approved",
    }).sort({
      createdAt: -1,
    });

    res.json({ projects });
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);

    res.status(500).json({
      message: "Lỗi lấy danh sách dự án",
    });
  }
});

// ======================================================
// GET MY PROJECTS
// Business chỉ thấy project của mình
// API: GET /api/projects/my
// ======================================================

router.get("/my", async (req, res) => {
  try {
    const projects = await Project.find({
      owner_id: req.user._id.toString(),
    }).sort({
      createdAt: -1,
    });

    const projectIds = projects.map((p) => p._id);

    // lấy danh sách investor quan tâm
    const interests = await InvestorInterest.find({
      project_id: { $in: projectIds },
    });

    // map số investor theo project
    const interestMap = {};

    interests.forEach((item) => {
      const id = item.project_id.toString();

      interestMap[id] = (interestMap[id] || 0) + 1;
    });

    // format dữ liệu trả về
    const formattedProjects = projects.map((project) => {
      const obj = project.toObject();

      return {
        ...obj,

        views: obj.views || 0,

        investor_count:
          interestMap[project._id.toString()] || 0,

        esg_score:
          obj.esg_score ||
          obj.total_esg_score ||
          0,
      };
    });

    res.json({
      projects: formattedProjects,
    });
  } catch (error) {
    console.error("GET MY PROJECTS ERROR:", error);

    res.status(500).json({
      message: "Lỗi lấy danh sách dự án",
    });
  }
});

// ======================================================
// GET PROJECT DETAIL
// API: GET /api/projects/:id
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "ID dự án không hợp lệ",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    res.json({ project });
  } catch (error) {
    console.error("GET PROJECT DETAIL ERROR:", error);

    res.status(500).json({
      message: "Lỗi lấy chi tiết dự án",
    });
  }
});

// ======================================================
// CREATE PROJECT
// API: POST /api/projects
// ======================================================

router.post("/", upload.single("thumbnail"), async (req, res) => {
  try {
    const body = req.body;

    const project = await Project.create({
      ...body,

      // Chủ sở hữu = user đang login
      owner_id: req.user._id.toString(),

      // Category
      category_name:
        body.category_name ||
        categoryMap[body.category_id] ||
        "Công nghệ sạch",

      // Status mặc định
      status:
        body.status ||
        statusMap[body.status_id] ||
        "pending",

      // Number fields
      capital_needed: Number(body.capital_needed || 0),

      roi_expected: Number(body.roi_expected || 0),

      project_duration_months: Number(
        body.project_duration_months || 0
      ),

      carbon_reduction_est: Number(
        body.carbon_reduction_est || 0
      ),

      jobs_created_est: Number(
        body.jobs_created_est || 0
      ),

      // Thumbnail
      thumbnail_url: req.file
        ? `/uploads/projects/${req.file.filename}`
        : "",
    });

    res.status(201).json({
      message: "Tạo dự án thành công",
      project,
    });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    res.status(500).json({
      message: error.message || "Lỗi tạo dự án",
    });
  }
});

// ======================================================
// UPDATE PROJECT
// Chỉ owner mới sửa được
// API: PUT /api/projects/:id
// ======================================================

router.put("/:id", upload.single("thumbnail"), async (req, res) => {
  try {
    const body = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    // Check owner
    if (
      project.owner_id?.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Không có quyền sửa dự án này",
      });
    }

    const updateData = {
      ...body,

      category_name:
        body.category_name ||
        categoryMap[body.category_id] ||
        body.category_name,

      status:
        body.status ||
        statusMap[body.status_id] ||
        body.status,

      capital_needed: Number(body.capital_needed || 0),

      roi_expected: Number(body.roi_expected || 0),

      project_duration_months: Number(
        body.project_duration_months || 0
      ),

      carbon_reduction_est: Number(
        body.carbon_reduction_est || 0
      ),

      jobs_created_est: Number(
        body.jobs_created_est || 0
      ),
    };

    if (req.file) {
      updateData.thumbnail_url =
        `/uploads/projects/${req.file.filename}`;
    }

    const updatedProject =
      await Project.findByIdAndUpdate(
        req.params.id,
        updateData,
        {
          new: true,
        }
      );

    res.json({
      message: "Cập nhật dự án thành công",
      project: updatedProject,
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    res.status(500).json({
      message: error.message || "Lỗi cập nhật dự án",
    });
  }
});

// ======================================================
// DELETE PROJECT
// Chỉ owner mới xóa được
// API: DELETE /api/projects/:id
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    // Check owner
    if (
      project.owner_id?.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "Không có quyền xóa dự án này",
      });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      message: "Xóa dự án thành công",
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);

    res.status(500).json({
      message: "Lỗi xóa dự án",
    });
  }
});

export default router;