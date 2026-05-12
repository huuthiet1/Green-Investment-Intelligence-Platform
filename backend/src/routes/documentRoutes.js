import express from "express";
import ProjectDocument from "../models/ProjectDocument.js";
import documentUpload from "../middleware/documentUpload.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const docs = await ProjectDocument.find()
      .populate("project_id", "title")
      .sort({ createdAt: -1 });

    res.json({ documents: docs });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

router.post(
  "/upload",
  documentUpload.single("file"),
  async (req, res) => {
    try {
      const {
        project_id,
        title,
        document_type,
      } = req.body;

      if (!project_id) {
        return res.status(400).json({
          message: "Thiếu project_id",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Chưa chọn file",
        });
      }

      const doc = await ProjectDocument.create({
        project_id,
        title,
        document_type,
        file_url: `/uploads/documents/${req.file.filename}`,
      });

      res.status(201).json({
        message: "Upload tài liệu thành công",
        document: doc,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  }
);

router.delete("/:id", async (req, res) => {
  try {
    await ProjectDocument.findByIdAndDelete(req.params.id);

    res.json({
      message: "Xóa tài liệu thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;