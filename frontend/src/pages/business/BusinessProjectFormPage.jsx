import React, { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/axios";

const API_URL = "http://localhost:5001";

const initialForm = {
  project_code: "",
  title: "",
  slug: "",
  short_description: "",
  description: "",
  category_id: "1",
  location_id: "1",
  status_id: "2",
  capital_needed: "",
  capital_currency: "VND",
  roi_expected: "",
  risk_level: "medium",
  project_duration_months: "",
  carbon_reduction_est: "",
  jobs_created_est: "",
};

export default function BusinessProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    api.get(`/projects/${id}`).then((res) => {
      const project = res.data.project;

      setForm({
        ...initialForm,
        ...project,
        category_id: project.category_id || "1",
        location_id: project.location_id || "1",
        status_id: project.status_id || "2",
      });

      if (project.thumbnail_url) {
        setPreview(`${API_URL}${project.thumbnail_url}`);
      }
    });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      slug:
        name === "title"
          ? value
              .toLowerCase()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/đ/g, "d")
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "")
          : prev.slug,
    }));
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value ?? "");
      });

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      if (isEdit) {
        await api.put(`/projects/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/projects", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Lưu dự án thành công");
      navigate("/business/projects");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Lỗi lưu dự án");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl text-white">
      <h1 className="mb-6 text-2xl font-bold">
        {isEdit ? "Cập nhật dự án" : "Tạo dự án mới"}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-white/10 bg-white/5 p-6"
      >
        <div className="mb-6">
          <label className="text-sm text-white/60">Ảnh đại diện dự án</label>

          <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-slate-900/80 p-6 text-center transition hover:border-green-400/40">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-64 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="py-8">
                <ImagePlus className="mx-auto h-10 w-10 text-green-400" />
                <p className="mt-3 font-medium">Chọn hình ảnh từ máy tính</p>
                <p className="mt-1 text-sm text-white/45">
                  Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB.
                </p>
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="hidden"
            />
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Input
            label="Mã dự án"
            name="project_code"
            value={form.project_code}
            onChange={handleChange}
            placeholder="VD: PRJ-001"
          />

          <Input
            label="Tên dự án"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="VD: Điện mặt trời Bình Dương"
          />

          <Input
            label="Slug"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="Tự động tạo theo tên dự án"
          />

          <Input
            label="Mô tả ngắn"
            name="short_description"
            value={form.short_description}
            onChange={handleChange}
            placeholder="VD: Dự án năng lượng sạch giúp giảm phát thải CO2"
          />

          <Select
            label="Danh mục"
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            options={[
              ["1", "Năng lượng tái tạo"],
              ["2", "Nông nghiệp xanh"],
              ["3", "Xử lý rác thải"],
              ["4", "Công nghệ sạch"],
              ["5", "Giao thông xanh"],
              ["6", "Tiết kiệm năng lượng"],
            ]}
          />

          <Select
            label="Địa điểm"
            name="location_id"
            value={form.location_id}
            onChange={handleChange}
            options={[
              ["1", "Hà Nội"],
              ["2", "TP.HCM"],
              ["3", "Đà Nẵng"],
              ["4", "Cần Thơ"],
              ["5", "Hải Phòng"],
            ]}
          />

          <Select
            label="Trạng thái"
            name="status_id"
            value={form.status_id}
            onChange={handleChange}
            options={[
              ["1", "Bản nháp"],
              ["2", "Chờ duyệt"],
              ["3", "Đã duyệt"],
              ["4", "Bị từ chối"],
              ["5", "Đóng"],
              ["6", "Đã gọi vốn"],
            ]}
          />

          <Input
            label="Số vốn cần gọi"
            name="capital_needed"
            type="number"
            value={form.capital_needed}
            onChange={handleChange}
            placeholder="VD: 15000000000"
          />

          <Input
            label="Đơn vị tiền"
            name="capital_currency"
            value={form.capital_currency}
            onChange={handleChange}
            placeholder="VD: VND"
          />

          <Input
            label="ROI (%)"
            name="roi_expected"
            type="number"
            value={form.roi_expected}
            onChange={handleChange}
            placeholder="VD: 12"
          />

          <Select
            label="Mức rủi ro"
            name="risk_level"
            value={form.risk_level}
            onChange={handleChange}
            options={[
              ["low", "Thấp"],
              ["medium", "Trung bình"],
              ["high", "Cao"],
            ]}
          />

          <Input
            label="Thời gian thực hiện (tháng)"
            name="project_duration_months"
            type="number"
            value={form.project_duration_months}
            onChange={handleChange}
            placeholder="VD: 12"
          />

          <Input
            label="Giảm CO2 dự kiến"
            name="carbon_reduction_est"
            type="number"
            value={form.carbon_reduction_est}
            onChange={handleChange}
            placeholder="VD: 1200"
          />

          <Input
            label="Việc làm tạo ra"
            name="jobs_created_est"
            type="number"
            value={form.jobs_created_est}
            onChange={handleChange}
            placeholder="VD: 30"
          />
        </div>

        <div className="mt-5">
          <label className="text-sm text-white/60">Mô tả chi tiết</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={6}
            placeholder="Mô tả mục tiêu dự án, quy mô triển khai, kế hoạch sử dụng vốn, tác động môi trường..."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-green-400/50"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/business/projects")}
            className="rounded-2xl border border-white/10 px-5 py-3 text-white/80 hover:bg-white/5"
          >
            Hủy
          </button>

          <button
            disabled={loading}
            className="rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400 disabled:opacity-60"
          >
            {loading ? "Đang lưu..." : "Lưu dự án"}
          </button>
        </div>
      </form>
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
        {options.map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}