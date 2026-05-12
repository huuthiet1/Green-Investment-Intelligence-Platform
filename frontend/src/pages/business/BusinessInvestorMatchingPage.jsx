import React, { useEffect, useState } from "react";
import { Brain, Plus, Sparkles } from "lucide-react";
import { Card, SectionTitle } from "./BusinessLayout";
import api from "../../lib/axios";

const initialForm = {
  name: "",
  email: "",
  organization: "",
  preferred_categories: "",
  min_budget: "",
  max_budget: "",
  preferred_risk: "any",
  min_esg_score: "",
  expected_roi: "",
  note: "",
};

export default function BusinessInvestorMatchingPage() {
  const [investors, setInvestors] = useState([]);
  const [selectedInvestor, setSelectedInvestor] = useState("");
  const [matches, setMatches] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const fetchInvestors = async () => {
    const res = await api.get("/matching/investors");
    setInvestors(res.data.investors || []);
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCreateInvestor = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Vui lòng nhập tên nhà đầu tư");
      return;
    }

    await api.post("/matching/investors", {
      ...form,
      preferred_categories: form.preferred_categories
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      min_budget: Number(form.min_budget || 0),
      max_budget: Number(form.max_budget || 0),
      min_esg_score: Number(form.min_esg_score || 0),
      expected_roi: Number(form.expected_roi || 0),
    });

    setForm(initialForm);
    fetchInvestors();
  };

  const handleMatch = async () => {
    if (!selectedInvestor) {
      alert("Vui lòng chọn nhà đầu tư");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/matching/match", {
        investor_id: selectedInvestor,
      });

      setMatches(res.data.matches || []);
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi AI matching");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="AI Matching"
        title="Gợi ý nhà đầu tư phù hợp"
        right={
          <div className="rounded-2xl bg-green-500/10 px-4 py-2 text-green-300">
            Investor Matching AI
          </div>
        }
      />

      <Card className="p-6">
        <form onSubmit={handleCreateInvestor} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Tên nhà đầu tư"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="VD: Green Capital"
          />

          <Input
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="VD: investor@gmail.com"
          />

          <Input
            label="Tổ chức"
            name="organization"
            value={form.organization}
            onChange={handleChange}
            placeholder="VD: Green Capital Fund"
          />

          <Input
            label="Danh mục quan tâm"
            name="preferred_categories"
            value={form.preferred_categories}
            onChange={handleChange}
            placeholder="VD: Năng lượng tái tạo, Công nghệ sạch"
          />

          <Input
            label="Ngân sách tối thiểu"
            name="min_budget"
            type="number"
            value={form.min_budget}
            onChange={handleChange}
            placeholder="VD: 1000000000"
          />

          <Input
            label="Ngân sách tối đa"
            name="max_budget"
            type="number"
            value={form.max_budget}
            onChange={handleChange}
            placeholder="VD: 10000000000"
          />

          <Select
            label="Mức rủi ro ưu tiên"
            name="preferred_risk"
            value={form.preferred_risk}
            onChange={handleChange}
            options={[
              ["any", "Bất kỳ"],
              ["low", "Thấp"],
              ["medium", "Trung bình"],
              ["high", "Cao"],
            ]}
          />

          <Input
            label="ESG tối thiểu"
            name="min_esg_score"
            type="number"
            value={form.min_esg_score}
            onChange={handleChange}
            placeholder="VD: 70"
          />

          <Input
            label="ROI kỳ vọng tối thiểu (%)"
            name="expected_roi"
            type="number"
            value={form.expected_roi}
            onChange={handleChange}
            placeholder="VD: 12"
          />

          <div className="md:col-span-2">
            <label className="text-sm text-white/60">Ghi chú</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              placeholder="VD: Ưu tiên dự án có tác động môi trường rõ ràng..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
            />
          </div>

          <div className="flex justify-end md:col-span-2">
            <button className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950">
              <Plus className="h-4 w-4" />
              Thêm nhà đầu tư mẫu
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <select
            value={selectedInvestor}
            onChange={(e) => setSelectedInvestor(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
          >
            <option value="">-- Chọn nhà đầu tư --</option>
            {investors.map((i) => (
              <option key={i._id} value={i._id}>
                {i.name} - {i.organization}
              </option>
            ))}
          </select>

          <button
            onClick={handleMatch}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 disabled:opacity-60"
          >
            <Brain className="h-4 w-4" />
            {loading ? "Đang phân tích..." : "AI Matching"}
          </button>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        {matches.map((item) => {
          const p = item.project;

          return (
            <Card key={p._id} className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <Sparkles className="h-5 w-5 text-green-400" />
                <span className="rounded-full bg-green-500/10 px-3 py-1 text-green-300">
                  Match {item.score}%
                </span>
              </div>

              <h3 className="text-lg font-semibold">{p.title}</h3>

              <p className="mt-2 text-sm text-white/50">
                {p.category_name || "Chưa có danh mục"}
              </p>

              <div className="mt-4 space-y-2 text-sm text-white/70">
                <p>
                  Vốn cần:{" "}
                  {Number(p.capital_needed || 0).toLocaleString("vi-VN")} VND
                </p>
                <p>ROI: {p.roi_expected || 0}%</p>
                <p>ESG: {p.esg_score || 0}</p>
                <p>Rủi ro: {p.risk_level || "medium"}</p>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-900 p-4">
                <p className="mb-2 text-sm font-semibold text-green-300">
                  Lý do phù hợp:
                </p>

                {item.reasons.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-white/60">
                    {item.reasons.map((r, index) => (
                      <li key={index}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white/50">
                    Chưa đủ tiêu chí phù hợp.
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm text-white/60">{label}</label>
      <input
        {...props}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35"
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="text-sm text-white/60">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
      >
        {options.map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}