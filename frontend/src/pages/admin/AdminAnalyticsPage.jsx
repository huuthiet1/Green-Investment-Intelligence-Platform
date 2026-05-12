import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  FileWarning,
  FolderKanban,
  Leaf,
  RefreshCcw,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

export default function AdminAnalyticsPage() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const [projectRes, userRes, reportRes] = await Promise.allSettled([
        api.get("/admin/projects"),
        api.get("/admin/users"),
        api.get("/admin/reports"),
      ]);

      if (projectRes.status === "fulfilled") {
        setProjects(projectRes.value.data.projects || []);
      }

      if (userRes.status === "fulfilled") {
        setUsers(userRes.value.data.users || []);
      }

      if (reportRes.status === "fulfilled") {
        setReports(reportRes.value.data.reports || []);
      } else {
        const fallback = await api.get("/reports");
        setReports(fallback.data.reports || []);
      }
    } catch (error) {
      console.error("ADMIN ANALYTICS ERROR:", error);
      alert(error.response?.data?.message || "Không tải được analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const totalCapital = useMemo(() => {
    return projects.reduce(
      (sum, p) => sum + Number(p.capital_needed || 0),
      0
    );
  }, [projects]);

  const avgESG = useMemo(() => {
    if (!projects.length) return 0;
    return Math.round(
      projects.reduce((sum, p) => sum + Number(p.esg_score || 0), 0) /
        projects.length
    );
  }, [projects]);

  const projectStatusChart = useMemo(() => {
    const statuses = ["draft", "pending", "approved", "rejected", "closed", "funded"];

    return statuses.map((status) => ({
      name: translateStatus(status),
      value: projects.filter((p) => (p.status || "pending") === status).length,
    }));
  }, [projects]);

  const userRoleChart = useMemo(() => {
    const roles = ["admin", "business", "investor"];

    return roles.map((role) => ({
      name: translateRole(role),
      value: users.filter((u) => u.role === role).length,
    }));
  }, [users]);

  const capitalChart = useMemo(() => {
    return projects.slice(0, 8).map((p) => ({
      name: shorten(p.title || p.name || "Dự án"),
      capital: Number(p.capital_needed || 0),
      esg: Number(p.esg_score || 0),
      roi: Number(p.roi_expected || 0),
    }));
  }, [projects]);

  const categoryChart = useMemo(() => {
    const map = {};

    projects.forEach((p) => {
      const category = p.category_name || "Khác";
      map[category] = (map[category] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
    }));
  }, [projects]);

  const reportStatusChart = useMemo(() => {
    const statuses = ["pending", "reviewing", "resolved", "rejected"];

    return statuses.map((status) => ({
      name: translateReportStatus(status),
      value: reports.filter((r) => (r.status || "pending") === status).length,
    }));
  }, [reports]);

  const esgTrendChart = useMemo(() => {
    return projects.slice(0, 10).map((p, index) => ({
      name: `P${index + 1}`,
      esg: Number(p.esg_score || 0),
      roi: Number(p.roi_expected || 0),
    }));
  }, [projects]);

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải dữ liệu phân tích...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Admin"
        title="Phân tích dữ liệu hệ thống"
        right={
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={FolderKanban}
          label="Tổng dự án"
          value={projects.length}
          sub="Tất cả dự án trên hệ thống"
        />

        <StatCard
          icon={Users}
          label="Người dùng"
          value={users.length}
          sub="Admin / Business / Investor"
        />

        <StatCard
          icon={Leaf}
          label="ESG trung bình"
          value={avgESG}
          sub="Điểm ESG trung bình"
        />

        <StatCard
          icon={FileWarning}
          label="Báo cáo"
          value={reports.length}
          sub="Báo cáo vi phạm / nhắc việc"
        />
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-green-400" />
          <h3 className="text-xl font-semibold text-white">
            Tổng vốn gọi theo dự án
          </h3>
        </div>

        <div className="h-[380px]">
          {capitalChart.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={capitalChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
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

        <p className="mt-4 text-sm text-white/45">
          Tổng vốn cần gọi:{" "}
          <span className="font-semibold text-green-300">
            {Number(totalCapital || 0).toLocaleString("vi-VN")} VND
          </span>
        </p>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Trạng thái dự án" icon={FolderKanban}>
          {projectStatusChart.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusChart}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {projectStatusChart.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={["#64748b", "#eab308", "#22c55e", "#ef4444", "#38bdf8", "#a855f7"][index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyText text="Chưa có dữ liệu trạng thái dự án" />
          )}
        </ChartCard>

        <ChartCard title="Người dùng theo vai trò" icon={Users}>
          {userRoleChart.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userRoleChart}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  label
                >
                  {userRoleChart.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={["#22c55e", "#38bdf8", "#f97316"][index]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyText text="Chưa có dữ liệu người dùng" />
          )}
        </ChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ChartCard title="Dự án theo danh mục" icon={Activity}>
          {categoryChart.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8" }} />
                <YAxis tick={{ fill: "#94a3b8" }} />
                <Tooltip />
                <Bar dataKey="value" name="Số dự án" fill="#38bdf8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyText text="Chưa có dữ liệu danh mục" />
          )}
        </ChartCard>

        <ChartCard title="Trạng thái báo cáo" icon={FileWarning}>
          {reportStatusChart.some((item) => item.value > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reportStatusChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8" }} />
                <YAxis tick={{ fill: "#94a3b8" }} />
                <Tooltip />
                <Bar dataKey="value" name="Số báo cáo" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyText text="Chưa có dữ liệu báo cáo" />
          )}
        </ChartCard>
      </div>

      <Card className="p-6">
        <div className="mb-5 flex items-center gap-3">
          <Leaf className="h-5 w-5 text-green-400" />
          <h3 className="text-xl font-semibold text-white">
            ESG và ROI theo dự án
          </h3>
        </div>

        <div className="h-[360px]">
          {esgTrendChart.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={esgTrendChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8" }} />
                <YAxis tick={{ fill: "#94a3b8" }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="esg"
                  name="ESG"
                  stroke="#22c55e"
                  strokeWidth={3}
                />
                <Line
                  type="monotone"
                  dataKey="roi"
                  name="ROI"
                  stroke="#38bdf8"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyText text="Chưa có dữ liệu ESG/ROI" />
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
          <h3 className="mt-2 text-4xl font-bold text-white">{value}</h3>
          <p className="mt-2 text-sm text-white/40">{sub}</p>
        </div>

        <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <Card className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-green-400" />
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>

      <div className="h-[340px]">{children}</div>
    </Card>
  );
}

function EmptyText({ text }) {
  return (
    <div className="flex h-full items-center justify-center rounded-2xl bg-slate-900/60 p-6 text-center text-white/45">
      {text}
    </div>
  );
}

function translateStatus(status) {
  const map = {
    draft: "Bản nháp",
    pending: "Chờ duyệt",
    approved: "Đã duyệt",
    rejected: "Từ chối",
    closed: "Đã đóng",
    funded: "Đã gọi đủ vốn",
  };

  return map[status] || status;
}

function translateRole(role) {
  const map = {
    admin: "Admin",
    business: "Doanh nghiệp",
    investor: "Nhà đầu tư",
  };

  return map[role] || role;
}

function translateReportStatus(status) {
  const map = {
    pending: "Chờ xử lý",
    reviewing: "Đang xem xét",
    resolved: "Đã xử lý",
    rejected: "Từ chối",
  };

  return map[status] || status;
}

function shorten(text) {
  if (!text) return "Dự án";
  return text.length > 16 ? text.slice(0, 16) + "..." : text;
}