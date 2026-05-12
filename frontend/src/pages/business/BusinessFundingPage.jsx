import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, SectionTitle } from "./BusinessLayout";
import api from "../../lib/axios";

const initialForm = {
  project_id: "",
  round_name: "",
  target_amount: "",
  raised_amount: "",
  equity_offered: "",
  status: "upcoming",
  start_date: "",
  end_date: "",
  description: "",
};

export default function BusinessFundingPage() {
  const [projects, setProjects] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [projectRes, roundRes] = await Promise.all([
        api.get("/projects/my"),
        api.get("/funding"),
      ]);

      setProjects(projectRes.data.projects || []);
      setRounds(roundRes.data.rounds || []);
    } catch (error) {
      console.error("FETCH FUNDING DATA ERROR:", error);
      alert(error.response?.data?.message || "Không tải được dữ liệu gọi vốn");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.project_id) {
    alert("Vui lòng chọn dự án");
    return;
  }

  if (!form.round_name.trim()) {
    alert("Vui lòng nhập tên vòng gọi vốn");
    return;
  }

  const payload = {
    project_id: form.project_id,
    round_name: form.round_name.trim(),
    target_amount: Number(form.target_amount || 0),
    raised_amount: Number(form.raised_amount || 0),
    equity_offered: Number(form.equity_offered || 0),
    status: form.status,
    start_date: form.start_date,
    end_date: form.end_date,
    description: form.description,
  };

  try {
    setLoading(true);

    if (editingId) {
      await api.put(`/funding/${editingId}`, payload);
      alert("Cập nhật vòng gọi vốn thành công");
    } else {
      await api.post("/funding", payload);
      alert("Tạo vòng gọi vốn thành công");
    }

    setForm(initialForm);
    setEditingId(null);
    await fetchData();
  } catch (error) {
    console.error("FUNDING SUBMIT ERROR:", error);
    alert(error.response?.data?.message || "Lỗi lưu vòng gọi vốn");
  } finally {
    setLoading(false);
  }
};

  const handleEdit = (round) => {
    setEditingId(round?._id || round?.id);

    setForm({
      project_id: round?.project_id?._id || round?.project_id || "",
      round_name: round?.round_name || "",
      target_amount: round?.target_amount || "",
      raised_amount: round?.raised_amount || "",
      equity_offered: round?.equity_offered || "",
      status: round?.status || "upcoming",
      start_date: round?.start_date || "",
      end_date: round?.end_date || "",
      description: round?.description || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa vòng gọi vốn này?")) return;

    try {
      await api.delete(`/funding/${id}`);
      alert("Xóa vòng gọi vốn thành công");
      await fetchData();
    } catch (error) {
      console.error("DELETE FUNDING ERROR:", error);
      alert(error.response?.data?.message || "Lỗi xóa vòng gọi vốn");
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Gọi vốn"
        title="Quản lý vòng gọi vốn"
        right={
          <div className="rounded-2xl bg-green-500/10 px-4 py-2 text-green-300">
            {rounds.length} vòng gọi vốn
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
            options={(projects || []).filter(Boolean).map((p) => [
              p._id || p.id,
              p.title || p.name || "Dự án không tên",
            ])}
          />

          <Input
            label="Tên vòng gọi vốn"
            name="round_name"
            value={form.round_name}
            onChange={handleChange}
            placeholder="VD: Vòng 1, Seed Round..."
          />

          <Input
            label="Mục tiêu vốn"
            name="target_amount"
            type="number"
            value={form.target_amount}
            onChange={handleChange}
            placeholder="VD: 1000000000"
          />

          <Input
            label="Đã huy động"
            name="raised_amount"
            type="number"
            value={form.raised_amount}
            onChange={handleChange}
            placeholder="VD: 300000000"
          />

          <Input
            label="Cổ phần đề xuất (%)"
            name="equity_offered"
            type="number"
            value={form.equity_offered}
            onChange={handleChange}
            placeholder="VD: 10"
          />

          <Select
            label="Trạng thái"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              ["upcoming", "Sắp mở"],
              ["open", "Đang mở"],
              ["closed", "Đã đóng"],
              ["cancelled", "Đã hủy"],
            ]}
          />

          <Input
            label="Ngày bắt đầu"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={handleChange}
          />

          <Input
            label="Ngày kết thúc"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={handleChange}
          />

          <div className="md:col-span-2">
            <label className="text-sm text-white/60">Mô tả</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả mục tiêu của vòng gọi vốn..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-green-400/50"
            />
          </div>

          <div className="flex justify-end gap-3 md:col-span-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(initialForm);
                }}
                className="rounded-2xl border border-white/10 px-5 py-3 text-white/80 hover:bg-white/5"
              >
                Hủy sửa
              </button>
            )}

            <button
              disabled={loading}
              className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              {loading
                ? "Đang lưu..."
                : editingId
                ? "Cập nhật vòng gọi vốn"
                : "Tạo vòng gọi vốn"}
            </button>
          </div>
        </form>
      </Card>

      <div className="grid gap-5 xl:grid-cols-3">
        {(rounds || []).filter(Boolean).map((round) => {
          const id = round?._id || round?.id;
          const targetAmount = Number(round?.target_amount || 0);
          const raisedAmount = Number(round?.raised_amount || 0);

          const percent =
            targetAmount > 0
              ? Math.min(100, Math.round((raisedAmount / targetAmount) * 100))
              : 0;

          return (
            <Card key={id} className="p-6">
              <p className="text-sm text-white/45">
                {round?.project_id?.title || "Không rõ dự án"}
              </p>

              <h3 className="mt-1 text-lg font-semibold">
                {round?.round_name || "Chưa có tên"}
              </h3>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Tiến độ</span>
                  <span>{percent}%</span>
                </div>

                <div className="mt-2 h-3 rounded-full bg-slate-900">
                  <div
                    className="h-3 rounded-full bg-green-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="mt-5 space-y-2 text-sm text-white/70">
                <p>Mục tiêu: {targetAmount.toLocaleString("vi-VN")} VND</p>
                <p>Đã huy động: {raisedAmount.toLocaleString("vi-VN")} VND</p>
                <p>Cổ phần: {round?.equity_offered || 0}%</p>
                <p>Trạng thái: {round?.status || "upcoming"}</p>
                {round?.start_date && <p>Bắt đầu: {round.start_date}</p>}
                {round?.end_date && <p>Kết thúc: {round.end_date}</p>}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => handleEdit(round)}
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
        <option value="">-- Chọn --</option>
        {(options || []).filter((item) => item?.[0]).map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}