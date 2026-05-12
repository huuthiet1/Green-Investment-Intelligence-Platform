import express from "express";
import Project from "../models/Project.js";
import User from "../models/User.js";
import ESGScore from "../models/ESGScore.js";
import Report from "../models/Report.js";
import FundingRound from "../models/FundingRound.js";

const router = express.Router();

function normalize(text = "") {
  return text.toLowerCase().trim();
}

router.post("/chat", async (req, res) => {
  try {
    const { message = "" } = req.body || {};

    const text = normalize(message);

    let reply =
      "AI Admin Assistant chưa hiểu yêu cầu. Hãy thử hỏi về project, ESG, fraud hoặc users.";

    // ================= DASHBOARD =================

    if (
      text.includes("tổng quan") ||
      text.includes("dashboard") ||
      text.includes("thống kê")
    ) {
      const projects = await Project.countDocuments();
      const users = await User.countDocuments();
      const reports = await Report.countDocuments();

      const pendingProjects = await Project.countDocuments({
        status: "pending",
      });

      const approvedProjects = await Project.countDocuments({
        status: "approved",
      });

      reply = `
📊 Tổng quan hệ thống:

- Dự án: ${projects}
- Người dùng: ${users}
- Báo cáo vi phạm: ${reports}

📁 Dự án:
- Pending: ${pendingProjects}
- Approved: ${approvedProjects}
      `;
    }

    // ================= ESG =================

    else if (
      text.includes("esg thấp") ||
      text.includes("dự án esg thấp")
    ) {
      const esg = await ESGScore.find()
        .sort({ total_score: 1 })
        .limit(5)
        .populate("project_id", "title");

      if (!esg.length) {
        reply = "Không có dữ liệu ESG.";
      } else {
        reply = "⚠️ Top dự án ESG thấp:\n\n";

        esg.forEach((item, index) => {
          reply += `${index + 1}. ${
            item.project_id?.title || "Không rõ"
          } — ESG: ${item.total_score}\n`;
        });
      }
    }

    // ================= FRAUD =================

    else if (
      text.includes("fraud") ||
      text.includes("rủi ro") ||
      text.includes("nghi vấn")
    ) {
      const projects = await Project.find({
        ai_risk_level: "high",
      }).limit(5);

      if (!projects.length) {
        reply = "✅ Hiện chưa có dự án rủi ro cao.";
      } else {
        reply = "🚨 Dự án rủi ro cao:\n\n";

        projects.forEach((p, index) => {
          reply += `${index + 1}. ${p.title}
- Risk score: ${p.ai_risk_score || 0}%
- Status: ${p.status}
\n`;
        });
      }
    }

    // ================= USERS =================

    else if (
      text.includes("user bị khóa") ||
      text.includes("bị khóa") ||
      text.includes("banned")
    ) {
      const banned = await User.countDocuments({
        status: "banned",
      });

      reply = `🔒 Hiện có ${banned} tài khoản bị khóa.`;
    }

    // ================= REPORT =================

    else if (
      text.includes("report") ||
      text.includes("báo cáo")
    ) {
      const pendingReports = await Report.countDocuments({
        status: "pending",
      });

      const resolvedReports = await Report.countDocuments({
        status: "resolved",
      });

      reply = `
📄 Báo cáo hệ thống:

- Pending: ${pendingReports}
- Đã xử lý: ${resolvedReports}
      `;
    }

    // ================= FUNDING =================

    else if (
      text.includes("gọi vốn") ||
      text.includes("funding")
    ) {
      const rounds = await FundingRound.find()
        .sort({ target_amount: -1 })
        .limit(5)
        .populate("project_id", "title");

      if (!rounds.length) {
        reply = "Chưa có vòng gọi vốn.";
      } else {
        reply = "💰 Top funding rounds:\n\n";

        rounds.forEach((r, index) => {
          reply += `${index + 1}. ${
            r.project_id?.title || "Không rõ"
          }
- Goal: ${Number(r.target_amount || 0).toLocaleString("vi-VN")}đ
- Raised: ${Number(r.raised_amount || 0).toLocaleString("vi-VN")}đ

`;
        });
      }
    }

    // ================= AI MODERATION =================

    else if (
      text.includes("moderation") ||
      text.includes("kiểm duyệt")
    ) {
      const pending = await Project.countDocuments({
        review_status: "pending",
      });

      const suspended = await Project.countDocuments({
        review_status: "suspended",
      });

      reply = `
🛡️ AI Moderation:

- Dự án chờ duyệt: ${pending}
- Dự án bị tạm khóa: ${suspended}

👉 Khuyến nghị:
- Kiểm tra dự án có ROI quá cao
- Xác minh KYC doanh nghiệp
- Kiểm tra ESG thấp
      `;
    }

    res.json({
      reply,
    });
  } catch (error) {
    console.error("ADMIN AI ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;