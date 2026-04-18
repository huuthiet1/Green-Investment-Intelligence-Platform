import express from "express";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/dashboard/overview
router.get("/overview", protect, async (req, res) => {
  try {
    return res.status(200).json({
      stats: {
        totalProjects: 128,
        totalInvestors: 2460,
        totalCapital: "85.2B",
        avgESG: 84.6,
      },
      summary: [
        { id: 1, label: "Dự án nổi bật", value: "24" },
        { id: 2, label: "Vòng gọi vốn mở", value: "17" },
        { id: 3, label: "Báo cáo vi phạm", value: "05" },
      ],
      projects: [
        {
          id: 1,
          name: "Solar Farm Bình Thuận",
          category: "Năng lượng tái tạo",
          esg: 92,
          capital: "12.5B VND",
          status: "Đang gọi vốn",
        },
        {
          id: 2,
          name: "Green Waste Recycle Hub",
          category: "Xử lý rác thải",
          esg: 88,
          capital: "8.2B VND",
          status: "Đang gọi vốn",
        },
        {
          id: 3,
          name: "Eco Agriculture Mekong",
          category: "Nông nghiệp xanh",
          esg: 81,
          capital: "5.6B VND",
          status: "Chờ duyệt",
        },
        {
          id: 4,
          name: "Smart Energy Retrofit",
          category: "Tiết kiệm năng lượng",
          esg: 85,
          capital: "9.8B VND",
          status: "Đã duyệt",
        },
      ],
      activities: [
        {
          id: 1,
          content: "Nhà đầu tư Nguyễn Minh vừa quan tâm dự án Solar Farm Bình Thuận",
          time: "Vừa xong",
        },
        {
          id: 2,
          content: "Admin cập nhật bộ tiêu chí ESG phiên bản mới",
          time: "10 phút trước",
        },
        {
          id: 3,
          content: "Dự án Green Waste Recycle Hub vừa được duyệt",
          time: "24 phút trước",
        },
        {
          id: 4,
          content: "Có 12 tin nhắn mới giữa nhà đầu tư và doanh nghiệp",
          time: "40 phút trước",
        },
      ],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi lấy dữ liệu dashboard",
      error: error.message,
    });
  }
});

export default router;