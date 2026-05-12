import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Eye,
  Gavel,
  RefreshCcw,
  Search,
  ShieldAlert,
  Trash2,
  UserX,
} from "lucide-react";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

export default function AdminModerationPage() {
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);

      const [projectRes, reportRes, userRes] = await Promise.allSettled([
        api.get("/admin/projects"),
        api.get("/admin/reports"),
        api.get("/admin/users"),
      ]);

      if (projectRes.status === "fulfilled") {
        setProjects(projectRes.value.data.projects || []);
      }

      if (reportRes.status === "fulfilled") {
        setReports(reportRes.value.data.reports || []);
      }

      if (userRes.status === "fulfilled") {
        setUsers(userRes.value.data.users || []);
      }
    } catch (error) {
      console.error("MODERATION ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const riskyProjects = useMemo(() => {
    return projects.filter((project) => {
      const risk =
        Number(project.ai_risk_score || 0) >= 70 ||
        Number(project.esg_score || 0) <= 40 ||
        project.status === "reported";

      const text = `${project.title || ""} ${
        project.description || ""
      }`.toLowerCase();

      return (
        risk &&
        text.includes(keyword.toLowerCase())
      );
    });
  }, [projects, keyword]);

  const suspiciousUsers = useMemo(() => {
    return users.filter((user) => {
      const text = `${user.name || ""} ${user.email || ""}`.toLowerCase();

      return (
        (user.is_banned ||
          user.report_count >= 3 ||
          user.fake_score >= 60) &&
        text.includes(keyword.toLowerCase())
      );
    });
  }, [users, keyword]);

  const moderationReports = useMemo(() => {
    return reports.filter((report) => {
      const text = `${report.title || ""} ${
        report.reason || ""
      }`.toLowerCase();

      return text.includes(keyword.toLowerCase());
    });
  }, [reports, keyword]);

  const updateProjectStatus = async (id, status) => {
    try {
      await api.put(`/admin/projects/${id}/status`, {
        status,
      });

      await fetchData();

      alert("Cập nhật trạng thái thành công");
    } catch (error) {
      console.error(error);
      alert("Lỗi cập nhật dự án");
    }
  };

  const banUser = async (id) => {
    if (!window.confirm("Khóa người dùng này?")) return;

    try {
      await api.put(`/admin/users/${id}/ban`);

      await fetchData();

      alert("Đã khóa tài khoản");
    } catch (error) {
      console.error(error);
      alert("Lỗi khóa tài khoản");
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Xóa dự án này?")) return;

    try {
      await api.delete(`/admin/projects/${id}`);

      await fetchData();

      alert("Đã xóa dự án");
    } catch (error) {
      console.error(error);
      alert("Lỗi xóa dự án");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải moderation...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="Moderation & kiểm duyệt hệ thống"
        right={
          <button
            onClick={fetchData}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard
          icon={AlertTriangle}
          label="Dự án rủi ro"
          value={riskyProjects.length}
          color="text-yellow-300"
        />

        <StatCard
          icon={ShieldAlert}
          label="Báo cáo"
          value={moderationReports.length}
          color="text-red-300"
        />

        <StatCard
          icon={UserX}
          label="User nghi vấn"
          value={suspiciousUsers.length}
          color="text-orange-300"
        />

        <StatCard
          icon={Gavel}
          label="Moderation"
          value={
            riskyProjects.length +
            suspiciousUsers.length +
            moderationReports.length
          }
          color="text-green-300"
        />
      </div>

      <Card className="p-5">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white/60">
          <Search className="h-4 w-4" />

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm moderation..."
            className="w-full bg-transparent outline-none placeholder:text-white/35"
          />
        </label>
      </Card>

      {/* PROJECTS */}

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-300" />

          <h3 className="text-xl font-semibold text-white">
            Dự án rủi ro cao
          </h3>
        </div>

        <div className="space-y-4">
          {riskyProjects.length === 0 ? (
            <Empty />
          ) : (
            riskyProjects.map((project) => (
              <div
                key={project._id}
                className="rounded-2xl border border-yellow-400/10 bg-yellow-500/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <h4 className="text-lg font-semibold text-white">
                      {project.title}
                    </h4>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge text={`AI Risk ${project.ai_risk_score || 0}%`} />
                      <Badge text={`ESG ${project.esg_score || 0}`} />
                      <Badge text={project.status || "pending"} />
                    </div>

                    <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
                      {project.description || "Không có mô tả"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        updateProjectStatus(project._id, "approved")
                      }
                      className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-slate-950"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Duyệt
                    </button>

                    <button
                      onClick={() =>
                        updateProjectStatus(project._id, "rejected")
                      }
                      className="flex items-center gap-2 rounded-xl bg-red-500/20 px-4 py-2 text-red-300"
                    >
                      <Ban className="h-4 w-4" />
                      Từ chối
                    </button>

                    <button
                      onClick={() => deleteProject(project._id)}
                      className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* USERS */}

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <UserX className="h-5 w-5 text-orange-300" />

          <h3 className="text-xl font-semibold text-white">
            Người dùng nghi vấn
          </h3>
        </div>

        <div className="space-y-4">
          {suspiciousUsers.length === 0 ? (
            <Empty />
          ) : (
            suspiciousUsers.map((user) => (
              <div
                key={user._id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5"
              >
                <div>
                  <h4 className="font-semibold text-white">
                    {user.name || "Unknown"}
                  </h4>

                  <p className="mt-1 text-sm text-white/50">
                    {user.email}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <Badge text={`Reports ${user.report_count || 0}`} />
                    <Badge text={`Fake ${user.fake_score || 0}%`} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="rounded-xl border border-white/10 p-3 text-white/70">
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => banUser(user._id)}
                    className="rounded-xl bg-red-500/20 px-4 py-2 text-red-300"
                  >
                    Khóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* REPORTS */}

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-red-300" />

          <h3 className="text-xl font-semibold text-white">
            Báo cáo moderation
          </h3>
        </div>

        <div className="space-y-4">
          {moderationReports.length === 0 ? (
            <Empty />
          ) : (
            moderationReports.map((report) => (
              <div
                key={report._id}
                className="rounded-2xl border border-red-400/10 bg-red-500/5 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div>
                    <h4 className="font-semibold text-white">
                      {report.title || "Báo cáo"}
                    </h4>

                    <p className="mt-2 text-sm text-white/60">
                      {report.reason || "Không có lý do"}
                    </p>

                    <p className="mt-4 text-sm leading-7 text-white/50">
                      {report.description || "Không có mô tả"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button className="rounded-xl bg-green-500 px-4 py-2 text-slate-950">
                      Resolve
                    </button>

                    <button className="rounded-xl bg-red-500/20 px-4 py-2 text-red-300">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50">{label}</p>

          <h3 className={`mt-3 text-4xl font-bold ${color}`}>
            {value}
          </h3>
        </div>

        <div className={`rounded-2xl bg-white/5 p-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function Badge({ text }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
      {text}
    </span>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-10 text-center text-white/45">
      Không có dữ liệu moderation
    </div>
  );
}