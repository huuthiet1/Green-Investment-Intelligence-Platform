import React, { useEffect, useState } from "react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Card, SectionTitle } from "./BusinessLayout";
import api from "../../lib/axios";

const initialForm = {
  title: "",
  target_name: "",
  project_id: "",
  report_type: "document",
  reason: "",
  description: "",
  status: "pending",
};

export default function BusinessReportsPage() {
  const [reports, setReports] = useState([]);
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [reportRes, projectRes] = await Promise.all([
        api.get("/reports"),
        api.get("/projects/my"),
      ]);

      setReports(reportRes.data.reports || []);
      setProjects(projectRes.data.projects || []);
    } catch (error) {
      console.error("FETCH REPORT ERROR:", error);
      alert("Không tải được dữ liệu báo cáo");
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

    if (!form.title.trim()) {
      alert("Vui lòng nhập tiêu đề báo cáo");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        title: form.title.trim(),
        project_id: form.project_id || undefined,
      };

      if (editingId) {
        await api.put(`/reports/${editingId}`, payload);
        alert("Cập nhật báo cáo thành công");
      } else {
        await api.post("/reports", payload);
        alert("Tạo báo cáo thành công");
      }

      setForm(initialForm);
      setEditingId(null);
      await fetchData();
    } catch (error) {
      console.error("SAVE REPORT ERROR:", error);
      alert(error.response?.data?.message || "Lỗi lưu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setEditingId(report._id);

    setForm({
      title: report.title || "",
      target_name: report.target_name || "",
      project_id: report.project_id?._id || report.project_id || "",
      report_type: report.report_type || "document",
      reason: report.reason || "",
      description: report.description || "",
      status: report.status || "pending",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa báo cáo này?")) return;

    try {
      await api.delete(`/reports/${id}`);
      alert("Xóa báo cáo thành công");
      await fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xóa báo cáo");
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Báo cáo"
        title="Theo dõi báo cáo và nhắc việc"
        right={
          <div className="rounded-2xl bg-green-500/10 px-4 py-2 text-green-300">
            {reports.length} mục
          </div>
        }
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Tiêu đề"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="VD: Thiếu tài liệu pháp lý"
          />

          <Input
            label="Đối tượng"
            name="target_name"
            value={form.target_name}
            onChange={handleChange}
            placeholder="VD: Trang trại hữu cơ Đà Lạt"
          />

          <Select
            label="Dự án liên quan"
            name="project_id"
            value={form.project_id}
            onChange={handleChange}
            options={(projects || []).map((p) => [
              p._id || p.id,
              p.title || p.name || "Dự án không tên",
            ])}
          />

          <Select
            label="Loại báo cáo"
            name="report_type"
            value={form.report_type}
            onChange={handleChange}
            options={[
              ["document", "Tài liệu"],
              ["project", "Dự án"],
              ["funding", "Gọi vốn"],
              ["esg", "ESG"],
              ["user", "Người dùng"],
              ["other", "Khác"],
            ]}
          />

          <Input
            label="Lý do"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            placeholder="VD: Hồ sơ chưa đầy đủ"
          />

          <Select
            label="Trạng thái"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={[
              ["pending", "Chờ xử lý"],
              ["reviewing", "Đang xem xét"],
              ["resolved", "Đã xử lý"],
              ["rejected", "Từ chối"],
            ]}
          />

          <div className="md:col-span-2">
            <label className="text-sm text-white/60">Mô tả chi tiết</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Ghi chú thêm về báo cáo hoặc việc cần nhắc..."
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
              {loading ? "Đang lưu..." : editingId ? "Cập nhật" : "Tạo báo cáo"}
            </button>
          </div>
        </form>
      </Card>

      <div className="space-y-4">
        {(reports || []).map((item) => {
          const id = item._id || item.id;
          const target =
            item.project_id?.title || item.target_name || "Không rõ đối tượng";

          return (
            <Card key={id} className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">
                      {item.title || "Báo cáo"}
                    </h3>

                    <p className="mt-2 text-sm text-white/50">
                      Đối tượng: {target}
                    </p>

                    <p className="mt-1 text-sm text-white/40">
                      Loại: {item.report_type || "other"} • Tạo lúc:{" "}
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString("vi-VN")
                        : "Không rõ"}
                    </p>

                    {item.reason && (
                      <p className="mt-3 text-sm text-white/60">
                        Lý do: {item.reason}
                      </p>
                    )}

                    {item.description && (
                      <p className="mt-2 rounded-2xl bg-slate-900/70 p-3 text-sm leading-6 text-white/65">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">
                    {item.status || "pending"}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="rounded-xl bg-green-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-green-400"
                    >
                      Sửa
                    </button>

                    <button
                      onClick={() => handleDelete(id)}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
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
        {(options || []).map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}