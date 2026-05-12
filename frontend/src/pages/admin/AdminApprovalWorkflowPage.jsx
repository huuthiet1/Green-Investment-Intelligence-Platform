import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  PauseCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

const workflowStatus = [
  ["all", "Tất cả"],
  ["pending", "Chờ duyệt"],
  ["reviewing", "Đang xem xét"],
  ["approved", "Đã duyệt"],
  ["rejected", "Từ chối"],
  ["suspended", "Tạm khóa"],
];

export default function AdminApprovalWorkflowPage() {
  const [projects, setProjects] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/projects");
      setProjects(res.data.projects || []);
    } catch (error) {
      alert(error.response?.data?.message || "Không tải được dự án");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const text = `${p.title || ""} ${p.slug || ""} ${
        p.category_name || ""
      }`.toLowerCase();

      const reviewStatus = p.review_status || p.status || "pending";

      const matchKeyword = text.includes(keyword.toLowerCase());
      const matchStatus = status === "all" || reviewStatus === status;

      return matchKeyword && matchStatus;
    });
  }, [projects, keyword, status]);

  const submitReview = async (project, review_status, note = reviewNote) => {
    try {
      await api.put(`/admin/projects/${project._id}/review`, {
        review_status,
        review_note: note,
        reviewed_by: "admin-demo",
      });

      alert("Cập nhật trạng thái duyệt thành công");
      setSelectedProject(null);
      setReviewNote("");
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi duyệt dự án");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải workflow duyệt dự án...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="Approval Workflow"
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

      <div className="grid gap-5 md:grid-cols-5">
        <StatCard
          label="Chờ duyệt"
          value={
            projects.filter(
              (p) => (p.review_status || p.status || "pending") === "pending"
            ).length
          }
        />
        <StatCard
          label="Đang xem xét"
          value={
            projects.filter(
              (p) => (p.review_status || p.status) === "reviewing"
            ).length
          }
        />
        <StatCard
          label="Đã duyệt"
          value={
            projects.filter(
              (p) => (p.review_status || p.status) === "approved"
            ).length
          }
        />
        <StatCard
          label="Từ chối"
          value={
            projects.filter(
              (p) => (p.review_status || p.status) === "rejected"
            ).length
          }
        />
        <StatCard
          label="Tạm khóa"
          value={
            projects.filter(
              (p) => (p.review_status || p.status) === "suspended"
            ).length
          }
        />
      </div>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white/60">
            <Search className="h-4 w-4" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm dự án cần duyệt..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white"
          >
            {workflowStatus.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px]">
            <thead className="bg-white/5 text-left text-sm text-white/50">
              <tr>
                <th className="p-5">Dự án</th>
                <th>Danh mục</th>
                <th>Vốn</th>
                <th>ESG</th>
                <th>Workflow</th>
                <th>Ghi chú duyệt</th>
                <th className="pr-5 text-right">Thao tác</th>
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
                  const reviewStatus =
                    project.review_status || project.status || "pending";

                  return (
                    <tr
                      key={project._id}
                      className="border-t border-white/10 text-sm"
                    >
                      <td className="p-5">
                        <div className="font-semibold text-white">
                          {project.title || "Dự án không tên"}
                        </div>
                        <div className="mt-1 text-white/40">
                          {project.slug || project.project_code || "Không có mã"}
                        </div>
                      </td>

                      <td className="text-white/70">
                        {project.category_name || "Chưa có"}
                      </td>

                      <td className="text-white/70">
                        {Number(project.capital_needed || 0).toLocaleString(
                          "vi-VN"
                        )}{" "}
                        VND
                      </td>

                      <td className="text-white/70">
                        {project.esg_score || 0}
                      </td>

                      <td>
                        <WorkflowBadge status={reviewStatus} />
                      </td>

                      <td className="max-w-[240px] truncate text-white/60">
                        {project.review_note || "—"}
                      </td>

                      <td className="pr-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setReviewNote(project.review_note || "");
                            }}
                            className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/5"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              submitReview(
                                project,
                                "reviewing",
                                "Admin đang xem xét dự án."
                              )
                            }
                            className="rounded-xl bg-blue-500 px-3 py-2 text-white"
                          >
                            <Clock className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              submitReview(project, "approved", "Dự án đạt yêu cầu.")
                            }
                            className="rounded-xl bg-green-500 px-3 py-2 text-slate-950"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              submitReview(
                                project,
                                "rejected",
                                "Dự án chưa đạt yêu cầu duyệt."
                              )
                            }
                            className="rounded-xl bg-red-500/20 px-3 py-2 text-red-300"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              submitReview(
                                project,
                                "suspended",
                                "Dự án bị tạm khóa để kiểm tra."
                              )
                            }
                            className="rounded-xl bg-yellow-500/20 px-3 py-2 text-yellow-300"
                          >
                            <PauseCircle className="h-4 w-4" />
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
        <ReviewModal
          project={selectedProject}
          note={reviewNote}
          setNote={setReviewNote}
          onClose={() => {
            setSelectedProject(null);
            setReviewNote("");
          }}
          onSubmit={(review_status) =>
            submitReview(selectedProject, review_status, reviewNote)
          }
        />
      )}
    </div>
  );
}

