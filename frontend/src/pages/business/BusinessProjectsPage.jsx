import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil } from "lucide-react";
import { Card, SectionTitle } from "./BusinessLayout";
import { useNavigate } from "react-router-dom";
import api from "../../lib/axios";

const API_URL = "http://localhost:5001";

export default function BusinessProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects/my");
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error(error);
      alert("Không thể tải danh sách dự án");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const name = p.title || p.name || "";
      const projectStatus = p.status || "pending";

      const matchKeyword = name.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus = status === "all" || projectStatus === status;

      return matchKeyword && matchStatus;
    });
  }, [projects, keyword, status]);

  const handleDelete = async (id) => {
    const ok = window.confirm("Bạn có chắc muốn xóa dự án này?");
    if (!ok) return;

    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p._id !== id && p.id !== id));
      alert("Xóa dự án thành công");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Xóa dự án thất bại");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/70">
        Đang tải dự án...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Dự án của tôi"
        title="Quản lý dự án xanh"
        right={
          <button
            onClick={() => navigate("/business/projects/create")}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-4 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <Plus className="h-4 w-4" />
            Tạo dự án
          </button>
        }
      />

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white/60">
            <Search className="h-4 w-4" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên dự án..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/40"
            />
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="draft">Bản nháp</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Bị từ chối</option>
            <option value="closed">Đóng dự án</option>
            <option value="funded">Đã gọi đủ vốn</option>
          </select>
        </div>
      </Card>

      {filteredProjects.length === 0 ? (
        <Card className="p-10 text-center text-white/60">
          Chưa có dự án nào. Hãy tạo dự án đầu tiên.
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const id = project._id || project.id;
            const title = project.title || project.name;
            const capital = Number(project.capital_needed || 0).toLocaleString(
              "vi-VN"
            );
            const statusName = project.status || "pending";

            return (
              <Card key={id} className="overflow-hidden">
                {project.thumbnail_url ? (
                  <img
                    src={`${API_URL}${project.thumbnail_url}`}
                    alt={title}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-slate-900/80 text-white/40">
                    Chưa có ảnh
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{title}</h3>
                      <p className="mt-2 text-sm text-white/55">
                        Vốn kêu gọi: {capital}{" "}
                        {project.capital_currency || "VND"}
                      </p>
                      <p className="mt-1 text-sm text-white/45">
                        Danh mục: {project.category_name || "Chưa có"}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300">
                      {statusName}
                    </span>
                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3 text-center">
  <div className="rounded-2xl bg-slate-900/70 p-3">
    <div className="text-xl font-bold">
      {project.views || project.view_count || 0}
    </div>

    <div className="text-xs text-white/50">
      Lượt xem
    </div>
  </div>

  <div className="rounded-2xl bg-slate-900/70 p-3">
    <div className="text-xl font-bold">
      {project.investor_count || 0}
    </div>

    <div className="text-xs text-white/50">
      Nhà đầu tư
    </div>
  </div>

  <div className="rounded-2xl bg-slate-900/70 p-3">
    <div className="text-xl font-bold">
      {project.esg_score || 0}
    </div>

    <div className="text-xs text-white/50">
      ESG
    </div>
  </div>
</div>

                  <div className="mt-5 flex flex-wrap gap-3">
  <button
    onClick={() => navigate(`/business/projects/${id}`)}
    className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80 hover:bg-white/5"
  >
    Chi tiết
  </button>

  <button
    onClick={() => navigate(`/business/projects/${id}/edit`)}
    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-medium text-slate-950 hover:bg-green-400"
  >
    <Pencil className="h-4 w-4" />
    Cập nhật
  </button>

  <button
    onClick={() => handleDelete(id)}
    className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 hover:bg-red-500/20"
  >
    <Trash2 className="h-4 w-4" />
    Xóa
  </button>
</div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}