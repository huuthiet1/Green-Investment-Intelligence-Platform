import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  FileWarning,
  FolderKanban,
  Leaf,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

const fallbackStats = {
  projects: 0,
  users: 0,
  reports: 0,
  avgESG: 0,
  pendingProjects: 0,
  approvedProjects: 0,
  rejectedProjects: 0,
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(fallbackStats);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [overviewRes, projectsRes, usersRes, reportsRes] =
        await Promise.allSettled([
          api.get("/admin/overview"),
          api.get("/admin/projects"),
          api.get("/admin/users"),
          api.get("/reports"),
        ]);

      if (overviewRes.status === "fulfilled") {
        setStats({
          ...fallbackStats,
          ...(overviewRes.value.data.stats || {}),
        });
      }

      if (projectsRes.status === "fulfilled") {
        setProjects(projectsRes.value.data.projects || []);
      }

      if (usersRes.status === "fulfilled") {
        setUsers(usersRes.value.data.users || []);
      }

      if (reportsRes.status === "fulfilled") {
        setReports(reportsRes.value.data.reports || []);
      }
    } catch (error) {
      console.error("ADMIN DASHBOARD ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const pendingProjects =
    stats.pendingProjects ||
    projects.filter((p) => (p.status || "pending") === "pending").length;

  const approvedProjects =
    stats.approvedProjects ||
    projects.filter((p) => p.status === "approved").length;

  const rejectedProjects =
    stats.rejectedProjects ||
    projects.filter((p) => p.status === "rejected").length;

  const projectStatusChart = [
    { name: "Chờ duyệt", value: pendingProjects },
    { name: "Đã duyệt", value: approvedProjects },
    { name: "Từ chối", value: rejectedProjects },
  ];

  const roleChart = [
    {
      name: "Business",
      value: users.filter((u) => u.role === "business").length,
    },
    {
      name: "Investor",
      value: users.filter((u) => u.role === "investor").length,
    },
    {
      name: "Admin",
      value: users.filter((u) => u.role === "admin").length,
    },
  ];

  const projectCapitalChart = projects.slice(0, 6).map((p) => ({
    name: p.title || p.name || "Dự án",
    capital: Number(p.capital_needed || 0),
  }));

  const recentProjects = projects.slice(0, 5);
  const recentReports = reports.slice(0, 5);

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải dữ liệu admin...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="Tổng quan hệ thống"
        right={
          <button
            onClick={fetchDashboard}
            className="rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Tổng dự án"
          value={stats.projects || projects.length}
          sub={`${pendingProjects} dự án chờ duyệt`}
        />

        <StatCard
          icon={Users}
          label="Người dùng"
          value={stats.users || users.length}
          sub="Admin / Business / Investor"
        />

        <StatCard
          icon={FileWarning}
          label="Báo cáo"
          value={stats.reports || reports.length}
          sub="Báo cáo và nhắc việc"
        />

        <StatCard
          icon={Leaf}
          label="ESG trung bình"
          value={stats.avgESG || 0}
          sub="Điểm ESG toàn hệ thống"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold">Vốn gọi theo dự án</h3>
          </div>

          <div className="h-80">
            {projectCapitalChart.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectCapitalChart}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fill: "#94a3b8" }} />
                  <YAxis tick={{ fill: "#94a3b8" }} />
                  <Tooltip />
                  <Bar dataKey="capital" name="Vốn cần gọi" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyText text="Chưa có dữ liệu dự án" />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold">Trạng thái dự án</h3>
          </div>

          <div className="h-80">
            {projectStatusChart.some((x) => x.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusChart}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={105}
                    label
                  >
                    {projectStatusChart.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={["#22c55e", "#38bdf8", "#f97316"][index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyText text="Chưa có dữ liệu trạng thái" />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <Users className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold">Vai trò người dùng</h3>
          </div>

          <div className="space-y-4">
            {roleChart.map((item) => (
              <ProgressRow
                key={item.name}
                label={item.name}
                value={item.value}
                total={users.length || 1}
              />
            ))}
          </div>
        </Card>

        <Card className="p-6 xl:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <Clock className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold">Dự án mới nhất</h3>
          </div>

          <div className="space-y-3">
            {recentProjects.length ? (
              recentProjects.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between rounded-2xl bg-slate-900/70 p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {p.title || p.name || "Dự án không tên"}
                    </p>
                    <p className="mt-1 text-sm text-white/45">
                      {p.category_name || "Chưa có danh mục"}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300">
                    {p.status || "pending"}
                  </span>
                </div>
              ))
            ) : (
              <EmptyText text="Chưa có dự án" />
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-green-400" />
          <h3 className="text-xl font-semibold">Báo cáo gần đây</h3>
        </div>

        <div className="space-y-3">
          {recentReports.length ? (
            recentReports.map((r) => (
              <div
                key={r._id}
                className="flex items-center justify-between rounded-2xl bg-slate-900/70 p-4"
              >
                <div>
                  <p className="font-semibold">{r.title || "Báo cáo"}</p>
                  <p className="mt-1 text-sm text-white/45">
                    {r.project_id?.title || r.target_name || "Không rõ đối tượng"}
                  </p>
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/70">
                  {r.status || "pending"}
                </span>
              </div>
            ))
          ) : (
            <EmptyText text="Chưa có báo cáo" />
          )}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/50">{label}</p>
          <h3 className="mt-2 text-4xl font-bold">{value}</h3>
          <p className="mt-2 text-sm text-white/40">{sub}</p>
        </div>

        <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function ProgressRow({ label, value, total }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="text-white/45">
          {value} tài khoản • {percent}%
        </span>
      </div>

      <div className="h-2 rounded-full bg-slate-900">
        <div
          className="h-2 rounded-full bg-green-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function EmptyText({ text }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-900/50 p-6 text-center text-white/45">
      {text}
    </div>
  );
}