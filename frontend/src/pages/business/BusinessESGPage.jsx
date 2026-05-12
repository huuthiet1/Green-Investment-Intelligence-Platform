import React, { useEffect, useState } from "react";
import { Leaf, Plus, Trash2 } from "lucide-react";
import { Card, SectionTitle } from "./BusinessLayout";
import api from "../../lib/axios";

const initialForm = {
  project_id: "",
  environment_score: "",
  social_score: "",
  governance_score: "",
  evaluation_note: "",
};

export default function BusinessESGPage() {
  const [projects, setProjects] = useState([]);
  const [scores, setScores] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [projectRes, esgRes] = await Promise.all([
        api.get("/projects/my"),
        api.get("/esg"),
      ]);

      setProjects(projectRes.data.projects || []);
      setScores(esgRes.data.scores || []);
    } catch (error) {
      console.error("FETCH ESG ERROR:", error);
      alert("Không tải được dữ liệu ESG");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      ["environment_score", "social_score", "governance_score"].includes(name)
    ) {
      const number = Number(value);
      if (number < 0 || number > 100) return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.project_id) {
      alert("Vui lòng chọn dự án");
      return;
    }

    try {
      setLoading(true);

      await api.post("/esg", {
        project_id: form.project_id,
        environment_score: Number(form.environment_score || 0),
        social_score: Number(form.social_score || 0),
        governance_score: Number(form.governance_score || 0),
        evaluation_note: form.evaluation_note,
      });

      alert("Lưu điểm ESG thành công");
      setForm(initialForm);
      await fetchData();
    } catch (error) {
      console.error("SAVE ESG ERROR:", error);
      alert(error.response?.data?.message || "Lỗi lưu ESG");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (score) => {
    setForm({
      project_id: score.project_id?._id || score.project_id,
      environment_score: score.environment_score || "",
      social_score: score.social_score || "",
      governance_score: score.governance_score || "",
      evaluation_note: score.evaluation_note || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa điểm ESG này?")) return;

    try {
      await api.delete(`/esg/${id}`);
      alert("Xóa ESG thành công");
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xóa ESG");
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="ESG"
        title="Theo dõi điểm ESG dự án"
        right={
          <div className="rounded-2xl bg-green-500/10 px-4 py-2 text-green-300">
            {scores.length} đánh giá
          </div>
        }
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Select
            label="Dự án"
            name="project_id"
            value={form.project_id}
            onChange={handleChange}
            options={(projects || []).map((p) => [
              p._id || p.id,
              p.title || p.name || "Dự án không tên",
            ])}
          />

          <Input
            label="Điểm môi trường E"
            name="environment_score"
            type="number"
            min="0"
            max="100"
            value={form.environment_score}
            onChange={handleChange}
            placeholder="VD: 85"
          />

          <Input
            label="Điểm xã hội S"
            name="social_score"
            type="number"
            min="0"
            max="100"
            value={form.social_score}
            onChange={handleChange}
            placeholder="VD: 78"
          />

          <Input
            label="Điểm quản trị G"
            name="governance_score"
            type="number"
            min="0"
            max="100"
            value={form.governance_score}
            onChange={handleChange}
            placeholder="VD: 80"
          />

          <div className="md:col-span-2">
            <label className="text-sm text-white/60">Ghi chú đánh giá</label>
            <textarea
              name="evaluation_note"
              value={form.evaluation_note}
              onChange={handleChange}
              rows={4}
              placeholder="VD: Dự án có khả năng giảm phát thải tốt, cần bổ sung thêm tài liệu pháp lý..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-green-400/50"
            />
          </div>

          <div className="flex justify-end md:col-span-2">
            <button
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {loading ? "Đang lưu..." : "Lưu điểm ESG"}
            </button>
          </div>
        </form>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        {(scores || []).map((item) => {
          const id = item._id || item.id;
          const projectTitle =
            item.project_id?.title || item.project_title || "Không rõ dự án";

          return (
            <Card key={id} className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{projectTitle}</h3>
                  <p className="mt-2 text-sm text-white/50">
                    Xếp loại: {item.esg_level || "poor"}
                  </p>
                </div>

                <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
                  <Leaf className="h-5 w-5" />
                </div>
              </div>

              <div className="my-8 text-center">
                <div className="text-5xl font-bold text-green-400">
                  {item.total_score || 0}
                </div>
                <p className="mt-2 text-sm text-white/50">Tổng điểm ESG</p>
              </div>

              <ScoreBar label="E" value={item.environment_score || 0} />
              <ScoreBar label="S" value={item.social_score || 0} />
              <ScoreBar label="G" value={item.governance_score || 0} />

              {item.evaluation_note && (
                <p className="mt-4 rounded-2xl bg-slate-900/70 p-3 text-sm leading-6 text-white/65">
                  {item.evaluation_note}
                </p>
              )}

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => handleEdit(item)}
                  className="flex-1 rounded-2xl bg-green-500 px-4 py-3 text-sm font-medium text-slate-950 hover:bg-green-400"
                >
                  Sửa
                </button>

                <button
                  onClick={() => handleDelete(id)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBar({ label, value }) {
  const safeValue = Math.min(100, Math.max(0, Number(value || 0)));

  return (
    <div className="mt-4">
      <div className="mb-2 flex justify-between text-sm">
        <span>{label}</span>
        <span>{safeValue}/100</span>
      </div>

      <div className="h-2 rounded-full bg-slate-900">
        <div
          className="h-2 rounded-full bg-green-500"
          style={{ width: `${safeValue}%` }}
        />
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
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-green-400/50"
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
        className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-green-400/50"
      >
        <option value="">-- Chọn dự án --</option>
        {(options || []).map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}