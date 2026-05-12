import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  FileWarning,
  RefreshCcw,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

const statusOptions = [
  ["all", "Tất cả"],
  ["pending", "Chờ xử lý"],
  ["reviewing", "Đang xem xét"],
  ["resolved", "Đã xử lý"],
  ["rejected", "Từ chối"],
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);

      let res;

      try {
        res = await api.get("/admin/reports");
      } catch {
        res = await api.get("/reports");
      }

      setReports(res.data.reports || []);
    } catch (error) {
      console.error("FETCH REPORTS ERROR:", error);
      alert(error.response?.data?.message || "Không tải được báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const text = `${r.title || ""} ${r.reason || ""} ${
        r.description || ""
      } ${r.target_name || ""}`.toLowerCase();

      const matchKeyword = text.includes(keyword.toLowerCase());
      const matchStatus = status === "all" || r.status === status;

      return matchKeyword && matchStatus;
    });
  }, [reports, keyword, status]);

  const updateReport = async (id, payload) => {
    try {
      try {
        await api.put(`/admin/reports/${id}`, payload);
      } catch {
        await api.put(`/reports/${id}`, payload);
      }

      await fetchReports();
      alert("Cập nhật báo cáo thành công");
    } catch (error) {
      console.error("UPDATE REPORT ERROR:", error);
      alert(error.response?.data?.message || "Lỗi cập nhật báo cáo");
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa báo cáo này?")) return;

    try {
      try {
        await api.delete(`/admin/reports/${id}`);
      } catch {
        await api.delete(`/reports/${id}`);
      }

      await fetchReports();
      alert("Xóa báo cáo thành công");
    } catch (error) {
      console.error("DELETE REPORT ERROR:", error);
      alert(error.response?.data?.message || "Lỗi xóa báo cáo");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải danh sách báo cáo...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="Quản lý báo cáo vi phạm"
        right={
          <button
            onClick={fetchReports}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Tổng báo cáo" value={reports.length} />
        <StatCard
          label="Chờ xử lý"
          value={reports.filter((r) => (r.status || "pending") === "pending").length}
        />
        <StatCard
          label="Đang xem xét"
          value={reports.filter((r) => r.status === "reviewing").length}
        />
        <StatCard
          label="Đã xử lý"
          value={reports.filter((r) => r.status === "resolved").length}
        />
      </div>

      <Card className="p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white/60">
            <Search className="h-4 w-4" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tiêu đề, lý do, mô tả..."
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
                <th className="p-5">Báo cáo</th>
                <th>Đối tượng</th>
                <th>Loại</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th className="pr-5 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-white/45">
                    Không có báo cáo phù hợp
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => {
                  const id = report._id || report.id;
                  const target =
                    report.project_id?.title ||
                    report.target_name ||
                    report.reported_user_id?.email ||
                    "Không rõ";

                  return (
                    <tr key={id} className="border-t border-white/10 text-sm">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-red-500/10 p-3 text-red-300">
                            <ShieldAlert className="h-5 w-5" />
                          </div>

                          <div>
                            <div className="font-semibold text-white">
                              {report.title || "Báo cáo vi phạm"}
                            </div>
                            <div className="mt-1 text-white/40">
                              ID: {String(id).slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="text-white/70">{target}</td>
                      <td className="text-white/70">
                        {report.report_type || "other"}
                      </td>
                      <td className="max-w-[260px] truncate text-white/70">
                        {report.reason || "Không có"}
                      </td>

                      <td>
                        <StatusBadge status={report.status || "pending"} />
                      </td>

                      <td className="text-white/60">
                        {report.createdAt || report.created_at
                          ? new Date(
                              report.createdAt || report.created_at
                            ).toLocaleDateString("vi-VN")
                          : "—"}
                      </td>

                      <td className="pr-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/5"
                            title="Xem chi tiết"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() =>
                              updateReport(id, {
                                status: "reviewing",
                                handled_note: "Admin đang xem xét báo cáo.",
                              })
                            }
                            className="rounded-xl bg-yellow-500 px-3 py-2 text-slate-950 hover:bg-yellow-400"
                          >
                            Xem xét
                          </button>

                          <button
                            onClick={() =>
                              updateReport(id, {
                                status: "resolved",
                                handled_note: "Báo cáo đã được xử lý.",
                              })
                            }
                            className="rounded-xl bg-green-500 px-3 py-2 text-slate-950 hover:bg-green-400"
                          >
                            Xử lý
                          </button>

                          <button
                            onClick={() => deleteReport(id)}
                            className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
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

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdate={async (payload) => {
            await updateReport(selectedReport._id || selectedReport.id, payload);
            setSelectedReport(null);
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
    pending: "Chờ xử lý",
    reviewing: "Đang xem xét",
    resolved: "Đã xử lý",
    rejected: "Từ chối",
  };

  const color =
    status === "resolved"
      ? "bg-green-500/10 text-green-300"
      : status === "rejected"
      ? "bg-red-500/10 text-red-300"
      : status === "reviewing"
      ? "bg-blue-500/10 text-blue-300"
      : "bg-yellow-500/10 text-yellow-300";

  return (
    <span className={`rounded-full px-3 py-1 text-sm ${color}`}>
      {map[status] || status}
    </span>
  );
}

function ReportDetailModal({ report, onClose, onUpdate }) {
  const [status, setStatus] = useState(report.status || "pending");
  const [handledNote, setHandledNote] = useState(report.handled_note || "");

  const target =
    report.project_id?.title ||
    report.target_name ||
    report.reported_user_id?.email ||
    "Không rõ đối tượng";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101827] p-6 text-white">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">Chi tiết báo cáo</p>
            <h2 className="mt-1 text-2xl font-bold">
              {report.title || "Báo cáo vi phạm"}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-white/70 hover:bg-white/5"
          >
            Đóng
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Đối tượng" value={target} />
          <Info label="Loại báo cáo" value={report.report_type || "other"} />
          <Info label="Lý do" value={report.reason || "Không có"} />
          <Info label="Trạng thái hiện tại" value={report.status || "pending"} />
          <Info
            label="Ngày tạo"
            value={
              report.createdAt || report.created_at
                ? new Date(report.createdAt || report.created_at).toLocaleString(
                    "vi-VN"
                  )
                : "Không rõ"
            }
          />
          <Info
            label="Ngày xử lý"
            value={
              report.handled_at
                ? new Date(report.handled_at).toLocaleString("vi-VN")
                : "Chưa xử lý"
            }
          />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-900/70 p-5">
          <p className="mb-2 text-sm text-white/45">Mô tả chi tiết</p>
          <p className="whitespace-pre-wrap leading-7 text-white/75">
            {report.description || "Không có mô tả"}
          </p>
        </div>

        {report.evidence_url && (
          <a
            href={`http://localhost:5001${report.evidence_url}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-2xl bg-blue-500 px-5 py-3 font-medium text-white"
          >
            Xem bằng chứng
          </a>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-[240px_1fr]">
          <div>
            <label className="text-sm text-white/60">Cập nhật trạng thái</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
            >
              <option value="pending">Chờ xử lý</option>
              <option value="reviewing">Đang xem xét</option>
              <option value="resolved">Đã xử lý</option>
              <option value="rejected">Từ chối</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white/60">Ghi chú xử lý</label>
            <textarea
              value={handledNote}
              onChange={(e) => setHandledNote(e.target.value)}
              rows={4}
              placeholder="Nhập ghi chú xử lý báo cáo..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() =>
              onUpdate({
                status: "rejected",
                handled_note: handledNote || "Báo cáo bị từ chối.",
              })
            }
            className="rounded-2xl bg-red-500/20 px-5 py-3 font-medium text-red-300 hover:bg-red-500/30"
          >
            Từ chối
          </button>

          <button
            onClick={() =>
              onUpdate({
                status,
                handled_note: handledNote,
              })
            }
            className="rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            Lưu xử lý
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
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}