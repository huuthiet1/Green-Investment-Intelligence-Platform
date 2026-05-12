import React, { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Eye,
  FileClock,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

const moduleOptions = [
  ["all", "Tất cả module"],
  ["auth", "Auth"],
  ["project", "Dự án"],
  ["user", "Người dùng"],
  ["report", "Báo cáo"],
  ["kyc", "KYC"],
  ["fraud", "AI Fraud"],
  ["system", "System"],
  ["notification", "Notification"],
  ["admin", "Admin"],
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [module, setModule] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (module !== "all") params.append("module", module);
      if (keyword.trim()) params.append("keyword", keyword.trim());

      const res = await api.get(`/audit-logs?${params.toString()}`);

      setLogs(res.data.logs || []);
    } catch (error) {
      console.error("FETCH AUDIT LOGS ERROR:", error);
      alert(error.response?.data?.message || "Không tải được audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [module]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const text = `${log.action || ""} ${log.module || ""} ${
        log.target_name || ""
      } ${log.actor_id || ""} ${log.note || ""}`.toLowerCase();

      return text.includes(keyword.toLowerCase());
    });
  }, [logs, keyword]);

  const deleteLog = async (id) => {
    if (!window.confirm("Xóa log này?")) return;

    try {
      await api.delete(`/audit-logs/${id}`);
      fetchLogs();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xóa audit log");
    }
  };

  const clearLogs = async () => {
    if (!window.confirm("Xóa toàn bộ audit logs?")) return;

    try {
      await api.delete("/audit-logs");
      fetchLogs();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xóa toàn bộ logs");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải audit logs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="Audit Logs"
        right={
          <div className="flex gap-3">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
            >
              <RefreshCcw className="h-4 w-4" />
              Làm mới
            </button>

            <button
              onClick={clearLogs}
              className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-3 font-medium text-red-300 hover:bg-red-500/20"
            >
              <Trash2 className="h-4 w-4" />
              Xóa tất cả
            </button>
          </div>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Tổng logs" value={logs.length} />
        <StatCard
          label="Project"
          value={logs.filter((l) => l.module === "project").length}
        />
        <StatCard
          label="User"
          value={logs.filter((l) => l.module === "user").length}
        />
        <StatCard
          label="Fraud/KYC"
          value={
            logs.filter((l) => ["fraud", "kyc"].includes(l.module)).length
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
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchLogs();
              }}
              placeholder="Tìm action, target, actor, ghi chú..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
          </label>

          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          >
            {moduleOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-white/5 text-left text-sm text-white/50">
              <tr>
                <th className="p-5">Action</th>
                <th>Module</th>
                <th>Actor</th>
                <th>Target</th>
                <th>Ghi chú</th>
                <th>Thời gian</th>
                <th className="pr-5 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-10 text-center text-white/45">
                    Không có audit log phù hợp
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="border-t border-white/10 text-sm">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl bg-green-500/10 p-3 text-green-300">
                          <FileClock className="h-5 w-5" />
                        </div>

                        <div>
                          <div className="font-semibold text-white">
                            {log.action}
                          </div>
                          <div className="mt-1 text-white/40">
                            ID: {String(log._id).slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-white/70">
                        {log.module}
                      </span>
                    </td>

                    <td className="text-white/70">
                      {log.actor_id || "admin-demo"}
                    </td>

                    <td className="text-white/70">
                      {log.target_name || log.target_id || "—"}
                    </td>

                    <td className="max-w-[280px] truncate text-white/60">
                      {log.note || "—"}
                    </td>

                    <td className="text-white/60">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString("vi-VN")
                        : "—"}
                    </td>

                    <td className="pr-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="rounded-xl border border-white/10 p-2 text-white/70 hover:bg-white/5"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => deleteLog(log._id)}
                          className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedLog && (
        <AuditDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}

function AuditDetailModal({ log, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#101827] p-6 text-white">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-white/45">Chi tiết audit log</p>
            <h2 className="mt-1 text-2xl font-bold">{log.action}</h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2 text-white/70 hover:bg-white/5"
          >
            Đóng
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Module" value={log.module} />
          <Info label="Actor" value={log.actor_id || "admin-demo"} />
          <Info label="Role" value={log.actor_role || "admin"} />
          <Info label="Target" value={log.target_name || log.target_id || "—"} />
          <Info label="IP" value={log.ip_address || "Không rõ"} />
          <Info
            label="Thời gian"
            value={
              log.createdAt
                ? new Date(log.createdAt).toLocaleString("vi-VN")
                : "—"
            }
          />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-900/70 p-5">
          <p className="mb-2 text-sm text-white/45">Ghi chú</p>
          <p className="whitespace-pre-wrap text-white/75">
            {log.note || "Không có ghi chú"}
          </p>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <JsonBox title="Old data" data={log.old_data} />
          <JsonBox title="New data" data={log.new_data} />
        </div>

        <div className="mt-5 rounded-2xl bg-slate-900/70 p-5">
          <p className="mb-2 text-sm text-white/45">User Agent</p>
          <p className="break-words text-sm text-white/60">
            {log.user_agent || "Không rõ"}
          </p>
        </div>
      </div>
    </div>
  );
}

function JsonBox({ title, data }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-5">
      <p className="mb-3 text-sm text-white/45">{title}</p>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs leading-6 text-white/70">
        {JSON.stringify(data || {}, null, 2)}
      </pre>
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

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-4">
      <p className="text-sm text-white/45">{label}</p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}