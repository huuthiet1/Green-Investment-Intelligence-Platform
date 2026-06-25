import express from "express";
import GreenCreditScore from "../models/GreenCreditScore.js";
import Project from "../models/Project.js";

const router = express.Router();

const getUserId = (req) => req.user._id.toString();

const clamp = (value, min = 0, max = 100) => {
  return Math.max(min, Math.min(max, Number(value || 0)));
};

function scoreCurrentRatio(value) {
  const v = Number(value || 0);
  if (v >= 2) return 100;
  if (v >= 1.5) return 85;
  if (v >= 1.2) return 70;
  if (v >= 1) return 55;
  return 30;
}

function scoreQuickRatio(value) {
  const v = Number(value || 0);
  if (v >= 1.5) return 100;
  if (v >= 1.2) return 85;
  if (v >= 1) return 70;
  if (v >= 0.8) return 55;
  return 30;
}

function scoreDebtToEquity(value) {
  const v = Number(value || 0);
  if (v <= 0.5) return 100;
  if (v <= 1) return 85;
  if (v <= 1.5) return 70;
  if (v <= 2) return 50;
  return 25;
}

function scoreDebtToAsset(value) {
  const v = Number(value || 0);
  if (v <= 0.3) return 100;
  if (v <= 0.5) return 80;
  if (v <= 0.65) return 60;
  if (v <= 0.8) return 40;
  return 20;
}

function scoreProfit(value) {
  const v = Number(value || 0);
  if (v >= 20) return 100;
  if (v >= 15) return 85;
  if (v >= 10) return 70;
  if (v >= 5) return 55;
  return 30;
}

function scoreCashFlow(value) {
  const v = Number(value || 0);
  if (v >= 0.5) return 100;
  if (v >= 0.35) return 85;
  if (v >= 0.2) return 70;
  if (v >= 0.1) return 55;
  return 25;
}

function calculateFinancialScore(data) {
  const liquidity =
    scoreCurrentRatio(data.current_ratio) * 0.5 +
    scoreQuickRatio(data.quick_ratio) * 0.5;

  const leverage =
    scoreDebtToEquity(data.debt_to_equity) * 0.5 +
    scoreDebtToAsset(data.debt_to_asset) * 0.5;

  const profitability =
    scoreProfit(data.roe) * 0.35 +
    scoreProfit(data.roa) * 0.25 +
    scoreProfit(data.ebitda_margin) * 0.4;

  const cashFlow = scoreCashFlow(data.operating_cash_flow_to_debt);

  return Math.round(
    liquidity * 0.25 +
      leverage * 0.25 +
      profitability * 0.3 +
      cashFlow * 0.2
  );
}

function calculateESGScore(data) {
  return Math.round(
    clamp(data.energy_saving_rate) * 0.2 +
      clamp(data.recycled_material_rate) * 0.15 +
      clamp(data.carbon_reduction_rate) * 0.25 +
      clamp(data.waste_treatment_rate) * 0.15 +
      clamp(data.green_certificate_score) * 0.15 +
      clamp(data.governance_score) * 0.1
  );
}

function getRating(score) {
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  return "D";
}

function getRiskLevel(score) {
  if (score >= 80) return "low";
  if (score >= 65) return "medium";
  if (score >= 50) return "high";
  return "very_high";
}

function getPD(score) {
  if (score >= 80) return 3;
  if (score >= 65) return 7;
  if (score >= 50) return 14;
  return 25;
}

function getInterestRate(score) {
  if (score >= 80) return 7.2;
  if (score >= 65) return 8.5;
  if (score >= 50) return 10.2;
  return 12.5;
}

function getRecommendation(rating) {
  if (rating === "A") {
    return "Doanh nghiệp có sức khỏe tài chính và ESG tốt. Có thể ưu tiên cấp tín dụng xanh với lãi suất thấp.";
  }

  if (rating === "B") {
    return "Doanh nghiệp có khả năng tiếp cận vốn khá tốt. Có thể cấp tín dụng xanh kèm giám sát định kỳ.";
  }

  if (rating === "C") {
    return "Doanh nghiệp có rủi ro trung bình cao. Nên bổ sung bảo lãnh tín dụng xanh, tài sản bảo đảm hoặc cải thiện dòng tiền.";
  }

  return "Doanh nghiệp có rủi ro cao. Chưa khuyến nghị cấp vốn nếu chưa cải thiện tài chính và minh bạch ESG.";
}

