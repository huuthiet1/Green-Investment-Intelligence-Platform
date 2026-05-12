import express from "express";
import Project from "../models/Project.js";
import upload from "../middleware/upload.js";

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
// GET ALL PROJECTS
// API: GET /api/projects
// ======================================================

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    res.json({ projects });
  } catch (error) {
    console.error("GET ALL PROJECTS ERROR:", error);

    res.status(500).json({
      message: "Lỗi lấy danh sách tất cả dự án",
    });
  }
});

// ======================================================
// GET MY PROJECTS
// API: GET /api/projects/my
// ======================================================

router.get("/my", async (req, res) => {
  try {
    const projects = await Project.find().sort({
      createdAt: -1,
    });

    res.json({ projects });
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

      // Owner
      owner_id: body.owner_id || undefined,

      // Category
      category_name:
        body.category_name ||
        categoryMap[body.category_id] ||
        "Công nghệ sạch",

      // Status
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

      // Upload thumbnail
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
// API: PUT /api/projects/:id
// ======================================================

router.put("/:id", upload.single("thumbnail"), async (req, res) => {
  try {
    const body = req.body;

    const updateData = {
      ...body,

      // Category
      category_name:
        body.category_name ||
        categoryMap[body.category_id] ||
        body.category_name,

      // Status
      status:
        body.status ||
        statusMap[body.status_id] ||
        body.status,

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
    };

    // Update thumbnail if uploaded
    if (req.file) {
      updateData.thumbnail_url =
        `/uploads/projects/${req.file.filename}`;
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    res.json({
      message: "Cập nhật dự án thành công",
      project,
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
// API: DELETE /api/projects/:id
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(
      req.params.id
    );

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

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