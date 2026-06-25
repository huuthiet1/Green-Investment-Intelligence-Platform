import React, { useState } from "react";
import {
  Calculator,
  RefreshCcw,
  TrendingUp,
  Wallet,
  BarChart3,
  BadgePercent,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../lib/axios";
import { Card, SectionTitle } from "./AdminLayout";

export default function AdminFinancialFeasibilityPage() {
  const [form, setForm] = useState({
    initial_investment: 800000000,
    years: 5,

    projects_per_year: 40,
    avg_funding_amount: 500000000,
    success_rate: 0.25,

    transaction_fee_rate: 0.03,
    project_listing_fee: 1500000,
    due_diligence_fee: 3000000,
    membership_fee: 2000000,
    members_per_year: 30,

    staff_cost: 420000000,
    technology_cost: 180000000,
    marketing_cost: 240000000,
    admin_cost: 120000000,
    due_diligence_cost: 100000000,

    growth_rate: 0.25,
    cost_growth_rate: 0.12,
    tax_rate: 0.2,
    discount_rate: 0.12,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateForm = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const analyze = async () => {
    try {
      setLoading(true);

      const payload = {};

      Object.entries(form).forEach(([key, value]) => {
        payload[key] = Number(value || 0);
      });

      const res = await api.post(
        "/financial-feasibility/analyze",
        payload
      );

      setResult(res.data);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Lỗi phân tích tài chính"
      );
    } finally {
      setLoading(false);
    }
  };

  const rows = result?.rows || [];

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Financial Feasibility"
        title="Phân tích tính khả thi tài chính GIIP"
        right={
          <button
            onClick={analyze}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <Calculator className="h-4 w-4" />
            {loading ? "Đang tính..." : "Phân tích"}
          </button>
        }
      />

      <Card className="p-6">
        <h3 className="mb-5 text-xl font-bold text-white">
          Thông số đầu vào
        </h3>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InputBox
            label="Vốn đầu tư ban đầu"
            value={form.initial_investment}
            onChange={(v) => updateForm("initial_investment", v)}
          />

          <InputBox
            label="Số năm dự phóng"
            value={form.years}
            onChange={(v) => updateForm("years", v)}
          />

          <InputBox
            label="Số dự án/năm"
            value={form.projects_per_year}
            onChange={(v) => updateForm("projects_per_year", v)}
          />

          <InputBox
            label="Giá trị gọi vốn TB"
            value={form.avg_funding_amount}
            onChange={(v) => updateForm("avg_funding_amount", v)}
          />

          <InputBox
            label="Tỷ lệ giao dịch thành công"
            value={form.success_rate}
            step="0.01"
            onChange={(v) => updateForm("success_rate", v)}
          />

          <InputBox
            label="Phí giao dịch"
            value={form.transaction_fee_rate}
            step="0.01"
            onChange={(v) => updateForm("transaction_fee_rate", v)}
          />

          <InputBox
            label="Phí đăng dự án"
            value={form.project_listing_fee}
            onChange={(v) => updateForm("project_listing_fee", v)}
          />

          <InputBox
            label="Phí thẩm định"
            value={form.due_diligence_fee}
            onChange={(v) => updateForm("due_diligence_fee", v)}
          />

          <InputBox
            label="Phí thành viên"
            value={form.membership_fee}
            onChange={(v) => updateForm("membership_fee", v)}
          />

          <InputBox
            label="Số thành viên/năm"
            value={form.members_per_year}
            onChange={(v) => updateForm("members_per_year", v)}
          />

          <InputBox
            label="Chi phí nhân sự"
            value={form.staff_cost}
            onChange={(v) => updateForm("staff_cost", v)}
          />

          <InputBox
            label="Chi phí công nghệ"
            value={form.technology_cost}
            onChange={(v) => updateForm("technology_cost", v)}
          />

          <InputBox
            label="Chi phí marketing"
            value={form.marketing_cost}
            onChange={(v) => updateForm("marketing_cost", v)}
          />

          <InputBox
            label="Chi phí quản lý"
            value={form.admin_cost}
            onChange={(v) => updateForm("admin_cost", v)}
          />

          <InputBox
            label="Chi phí thẩm định"
            value={form.due_diligence_cost}
            onChange={(v) => updateForm("due_diligence_cost", v)}
          />

          <InputBox
            label="Tăng trưởng doanh thu"
            value={form.growth_rate}
            step="0.01"
            onChange={(v) => updateForm("growth_rate", v)}
          />

          <InputBox
            label="Tăng trưởng chi phí"
            value={form.cost_growth_rate}
            step="0.01"
            onChange={(v) => updateForm("cost_growth_rate", v)}
          />

          <InputBox
            label="Thuế TNDN"
            value={form.tax_rate}
            step="0.01"
            onChange={(v) => updateForm("tax_rate", v)}
          />

          <InputBox
            label="Tỷ suất chiết khấu"
            value={form.discount_rate}
            step="0.01"
            onChange={(v) => updateForm("discount_rate", v)}
          />
        </div>
      </Card>

      {!result ? (
        <Card className="p-12 text-center">
          <BarChart3 className="mx-auto h-14 w-14 text-green-400" />
          <h3 className="mt-5 text-2xl font-bold text-white">
            Chưa có kết quả phân tích
          </h3>
          <p className="mt-3 text-white/50">
            Nhập thông số tài chính và bấm “Phân tích”.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Wallet}
              label="Tổng doanh thu"
              value={formatMoney(result.summary.total_revenue)}
            />

            <MetricCard
              icon={TrendingUp}
              label="Lợi nhuận sau thuế"
              value={formatMoney(
                result.summary.total_profit_after_tax
              )}
            />

            <MetricCard
              icon={Calculator}
              label="NPV"
              value={formatMoney(result.summary.npv)}
            />

            <MetricCard
              icon={BadgePercent}
              label="IRR"
              value={`${result.summary.irr}%`}
            />
          </div>

          <Card className="p-6">
            <h3 className="mb-5 text-xl font-bold text-white">
              Đánh giá khả thi
            </h3>

            <div className="rounded-3xl bg-slate-900/70 p-6">
              <p className="text-white/50">Kết luận</p>
              <h2 className="mt-2 text-4xl font-black text-white">
                {translateFeasibility(result.summary.feasibility)}
              </h2>

              <p className="mt-4 leading-7 text-white/60">
                Dự án có NPV là{" "}
                <span className="text-green-300">
                  {formatMoney(result.summary.npv)}
                </span>
                , IRR đạt{" "}
                <span className="text-green-300">
                  {result.summary.irr}%
                </span>
                , so với tỷ suất chiết khấu{" "}
                <span className="text-green-300">
                  {result.summary.discount_rate}%
                </span>
                . Thời gian hoàn vốn dự kiến:{" "}
                <span className="text-green-300">
                  {result.summary.payback_year
                    ? `năm ${result.summary.payback_year}`
                    : "chưa hoàn vốn trong kỳ dự phóng"}
                </span>
                .
              </p>
            </div>
          </Card>

          <div className="grid gap-5 xl:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-5 text-xl font-bold text-white">
                Doanh thu và chi phí
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rows}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="year" tick={{ fill: "#94a3b8" }} />
                    <YAxis tick={{ fill: "#94a3b8" }} />
                    <Tooltip />
                    <Bar dataKey="total_revenue" name="Doanh thu" fill="#22c55e" />
                    <Bar dataKey="total_cost" name="Chi phí" fill="#f97316" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-5 text-xl font-bold text-white">
                Lợi nhuận sau thuế
              </h3>

              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={rows}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="year" tick={{ fill: "#94a3b8" }} />
                    <YAxis tick={{ fill: "#94a3b8" }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="profit_after_tax"
                      name="Lợi nhuận sau thuế"
                      stroke="#22c55e"
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-white/10 p-6">
              <h3 className="text-xl font-bold text-white">
                Bảng dự phóng tài chính
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead className="border-b border-white/10 text-left text-white/50">
                  <tr>
                    <th className="p-4">Năm</th>
                    <th>Dự án</th>
                    <th>Deal thành công</th>
                    <th>Doanh thu</th>
                    <th>Chi phí</th>
                    <th>LNTT</th>
                    <th>Thuế</th>
                    <th>LNST</th>
                    <th>Hòa vốn dự án</th>
                  </tr>
                </thead>

                <tbody>
                  {rows.map((row) => (
                    <tr key={row.year} className="border-b border-white/5">
                      <td className="p-4">Năm {row.year}</td>
                      <td>{row.projects}</td>
                      <td>{row.successful_deals}</td>
                      <td>{formatMoney(row.total_revenue)}</td>
                      <td>{formatMoney(row.total_cost)}</td>
                      <td>{formatMoney(row.profit_before_tax)}</td>
                      <td>{formatMoney(row.tax)}</td>
                      <td className="font-semibold text-green-300">
                        {formatMoney(row.profit_after_tax)}
                      </td>
                      <td>{row.break_even_projects}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function InputBox({ label, value, onChange, step = "1" }) {
  return (
    <label>
      <p className="mb-2 text-sm text-white/55">{label}</p>
      <input
        type="number"
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
      <h3 className="mt-2 text-2xl font-bold text-white">
        {value}
      </h3>
    </Card>
  );
}

function translateFeasibility(value) {
  const map = {
    high: "Khả thi cao",
    medium: "Khả thi trung bình",
    low: "Khả thi thấp",
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