function calculateResult(data) {
  const financialScore = calculateFinancialScore(data);
  const esgScore = calculateESGScore(data);

  const totalScore = Math.round(financialScore * 0.45 + esgScore * 0.55);
  const rating = getRating(totalScore);
  const riskLevel = getRiskLevel(totalScore);
  const pd = getPD(totalScore);
  const lgd = riskLevel === "low" ? 30 : riskLevel === "medium" ? 40 : 55;
  const ead = Number(data.exposure_at_default || data.loan_amount || 0);
  const expectedLoss = Math.round(ead * (pd / 100) * (lgd / 100));

  return {
    financial_score: financialScore,
    esg_score: esgScore,
    total_score: totalScore,
    rating,
    risk_level: riskLevel,
    probability_of_default: pd,
    loss_given_default: lgd,
    exposure_at_default: ead,
    expected_loss: expectedLoss,
    suggested_interest_rate: getInterestRate(totalScore),
    loan_recommendation: getRecommendation(rating),
  };
}

router.post("/calculate", async (req, res) => {
  try {
    const result = calculateResult(req.body || {});
    res.json({ result });
  } catch (error) {
    console.error("CALCULATE GREEN CREDIT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const businessId = getUserId(req);
    const data = req.body || {};

    let project = null;

    if (data.project_id) {
      project = await Project.findById(data.project_id);

      if (!project) {
        return res.status(404).json({
          message: "Không tìm thấy dự án",
        });
      }

      if (project.owner_id?.toString() !== businessId) {
        return res.status(403).json({
          message: "Bạn không có quyền chấm điểm dự án này",
        });
      }
    }

    const result = calculateResult(data);

    const score = await GreenCreditScore.create({
      business_id: businessId,
      project_id: data.project_id || null,
      business_name:
        data.business_name ||
        req.user.organization_name ||
        req.user.full_name ||
        "",

      current_ratio: Number(data.current_ratio || 0),
      quick_ratio: Number(data.quick_ratio || 0),
      debt_to_equity: Number(data.debt_to_equity || 0),
      debt_to_asset: Number(data.debt_to_asset || 0),
      roe: Number(data.roe || 0),
      roa: Number(data.roa || 0),
      ebitda_margin: Number(data.ebitda_margin || 0),
      operating_cash_flow_to_debt: Number(
        data.operating_cash_flow_to_debt || 0
      ),

      energy_saving_rate: Number(data.energy_saving_rate || 0),
      recycled_material_rate: Number(data.recycled_material_rate || 0),
      carbon_reduction_rate: Number(data.carbon_reduction_rate || 0),
      waste_treatment_rate: Number(data.waste_treatment_rate || 0),
      green_certificate_score: Number(data.green_certificate_score || 0),
      governance_score: Number(data.governance_score || 0),

      ...result,
    });

    res.status(201).json({
      message: "Lưu kết quả Green Credit Score thành công",
      score,
    });
  } catch (error) {
    console.error("CREATE GREEN CREDIT SCORE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/my", async (req, res) => {
  try {
    const scores = await GreenCreditScore.find({
      business_id: getUserId(req),
    })
      .populate("project_id")
      .sort({ createdAt: -1 });

    res.json({ scores });
  } catch (error) {
    console.error("GET MY GREEN CREDIT SCORES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const scores = await GreenCreditScore.find()
      .populate("project_id")
      .sort({ createdAt: -1 });

    res.json({ scores });
  } catch (error) {
    console.error("GET GREEN CREDIT SCORES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const score = await GreenCreditScore.findById(req.params.id);

    if (!score) {
      return res.status(404).json({
        message: "Không tìm thấy kết quả chấm điểm",
      });
    }

    if (score.business_id !== getUserId(req) && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Không có quyền xóa kết quả này",
      });
    }

    await GreenCreditScore.findByIdAndDelete(req.params.id);

    res.json({
      message: "Xóa kết quả chấm điểm thành công",
    });
  } catch (error) {
    console.error("DELETE GREEN CREDIT SCORE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;