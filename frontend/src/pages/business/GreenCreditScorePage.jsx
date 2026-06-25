import React, { useEffect, useState } from "react";
import {
  Calculator,
  Leaf,
  RefreshCcw,
  ShieldCheck,
  TrendingDown,
  Wallet,
} from "lucide-react";
import api from "../../lib/axios";
import { Card, SectionTitle } from "./BusinessLayout";

export default function GreenCreditScorePage() {
  const [form, setForm] = useState({
    business_name: "",
    loan_amount: 500000000,

    current_ratio: 1.5,
    quick_ratio: 1.1,
    debt_to_equity: 1.2,
    debt_to_asset: 0.55,
    roe: 12,
    roa: 8,
    ebitda_margin: 15,
    operating_cash_flow_to_debt: 0.25,

    energy_saving_rate: 65,
    recycled_material_rate: 50,
    carbon_reduction_rate: 60,
    waste_treatment_rate: 70,
    green_certificate_score: 60,
    governance_score: 65,
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/green-credit-score/my");
      setHistory(res.data.scores || []);
    } catch (error) {
      console.error("FETCH GREEN CREDIT HISTORY ERROR:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const calculateAndSave = async () => {
    try {
      setLoading(true);

      const payload = {};

      Object.entries(form).forEach(([key, value]) => {
        payload[key] = key === "business_name" ? value : Number(value || 0);
      });

      const res = await api.post("/green-credit-score", payload);

      setResult(res.data.score);
      fetchHistory();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Lỗi tính điểm tín dụng xanh"
      );
    } finally {
      setLoading(false);
    }
  };

  const latest = result || history[0];

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Green Credit Score"
        title="Khung đánh giá rủi ro tài chính SME xanh"
        right={
          <button
            onClick={calculateAndSave}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <Calculator className="h-4 w-4" />
            {loading ? "Đang tính..." : "Tính & lưu điểm"}
          </button>
        }
      />

      {latest && (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
            <MetricCard
              icon={ShieldCheck}
              label="Tổng điểm"
              value={latest.total_score}
            />

            <MetricCard icon={Leaf} label="ESG" value={latest.esg_score} />

            <MetricCard
              icon={Wallet}
              label="Tài chính"
              value={latest.financial_score}
            />

            <MetricCard
              icon={TrendingDown}
              label="PD"
              value={`${latest.probability_of_default}%`}
            />

            <MetricCard
              icon={TrendingDown}
              label="Expected Loss"
              value={formatMoney(latest.expected_loss)}
            />

            <MetricCard
              icon={Calculator}
              label="LS vay gợi ý"
              value={`${latest.suggested_interest_rate}%`}
            />
          </div>

          <Card className="p-6">
            <p className="text-sm text-white/45">Xếp hạng tín dụng xanh</p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-6">
              <div>
                <h2 className="text-7xl font-black text-green-400">
                  {latest.rating}
                </h2>

                <p className="mt-3 text-xl font-semibold text-white">
                  {translateRisk(latest.risk_level)}
                </p>
              </div>

              <div className="max-w-4xl rounded-3xl bg-slate-900/70 p-6 text-white/70">
                {latest.loan_recommendation}
              </div>
            </div>
          </Card>
        </>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-5 text-xl font-bold text-white">
            Chỉ số tài chính SME
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <InputBox
              label="Tên doanh nghiệp"
              type="text"
              value={form.business_name}
              onChange={(v) => updateForm("business_name", v)}
            />

            <InputBox
              label="Số tiền vay đề xuất"
              value={form.loan_amount}
              onChange={(v) => updateForm("loan_amount", v)}
            />

            <InputBox
              label="Current Ratio"
              value={form.current_ratio}
              step="0.01"
              onChange={(v) => updateForm("current_ratio", v)}
            />

            <InputBox
              label="Quick Ratio"
              value={form.quick_ratio}
              step="0.01"
              onChange={(v) => updateForm("quick_ratio", v)}
            />

            <InputBox
              label="Debt / Equity"
              value={form.debt_to_equity}
              step="0.01"
              onChange={(v) => updateForm("debt_to_equity", v)}
            />

            <InputBox
              label="Debt / Asset"
              value={form.debt_to_asset}
              step="0.01"
              onChange={(v) => updateForm("debt_to_asset", v)}
            />

            <InputBox
              label="ROE (%)"
              value={form.roe}
              step="0.1"
              onChange={(v) => updateForm("roe", v)}
            />

            <InputBox
              label="ROA (%)"
              value={form.roa}
              step="0.1"
              onChange={(v) => updateForm("roa", v)}
            />

            <InputBox
              label="EBITDA Margin (%)"
              value={form.ebitda_margin}
              step="0.1"
              onChange={(v) => updateForm("ebitda_margin", v)}
            />

            <InputBox
              label="OCF / Debt"
              value={form.operating_cash_flow_to_debt}
              step="0.01"
              onChange={(v) =>
                updateForm("operating_cash_flow_to_debt", v)
              }
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-5 text-xl font-bold text-white">
            Chỉ số ESG định lượng
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <InputBox
              label="Tiết kiệm năng lượng (%)"
              value={form.energy_saving_rate}
              onChange={(v) => updateForm("energy_saving_rate", v)}
            />

            <InputBox
              label="Tỷ lệ tái chế (%)"
              value={form.recycled_material_rate}
              onChange={(v) => updateForm("recycled_material_rate", v)}
            />

            <InputBox
              label="Giảm CO₂ (%)"
              value={form.carbon_reduction_rate}
              onChange={(v) => updateForm("carbon_reduction_rate", v)}
            />

            <InputBox
              label="Xử lý chất thải (%)"
              value={form.waste_treatment_rate}
              onChange={(v) => updateForm("waste_treatment_rate", v)}
            />

            <InputBox
              label="Chứng nhận xanh"
              value={form.green_certificate_score}
              onChange={(v) => updateForm("green_certificate_score", v)}
            />

            <InputBox
              label="Quản trị"
              value={form.governance_score}
              onChange={(v) => updateForm("governance_score", v)}
            />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h3 className="text-xl font-bold text-white">
            Lịch sử chấm điểm
          </h3>

          <button
            onClick={fetchHistory}
            className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-white/70 hover:bg-white/5"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="border-b border-white/10 text-left text-white/50">
              <tr>
                <th className="p-4">Ngày</th>
                <th>Doanh nghiệp</th>
                <th>Tài chính</th>
                <th>ESG</th>
                <th>Tổng</th>
                <th>Hạng</th>
                <th>Rủi ro</th>
                <th>PD</th>
                <th>Lãi suất</th>
              </tr>
            </thead>

            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-10 text-center text-white/45">
                    Chưa có dữ liệu chấm điểm
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item._id} className="border-b border-white/5">
                    <td className="p-4">
                      {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{item.business_name || "SME xanh"}</td>
                    <td>{item.financial_score}</td>
                    <td>{item.esg_score}</td>
                    <td className="font-semibold text-green-300">
                      {item.total_score}
                    </td>
                    <td>{item.rating}</td>
                    <td>{translateRisk(item.risk_level)}</td>
                    <td>{item.probability_of_default}%</td>
                    <td>{item.suggested_interest_rate}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function InputBox({ label, value, onChange, type = "number", step = "1" }) {
  return (
    <label>
      <p className="mb-2 text-sm text-white/55">{label}</p>

      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
      />
    </label>
  );
}

function MetricCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
        <Icon className="h-6 w-6" />
      </div>

      <p className="text-sm text-white/50">{label}</p>
      <h3 className="mt-2 text-2xl font-bold text-white">{value}</h3>
    </Card>
  );
}

function translateRisk(value) {
  const map = {
    low: "Rủi ro thấp",
    medium: "Rủi ro trung bình",
    high: "Rủi ro cao",
    very_high: "Rủi ro rất cao",
  };

  return map[value] || value;
}

function formatMoney(value) {
  const number = Number(value || 0);

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(1)} tỷ`;
  }

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)} triệu`;
  }

  return `${number.toLocaleString("vi-VN")}đ`;
}