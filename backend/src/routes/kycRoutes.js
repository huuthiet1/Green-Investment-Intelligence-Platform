import express from "express";
import KYCVerification from "../models/KYCVerification.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import kycUpload from "../middleware/kycUpload.js";
import { createAuditLog } from "../utils/audit.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const kycs = await KYCVerification.find()
      .populate("user_id", "name full_name email role organization_name")
      .sort({ createdAt: -1 });

    res.json({ kycs });
  } catch (error) {
    console.error("GET KYC ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", kycUpload.single("document"), async (req, res) => {
  try {
    const {
      user_id,
      user_role,
      full_name,
      email = "",
      organization_name = "",
      tax_code = "",
      document_type = "other",
      note = "",
    } = req.body || {};

    if (!user_id) {
      return res.status(400).json({ message: "Thiếu user_id" });
    }

    if (!user_role) {
      return res.status(400).json({ message: "Thiếu vai trò người dùng" });
    }

    if (!full_name) {
      return res.status(400).json({ message: "Thiếu họ tên" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Chưa upload tài liệu KYC" });
    }

    const document_url = `/uploads/kyc/${req.file.filename}`;

    const kyc = await KYCVerification.create({
      user_id,
      user_role,
      full_name,
      email,
      organization_name,
      tax_code,
      document_type,
      document_url,
      note,
      status: "pending",
    });

    await createAuditLog({
  req,
  action: "REVIEW_KYC",
  module: "kyc",
  target_id: kyc?._id,
  target_name: kyc?.full_name,
  new_data: {
    status: kyc?.status,
    admin_note: kyc?.admin_note,
  },
  note: "Admin xử lý hồ sơ KYC",
});

    const notification = await Notification.create({
      user_id: "admin",
      title: "Có hồ sơ KYC mới",
      content: `${full_name} vừa gửi hồ sơ xác minh KYC.`,
      type: "admin",
      metadata: {
        kyc_id: kyc._id,
      },
    });

    req.app.get("io")?.emit("new_notification", notification);

    res.status(201).json({
      message: "Gửi KYC thành công",
      kyc,
    });
  } catch (error) {
    console.error("CREATE KYC ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id/review", async (req, res) => {
  try {
    const {
      status,
      admin_note = "",
      reviewed_by = "admin-demo",
    } = req.body || {};

    const allowed = ["pending", "reviewing", "approved", "rejected"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Trạng thái KYC không hợp lệ" });
    }

    const kyc = await KYCVerification.findByIdAndUpdate(
      req.params.id,
      {
        status,
        admin_note,
        reviewed_by,
        reviewed_at: new Date(),
      },
      { new: true }
    );

    if (!kyc) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ KYC" });
    }

    if (status === "approved") {
      await User.findByIdAndUpdate(kyc.user_id, {
        is_verified: true,
        status: "active",
      });
    }

    if (status === "rejected") {
      await User.findByIdAndUpdate(kyc.user_id, {
        is_verified: false,
      });
    }

    const notification = await Notification.create({
      user_id: String(kyc.user_id),
      title: "KYC đã được cập nhật",
      content: `Hồ sơ KYC của bạn đã chuyển sang trạng thái ${status}.`,
      type: "admin",
      metadata: {
        kyc_id: kyc._id,
        status,
      },
    });

    req.app.get("io")?.emit("new_notification", notification);

    res.json({
      message: "Cập nhật KYC thành công",
      kyc,
    });
  } catch (error) {
    console.error("REVIEW KYC ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await KYCVerification.findByIdAndDelete(req.params.id);

    res.json({ message: "Xóa hồ sơ KYC thành công" });
  } catch (error) {
    console.error("DELETE KYC ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;