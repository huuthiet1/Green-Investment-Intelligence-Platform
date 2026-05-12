import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Eye,
  RefreshCcw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

const levelOptions = [
  ["all", "Tất cả"],
  ["high", "Rủi ro cao"],
  ["medium", "Rủi ro trung bình"],
  ["low", "Rủi ro thấp"],
];

export default function AdminFraudDetectionPage() {
  const [items, setItems] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFraud = async () => {
    try {
      setLoading(true);
      const res = await api.get("/fraud/projects");
      setItems(res.data.results || []);
    } catch (error) {
      console.error("FETCH FRAUD ERROR:", error);
      alert(error.response?.data?.message || "Không tải được AI Fraud Detection");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraud();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const p = item.project || {};
      const text = `${p.title || ""} ${p.description || ""} ${p.category_name || ""}`.toLowerCase();

      const matchKeyword = text.includes(keyword.toLowerCase());
      const matchLevel = level === "all" || item.fraud_level === level;

      return matchKeyword && matchLevel;
    });
  }, [items, keyword, level]);

  const analyzeProject = async (projectId) => {
    try {
      await api.post(`/fraud/projects/${projectId}/analyze`);
      await fetchFraud();
      alert("AI đã phân tích dự án");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi phân tích fraud");
    }
  };

  const suspendProject = async (projectId) => {
    if (!window.confirm("Tạm khóa dự án này?")) return;

    try {
      await api.post(`/fraud/projects/${projectId}/suspend`);
      await fetchFraud();
      alert("Đã tạm khóa dự án");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi tạm khóa dự án");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải AI Fraud Detection...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin AI"
        title="AI Fraud Detection"
        right={
          <button
            onClick={fetchFraud}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Tổng dự án" value={items.length} />
        <StatCard
          label="Rủi ro cao"
          value={items.filter((i) => i.fraud_level === "high").length}
        />
        <StatCard
          label="Trung bình"
          value={items.filter((i) => i.fraud_level === "medium").length}
        />
        <StatCard
          label="An toàn"
          value={items.filter((i) => i.fraud_level === "low").length}
        />
      </div>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white/60">
            <Search className="h-4 w-4" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm dự án nghi vấn..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
          </label>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white"
          >
            {levelOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        {filteredItems.length === 0 ? (
          <Card className="p-10 text-center text-white/45 xl:col-span-2">
            Không có dữ liệu fraud phù hợp
          </Card>
        ) : (
          filteredItems.map((item) => {
            const p = item.project;

            return (
              <Card key={p._id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-green-400" />
                      <h3 className="text-xl font-bold text-white">
                        {p.title || "Dự án không tên"}
                      </h3>
                    </div>

                    <p className="mt-2 text-sm text-white/45">
                      {p.category_name || "Chưa có danh mục"}
                    </p>
                  </div>

                  <FraudBadge level={item.fraud_level} score={item.fraud_score} />
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <MiniInfo label="ROI" value={`${p.roi_expected || 0}%`} />
                  <MiniInfo label="ESG" value={p.esg_score || 0} />
                  <MiniInfo
                    label="Vốn"
                    value={`${Number(p.capital_needed || 0).toLocaleString("vi-VN")}đ`}
                  />
                  <MiniInfo label="Tài liệu" value={item.documents_count || 0} />
                </div>

                <div className="mt-5 rounded-2xl bg-slate-900/70 p-4">
                  <p className="mb-2 font-semibold text-white">
                    Dấu hiệu AI phát hiện:
                  </p>

                  {item.flags?.length ? (
                    <ul className="list-disc space-y-1 pl-5 text-sm text-white/65">
                      {item.flags.map((flag, index) => (
                        <li key={index}>{flag}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-white/45">
                      Chưa phát hiện dấu hiệu bất thường.
                    </p>
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/65">
                  <span className="font-semibold text-green-300">Khuyến nghị: </span>
                  {item.recommendation}
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-white/70 hover:bg-white/5"
                  >
                    <Eye className="h-4 w-4" />
                    Chi tiết
                  </button>

                  <button
                    onClick={() => analyzeProject(p._id)}
                    className="flex items-center gap-2 rounded-2xl bg-blue-500 px-4 py-3 text-white hover:bg-blue-400"
                  >
                    <Brain className="h-4 w-4" />
                    Chạy AI
                  </button>

                  <button
                    onClick={() => suspendProject(p._id)}
                    className="flex items-center gap-2 rounded-2xl bg-red-500/20 px-4 py-3 text-red-300 hover:bg-red-500/30"
                  >
                    <XCircle className="h-4 w-4" />
                    Tạm khóa
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {selectedItem && (
        <FraudDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAnalyze={() => analyzeProject(selectedItem.project._id)}
          onSuspend={() => suspendProject(selectedItem.project._id)}
        />
      )}
    </div>
  );
}

function FraudDetailModal({ item, onClose, onAnalyze, onSuspend }) {
  const p = item.project;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101827] p-6 text-white">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">AI Fraud Detail</p>
            <h2 className="mt-1 text-2xl font-bold">{p.title}</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-white/70 hover:bg-white/5"
          >
            Đóng
          </button>
        </div>

        <div className="mb-5">
          <FraudBadge level={item.fraud_level} score={item.fraud_score} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Info label="ROI kỳ vọng" value={`${p.roi_expected || 0}%`} />
          <Info label="ESG Score" value={p.esg_score || 0} />
          <Info
            label="Vốn cần gọi"
            value={`${Number(p.capital_needed || 0).toLocaleString("vi-VN")} VND`}
          />
          <Info label="Số tài liệu" value={item.documents_count || 0} />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-900/70 p-5">
          <p className="mb-2 text-sm text-white/45">Mô tả dự án</p>
          <p className="whitespace-pre-wrap leading-7 text-white/75">
            {p.description || "Chưa có mô tả"}
          </p>
        </div>

        <div className="mt-5 rounded-2xl bg-red-500/5 p-5">
          <p className="mb-3 font-semibold text-red-300">
            Dấu hiệu nghi vấn
          </p>

          {item.flags?.length ? (
            <ul className="list-disc space-y-2 pl-5 text-white/70">
              {item.flags.map((flag, index) => (
                <li key={index}>{flag}</li>
              ))}
            </ul>
          ) : (
            <p className="text-white/50">Không có dấu hiệu rõ ràng.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onAnalyze}
            className="rounded-2xl bg-blue-500 px-5 py-3 font-medium text-white"
          >
            Chạy lại AI
          </button>

          <button
            onClick={onSuspend}
            className="rounded-2xl bg-red-500/20 px-5 py-3 font-medium text-red-300"
          >
            Tạm khóa dự án
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-white/50">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
    </Card>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-5">
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-1 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function FraudBadge({ level, score }) {
  const config = {
    high: "bg-red-500/10 text-red-300",
    medium: "bg-yellow-500/10 text-yellow-300",
    low: "bg-green-500/10 text-green-300",
  };

  const label = {
    high: "Rủi ro cao",
    medium: "Trung bình",
    low: "Thấp",
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${config[level]}`}>
      <AlertTriangle className="h-4 w-4" />
      {label[level] || level} • {score}%
    </span>
  );
}