function ReviewModal({ project, note, setNote, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101827] p-6 text-white">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">Duyệt dự án</p>
            <h2 className="mt-1 text-2xl font-bold">
              {project.title || "Dự án không tên"}
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
          <Info label="Danh mục" value={project.category_name || "Chưa có"} />
          <Info
            label="Vốn cần gọi"
            value={`${Number(project.capital_needed || 0).toLocaleString(
              "vi-VN"
            )} VND`}
          />
          <Info label="ROI" value={`${project.roi_expected || 0}%`} />
          <Info label="ESG" value={project.esg_score || 0} />
          <Info label="Rủi ro" value={project.risk_level || "medium"} />
          <Info
            label="Workflow"
            value={project.review_status || project.status || "pending"}
          />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-900/70 p-5">
          <p className="mb-2 text-sm text-white/45">Mô tả</p>
          <p className="whitespace-pre-wrap leading-7 text-white/75">
            {project.description || project.short_description || "Chưa có mô tả"}
          </p>
        </div>

        <div className="mt-5">
          <label className="text-sm text-white/60">Ghi chú duyệt</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Nhập lý do duyệt / từ chối / tạm khóa..."
            className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35"
          />
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={() => onSubmit("reviewing")}
            className="rounded-2xl bg-blue-500 px-5 py-3 font-medium text-white"
          >
            Đang xem xét
          </button>

          <button
            onClick={() => onSubmit("rejected")}
            className="rounded-2xl bg-red-500/20 px-5 py-3 font-medium text-red-300"
          >
            Từ chối
          </button>

          <button
            onClick={() => onSubmit("suspended")}
            className="rounded-2xl bg-yellow-500/20 px-5 py-3 font-medium text-yellow-300"
          >
            Tạm khóa
          </button>

          <button
            onClick={() => onSubmit("approved")}
            className="rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950"
          >
            Duyệt dự án
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

function WorkflowBadge({ status }) {
  const config = {
    pending: "bg-yellow-500/10 text-yellow-300",
    reviewing: "bg-blue-500/10 text-blue-300",
    approved: "bg-green-500/10 text-green-300",
    rejected: "bg-red-500/10 text-red-300",
    suspended: "bg-orange-500/10 text-orange-300",
  };

  const label = {
    pending: "Chờ duyệt",
    reviewing: "Đang xem xét",
    approved: "Đã duyệt",
    rejected: "Từ chối",
    suspended: "Tạm khóa",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-sm ${config[status] || ""}`}>
      {label[status] || status}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-4">
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}