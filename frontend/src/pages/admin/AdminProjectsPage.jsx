import React, { useEffect, useMemo, useState } from "react";
import {
  Check,
  Eye,
  Search,
  Trash2,
  X,
  Lock,
  RefreshCcw,
} from "lucide-react";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

const statusOptions = [
  ["all", "Tất cả"],
  ["draft", "Bản nháp"],
  ["pending", "Chờ duyệt"],
  ["approved", "Đã duyệt"],
  ["rejected", "Bị từ chối"],
  ["closed", "Đã đóng"],
  ["funded", "Đã gọi đủ vốn"],
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/projects");
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error("FETCH ADMIN PROJECTS ERROR:", error);
      alert(error.response?.data?.message || "Không tải được danh sách dự án");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const title = p.title || p.name || "";
      const projectStatus = p.status || "pending";

      const matchKeyword = title.toLowerCase().includes(keyword.toLowerCase());
      const matchStatus = status === "all" || projectStatus === status;

      return matchKeyword && matchStatus;
    });
  }, [projects, keyword, status]);

  const updateStatus = async (id, nextStatus) => {
    try {
      await api.put(`/admin/projects/${id}/status`, {
        status: nextStatus,
      });

      await fetchProjects();
      alert("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error("UPDATE PROJECT STATUS ERROR:", error);
      alert(error.response?.data?.message || "Lỗi cập nhật trạng thái");
    }
  };
const updateESG = async (id, score) => {
  try {
    await api.put(
      `/admin/projects/${id}/esg-score`,
      {
        esg_score: Number(score),
      }
    );

    await fetchProjects();

    alert("Cập nhật ESG thành công");
  } catch (error) {
    console.error("UPDATE ESG ERROR:", error);

    alert(
      error.response?.data?.message ||
        "Lỗi cập nhật ESG"
    );
  }
};
  const deleteProject = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa dự án này?")) return;

    try {
      await api.delete(`/admin/projects/${id}`);
      await fetchProjects();
      alert("Xóa dự án thành công");
    } catch (error) {
      console.error("DELETE PROJECT ERROR:", error);
      alert(error.response?.data?.message || "Lỗi xóa dự án");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải danh sách dự án...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="Quản lý dự án"
        right={
          <button
            onClick={fetchProjects}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard
          label="Tổng dự án"
          value={projects.length}
        />
        <StatCard
          label="Chờ duyệt"
          value={projects.filter((p) => (p.status || "pending") === "pending").length}
        />
        <StatCard
          label="Đã duyệt"
          value={projects.filter((p) => p.status === "approved").length}
        />
        <StatCard
          label="Bị từ chối"
          value={projects.filter((p) => p.status === "rejected").length}
        />
      </div>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white/60">
            <Search className="h-4 w-4" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên dự án..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          >
            {statusOptions.map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px]">
            <thead className="bg-white/5 text-left text-sm text-white/50">
              <tr>
                <th className="p-5">Dự án</th>
                <th>Danh mục</th>
                <th>Vốn cần gọi</th>
                <th>ROI</th>
                <th>ESG</th>
                <th>Trạng thái</th>
                <th className="text-right pr-5">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-white/45">
                    Không có dự án phù hợp
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => {
                  const id = project._id || project.id;

                  return (
                    <tr
                      key={id}
                      className="border-t border-white/10 text-sm"
                    >
                      <td className="p-5">
                        <div className="font-semibold text-white">
                          {project.title || project.name || "Dự án không tên"}
                        </div>
                        <div className="mt-1 text-white/40">
                          {project.project_code || project.slug || "Không có mã"}
                        </div>
                      </td>

                      <td className="text-white/70">
                        {project.category_name || "Chưa có"}
                      </td>

                      <td className="text-white/70">
                        {Number(project.capital_needed || 0).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        {project.capital_currency || "VND"}
                      </td>

                      <td className="text-white/70">
                        {project.roi_expected || 0}%
                      </td>

                      <td className="text-white/70">
                        {project.esg_score || 0}
                      </td>

                      <td>
                        <StatusBadge status={project.status || "pending"} />
                      </td>

                      <td className="pr-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedProject(project)}
                            className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/5"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => updateStatus(id, "approved")}
                            className="rounded-xl bg-green-500 px-3 py-2 text-slate-950 hover:bg-green-400"
                            title="Duyệt"
                          >
                            <Check className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => updateStatus(id, "rejected")}
                            className="rounded-xl bg-yellow-500 px-3 py-2 text-slate-950 hover:bg-yellow-400"
                            title="Từ chối"
                          >
                            <X className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => updateStatus(id, "closed")}
                            className="rounded-xl border border-white/10 px-3 py-2 text-white/70 hover:bg-white/5"
                            title="Đóng dự án"
                          >
                            <Lock className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => deleteProject(id)}
                            className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-red-300 hover:bg-red-500/20"
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedProject && (
        <ProjectDetailModal
  project={selectedProject}
  onClose={() => setSelectedProject(null)}
  onSaveESG={(score) =>
    updateESG(
      selectedProject._id ||
        selectedProject.id,
      score
    )
  }
  onApprove={() => {
            updateStatus(selectedProject._id || selectedProject.id, "approved");
            setSelectedProject(null);
          }}
          onReject={() => {
            updateStatus(selectedProject._id || selectedProject.id, "rejected");
            setSelectedProject(null);
          }}
        />
      )}
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

function StatusBadge({ status }) {
  const map = {
    draft: "Bản nháp",
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Bị từ chối",
    closed: "Đã đóng",
    funded: "Đã gọi đủ vốn",
  };

  const color =
    status === "approved"
      ? "bg-green-500/10 text-green-300"
      : status === "rejected"
      ? "bg-red-500/10 text-red-300"
      : status === "pending"
      ? "bg-yellow-500/10 text-yellow-300"
      : "bg-white/10 text-white/70";

  return (
    <span className={`rounded-full px-3 py-1 text-sm ${color}`}>
      {map[status] || status}
    </span>
  );
}

function ProjectDetailModal({
  project,
  onClose,
  onApprove,
  onReject,
  onSaveESG,
}) {
  const [esgScore, setEsgScore] =
    useState(project.esg_score || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101827] p-6 text-white">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">
              Chi tiết dự án
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {project.title ||
                project.name ||
                "Dự án không tên"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-white/70 hover:bg-white/5"
          >
            Đóng
          </button>
        </div>

        {project.thumbnail_url && (
          <img
            src={`http://localhost:5001${project.thumbnail_url}`}
            alt={project.title}
            className="mb-6 h-72 w-full rounded-2xl object-cover"
          />
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Info
            label="Mã dự án"
            value={
              project.project_code ||
              "Không có"
            }
          />

          <Info
            label="Danh mục"
            value={
              project.category_name ||
              "Chưa có"
            }
          />

          <Info
            label="Vốn cần gọi"
            value={`${Number(
              project.capital_needed || 0
            ).toLocaleString(
              "vi-VN"
            )} ${
              project.capital_currency ||
              "VND"
            }`}
          />

          <Info
            label="ROI kỳ vọng"
            value={`${
              project.roi_expected || 0
            }%`}
          />

          <Info
            label="Rủi ro"
            value={
              project.risk_level ||
              "medium"
            }
          />

          <div className="rounded-2xl bg-slate-900/70 p-4">
            <p className="text-sm text-white/45">
              Điểm ESG
            </p>

            <input
              type="number"
              min="0"
              max="100"
              value={esgScore}
              onChange={(e) =>
                setEsgScore(
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-white outline-none"
            />
          </div>

          <Info
            label="Trạng thái"
            value={
              project.status ||
              "pending"
            }
          />

          <Info
            label="Thời gian"
            value={`${
              project.project_duration_months ||
              0
            } tháng`}
          />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-900/70 p-5">
          <p className="mb-2 text-sm text-white/45">
            Mô tả
          </p>

          <p className="whitespace-pre-wrap leading-7 text-white/75">
            {project.description ||
              project.short_description ||
              "Chưa có mô tả"}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={() =>
              onSaveESG(esgScore)
            }
            className="rounded-2xl bg-blue-500 px-5 py-3 font-medium text-white hover:bg-blue-400"
          >
            Lưu ESG
          </button>

          <button
            onClick={onReject}
            className="rounded-2xl bg-yellow-500 px-5 py-3 font-medium text-slate-950 hover:bg-yellow-400"
          >
            Từ chối
          </button>

          <button
            onClick={onApprove}
            className="rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            Duyệt dự án
          </button>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-4">
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}