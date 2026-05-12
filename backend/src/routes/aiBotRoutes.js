import express from "express";
import Project from "../models/Project.js";

const router = express.Router();

function analyzeMessage(message) {
  const text = message.toLowerCase();

  if (text.includes("đầu tư") || text.includes("goi y") || text.includes("gợi ý")) {
    return "recommend_projects";
  }

  if (text.includes("esg")) {
    return "esg_advice";
  }

  if (text.includes("gọi vốn") || text.includes("von") || text.includes("vốn")) {
    return "funding_advice";
  }

  if (text.includes("rủi ro") || text.includes("risk")) {
    return "risk_advice";
  }

  return "general";
}

router.post("/ask", async (req, res) => {
  try {
    const { message, role = "investor" } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Thiếu nội dung câu hỏi" });
    }

    const intent = analyzeMessage(message);
    let reply = "";

    if (intent === "recommend_projects") {
      const projects = await Project.find()
        .sort({ esg_score: -1, roi_expected: -1 })
        .limit(5);

      if (!projects.length) {
        reply = "Hiện chưa có dự án phù hợp để gợi ý.";
      } else {
        reply =
          "Dưới đây là một số dự án xanh đáng quan tâm:\n\n" +
          projects
            .map(
              (p, index) =>
                `${index + 1}. ${p.title}\n` +
                `- Danh mục: ${p.category_name || "Chưa rõ"}\n` +
                `- Vốn cần gọi: ${Number(p.capital_needed || 0).toLocaleString("vi-VN")} VND\n` +
                `- ROI kỳ vọng: ${p.roi_expected || 0}%\n` +
                `- ESG: ${p.esg_score || 0}\n` +
                `- Rủi ro: ${p.risk_level || "medium"}`
            )
            .join("\n\n");
      }
    }

    if (intent === "esg_advice") {
      reply =
        "Để tăng điểm ESG, doanh nghiệp nên:\n\n" +
        "1. Bổ sung số liệu giảm phát thải CO2.\n" +
        "2. Upload tài liệu pháp lý và báo cáo môi trường.\n" +
        "3. Chứng minh dự án tạo việc làm cho cộng đồng.\n" +
        "4. Minh bạch kế hoạch sử dụng vốn.\n" +
        "5. Cập nhật chỉ số năng lượng tái tạo hoặc tiết kiệm năng lượng.";
    }

    if (intent === "funding_advice") {
      reply =
        "Để tăng khả năng gọi vốn, doanh nghiệp nên:\n\n" +
        "1. Chia vốn thành nhiều vòng gọi vốn nhỏ.\n" +
        "2. Nêu rõ số vốn cần gọi và mục đích sử dụng.\n" +
        "3. Đưa ra ROI kỳ vọng hợp lý.\n" +
        "4. Upload hình ảnh, tài liệu và báo cáo ESG.\n" +
        "5. Cập nhật tiến độ huy động thường xuyên.";
    }

    if (intent === "risk_advice") {
      reply =
        "Khi đánh giá rủi ro dự án, nhà đầu tư nên xem:\n\n" +
        "1. Mức vốn cần gọi có phù hợp quy mô không.\n" +
        "2. ROI kỳ vọng có quá cao bất thường không.\n" +
        "3. Hồ sơ pháp lý có đầy đủ không.\n" +
        "4. Điểm ESG và minh bạch báo cáo.\n" +
        "5. Tiến độ gọi vốn và mức quan tâm của nhà đầu tư khác.";
    }

    if (intent === "general") {
      reply =
        role === "business"
          ? "Bạn có thể hỏi tôi về cách tăng điểm ESG, tối ưu hồ sơ dự án, tạo vòng gọi vốn hoặc thu hút nhà đầu tư."
          : "Bạn có thể hỏi tôi về dự án nên đầu tư, rủi ro, ROI, ESG hoặc danh mục dự án xanh phù hợp.";
    }

    res.json({
      reply,
      intent,
    });
  } catch (error) {
    console.error("AI BOT ERROR:", error);
    res.status(500).json({ message: "Lỗi chatbot tư vấn" });
  }
});

export default router;