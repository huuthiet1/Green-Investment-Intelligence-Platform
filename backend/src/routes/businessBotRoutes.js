import express from "express";
import Project from "../models/Project.js";
import FundingRound from "../models/FundingRound.js";
import ESGScore from "../models/ESGScore.js";
import ProjectDocument from "../models/ProjectDocument.js";

const router = express.Router();

function detectIntent(text) {
  const msg = text.toLowerCase();

  if (msg.includes("esg")) return "esg";
  if (msg.includes("gọi vốn") || msg.includes("vốn")) return "funding";
  if (msg.includes("tài liệu") || msg.includes("hồ sơ") || msg.includes("pháp lý")) return "documents";
  if (msg.includes("dự án") || msg.includes("project")) return "project";
  if (msg.includes("nhà đầu tư") || msg.includes("investor")) return "investor";

  return "general";
}

router.post("/ask", async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({ message: "Thiếu nội dung câu hỏi" });
    }

    const intent = detectIntent(message);

    const projects = await Project.find().sort({ createdAt: -1 });
    const fundingRounds = await FundingRound.find();
    const esgScores = await ESGScore.find();
    const documents = await ProjectDocument.find();

    let reply = "";

    if (intent === "project") {
      const missingDescription = projects.filter((p) => !p.description).length;
      const missingImage = projects.filter((p) => !p.thumbnail_url).length;

      reply =
        `Doanh nghiệp hiện có ${projects.length} dự án.\n\n` +
        `Gợi ý cải thiện dự án:\n` +
        `1. Bổ sung mô tả chi tiết cho ${missingDescription} dự án còn thiếu.\n` +
        `2. Bổ sung ảnh đại diện cho ${missingImage} dự án chưa có ảnh.\n` +
        `3. Nên ghi rõ vốn cần gọi, ROI kỳ vọng, thời gian triển khai.\n` +
        `4. Nên thêm tài liệu pháp lý và báo cáo ESG để tăng độ tin cậy.`;
    }

    if (intent === "funding") {
      const totalTarget = fundingRounds.reduce(
        (sum, f) => sum + Number(f.target_amount || 0),
        0
      );

      const totalRaised = fundingRounds.reduce(
        (sum, f) => sum + Number(f.raised_amount || 0),
        0
      );

      const percent =
        totalTarget > 0 ? Math.round((totalRaised / totalTarget) * 100) : 0;

      reply =
        `Tình hình gọi vốn hiện tại:\n\n` +
        `- Tổng mục tiêu: ${totalTarget.toLocaleString("vi-VN")} VND\n` +
        `- Đã huy động: ${totalRaised.toLocaleString("vi-VN")} VND\n` +
        `- Tiến độ: ${percent}%\n\n` +
        `Gợi ý:\n` +
        `1. Chia vốn thành nhiều vòng nhỏ.\n` +
        `2. Cập nhật tiến độ gọi vốn thường xuyên.\n` +
        `3. Trình bày rõ mục đích sử dụng vốn.\n` +
        `4. Nếu ROI quá cao, nên giải thích cơ sở tính toán để nhà đầu tư tin tưởng.`;
    }

    if (intent === "esg") {
      const avgESG =
        esgScores.length > 0
          ? Math.round(
              esgScores.reduce((sum, e) => sum + Number(e.total_score || 0), 0) /
                esgScores.length
            )
          : 0;

      reply =
        `Điểm ESG trung bình hiện tại là ${avgESG}/100.\n\n` +
        `Gợi ý tăng điểm ESG:\n` +
        `1. Bổ sung số liệu giảm phát thải CO2.\n` +
        `2. Chứng minh dự án tạo việc làm cho cộng đồng.\n` +
        `3. Upload báo cáo môi trường hoặc giấy phép liên quan.\n` +
        `4. Minh bạch kế hoạch sử dụng vốn.\n` +
        `5. Cập nhật điểm E/S/G cho từng dự án.`;
    }

    if (intent === "documents") {
      reply =
        `Hiện hệ thống có ${documents.length} tài liệu đã upload.\n\n` +
        `Doanh nghiệp nên chuẩn bị thêm:\n` +
        `1. Hồ sơ pháp lý dự án.\n` +
        `2. Báo cáo tài chính hoặc kế hoạch sử dụng vốn.\n` +
        `3. Báo cáo ESG.\n` +
        `4. Pitch deck giới thiệu dự án.\n` +
        `5. Hình ảnh thực tế hoặc bản thiết kế dự án.`;
    }

    if (intent === "investor") {
      reply =
        `Để thu hút nhà đầu tư, doanh nghiệp nên:\n\n` +
        `1. Làm nổi bật ROI kỳ vọng và thời gian hoàn vốn.\n` +
        `2. Cập nhật ESG score cao và có bằng chứng đi kèm.\n` +
        `3. Upload đầy đủ tài liệu pháp lý.\n` +
        `4. Trả lời tin nhắn nhà đầu tư nhanh.\n` +
        `5. Tạo vòng gọi vốn rõ ràng, có mục tiêu và tiến độ.`;
    }

    if (intent === "general") {
      reply =
        `Tôi là trợ lý AI dành cho doanh nghiệp.\n\n` +
        `Bạn có thể hỏi tôi về:\n` +
        `- Cách cải thiện dự án\n` +
        `- Cách tăng điểm ESG\n` +
        `- Cách gọi vốn hiệu quả\n` +
        `- Hồ sơ tài liệu cần chuẩn bị\n` +
        `- Cách thu hút nhà đầu tư`;
    }

    res.json({
      intent,
      reply,
    });
  } catch (error) {
    console.error("BUSINESS BOT ERROR:", error);
    res.status(500).json({
      message: error.message || "Lỗi chatbot doanh nghiệp",
    });
  }
});

export default router;