import React, { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";
import {
  Leaf,
  Search,
  Bell,
  User,
  LineChart,
  Wallet,
  FolderKanban,
  ShieldCheck,
  TrendingUp,
  Activity,
  Building2,
  Star,
  CircleDollarSign,
  ArrowUpRight,
  Clock3,
  Menu,
  LogOut,
} from "lucide-react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Card({ className = "", children }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, right }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-sm text-white/55">{eyebrow}</p> : null}
        <h3 className="mt-1 text-xl font-semibold">{title}</h3>
      </div>
      {right}
    </div>
  );
}

function SidebarItem({ icon: Icon, label, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
        active
          ? "bg-green-500 text-slate-950"
          : "text-white/70 hover:bg-white/5 hover:text-white"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}

const SIDEBAR_ITEMS = [
  { label: "Tổng quan", icon: Activity, active: true },
  { label: "Dự án", icon: FolderKanban },
  { label: "Đầu tư", icon: Wallet },
  { label: "ESG", icon: Leaf },
  { label: "Thống kê", icon: LineChart },
  { label: "Bảo mật", icon: ShieldCheck },
];

const QUICK_ACTIONS = [
  { id: 1, title: "Tạo dự án mới", icon: FolderKanban },
  { id: 2, title: "Thêm vòng gọi vốn", icon: Wallet },
  { id: 3, title: "Đánh giá ESG", icon: ShieldCheck },
  { id: 4, title: "Xem báo cáo", icon: LineChart },
];

const CHART_BARS = [38, 52, 49, 68, 75, 83, 95];
const STAT_ICONS = [FolderKanban, User, CircleDollarSign, Leaf];

const StatCard = memo(function StatCard({ title, value, change, icon: Icon }) {
  return (
    <Card className="p-5 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/55">{title}</p>
          <div className="mt-3 text-3xl font-bold">{value}</div>
          {change ? <p className="mt-2 text-sm text-green-400">{change}</p> : null}
        </div>
        <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
});

const QuickActionButton = memo(function QuickActionButton({ title, icon: Icon }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-left transition hover:border-green-400/30 hover:bg-slate-900"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-green-500/10 p-2 text-green-400">
          <Icon className="h-5 w-5" />
        </div>
        <span>{title}</span>
      </div>
      <ArrowUpRight className="h-4 w-4 text-white/45" />
    </button>
  );
});

const ProjectRow = memo(function ProjectRow({
  name,
  category,
  esg,
  capital,
  status,
}) {
  return (
    <div className="grid grid-cols-5 items-center px-4 py-4 text-sm">
      <div className="col-span-2 min-w-0">
        <div className="truncate font-medium">{name}</div>
        <div className="truncate text-white/50">{category}</div>
      </div>

      <div>
        <span className="rounded-full bg-green-500/10 px-3 py-1 text-green-400">
          {esg}
        </span>
      </div>

      <div>{capital}</div>

      <div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/75">
          {status}
        </span>
      </div>
    </div>
  );
});

const ActivityItem = memo(function ActivityItem({ content, time }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="mt-1 h-3 w-3 rounded-full bg-green-400" />
      <div>
        <p className="text-sm leading-6 text-white/80">{content}</p>
        <p className="mt-1 text-xs text-white/45">{time}</p>
      </div>
    </div>
  );
});

function Sidebar({ onLogout }) {
  return (
    <aside className="hidden w-72 border-r border-white/10 bg-slate-950/95 p-6 lg:block">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15 ring-1 ring-green-400/30">
          <Leaf className="h-6 w-6 text-green-400" />
        </div>
        <div>
          <p className="text-sm text-white/55">Green Investment</p>
          <h1 className="font-semibold">Dashboard</h1>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {SIDEBAR_ITEMS.map((item) => (
          <SidebarItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            active={item.active}
          />
        ))}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
      >
        <LogOut className="h-4 w-4" />
        Đăng xuất
      </button>
    </aside>
  );
}

function Header({ userName, onLogout }) {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 px-6 py-5 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-sm text-white/55">Xin chào trở lại</p>
            <h2 className="text-2xl font-bold">Bảng điều khiển hệ thống</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/60 md:flex">
            <Search className="h-4 w-4" />
            <span className="text-sm">Tìm kiếm dự án, ESG, đầu tư...</span>
          </div>

          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
          >
            <Bell className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <User className="h-4 w-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">{userName || "User"}</div>
              <div className="text-xs text-white/55">Quản trị hệ thống</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </header>
  );
}

function SummaryChartCard({ summary = [] }) {
  return (
    <Card className="p-6">
      <SectionTitle
        eyebrow="Báo cáo nhanh"
        title="Hiệu quả gọi vốn & ESG"
        right={
          <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-2 text-sm text-green-400">
            <TrendingUp className="h-4 w-4" />
            Tăng trưởng tích cực
          </div>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"
          >
            <div className="text-sm text-white/55">{item.label}</div>
            <div className="mt-3 text-2xl font-bold">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 h-72 rounded-3xl border border-dashed border-green-400/20 bg-[linear-gradient(180deg,rgba(34,197,94,0.10),rgba(15,23,42,0.10))] p-6">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/55">Biểu đồ mô phỏng</p>
              <h4 className="text-lg font-semibold">Xu hướng vốn và điểm ESG</h4>
            </div>
            <LineChart className="h-6 w-6 text-green-400" />
          </div>

          <div className="flex h-40 items-end gap-3">
            {CHART_BARS.map((value, index) => (
              <div
                key={`${value}-${index}`}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <div
                  className="w-full rounded-t-2xl bg-green-500/70"
                  style={{ height: `${value}%` }}
                />
                <span className="text-xs text-white/45">T{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

function QuickActionsCard() {
  return (
    <Card className="p-6">
      <SectionTitle eyebrow="Thao tác nhanh" title="Quản lý nhanh" />

      <div className="mt-5 space-y-3">
        {QUICK_ACTIONS.map((item) => (
          <QuickActionButton
            key={item.id}
            title={item.title}
            icon={item.icon}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <div className="flex items-center gap-2 text-sm text-white/55">
          <Clock3 className="h-4 w-4" />
          Cập nhật gần nhất
        </div>
        <p className="mt-2 text-sm text-white/75">
          15 phút trước từ hệ thống đánh giá ESG và quản trị dự án.
        </p>
      </div>
    </Card>
  );
}

function ProjectsCard({ projects = [] }) {
  return (
    <Card className="p-6">
      <SectionTitle
        eyebrow="Danh sách dự án"
        title="Dự án nổi bật gần đây"
        right={
          <button
            type="button"
            className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-green-400"
          >
            Xem tất cả
          </button>
        }
      />

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
        <div className="grid grid-cols-5 bg-slate-900/80 px-4 py-3 text-sm text-white/50">
          <div className="col-span-2">Tên dự án</div>
          <div>ESG</div>
          <div>Vốn</div>
          <div>Trạng thái</div>
        </div>

        <div className="divide-y divide-white/10">
          {projects.map((project) => (
            <ProjectRow key={project.id} {...project} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function ActivitiesCard({ activities = [] }) {
  return (
    <Card className="p-6">
      <SectionTitle
        eyebrow="Hoạt động gần đây"
        title="Timeline hệ thống"
        right={<Building2 className="h-5 w-5 text-green-400" />}
      />

      <div className="mt-6 space-y-4">
        {activities.map((item) => (
          <ActivityItem
            key={item.id}
            content={item.content}
            time={item.time}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-green-500/10 to-cyan-500/10 p-5">
        <div className="flex items-center gap-2 text-green-300">
          <Star className="h-4 w-4" />
          Gợi ý hôm nay
        </div>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Ưu tiên duyệt các dự án có ESG trên 85 và đã có trên 10 nhà đầu tư
          quan tâm để tăng tỷ lệ chuyển đổi gọi vốn.
        </p>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/dashboard/overview")
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.error("Dashboard lỗi:", err);
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading dashboard...
      </div>
    );
  }

  const stats = [
    {
      id: 1,
      title: "Tổng dự án đang mở",
      value: data.stats.totalProjects,
      change: "+12% tháng này",
      icon: STAT_ICONS[0],
    },
    {
      id: 2,
      title: "Nhà đầu tư quan tâm",
      value: data.stats.totalInvestors,
      change: "+8.4% tuần này",
      icon: STAT_ICONS[1],
    },
    {
      id: 3,
      title: "Tổng vốn kêu gọi",
      value: data.stats.totalCapital,
      change: "+15 dự án mới",
      icon: STAT_ICONS[2],
    },
    {
      id: 4,
      title: "Điểm ESG trung bình",
      value: data.stats.avgESG,
      change: "Tăng 4.2 điểm",
      icon: STAT_ICONS[3],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar onLogout={handleLogout} />

        <main className="flex-1">
          <Header userName={user?.full_name} onLogout={handleLogout} />

          <section className="px-6 py-8 lg:px-8">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => (
                <StatCard key={item.id} {...item} />
              ))}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
              <SummaryChartCard summary={data.summary} />
              <QuickActionsCard />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <ProjectsCard projects={data.projects} />
              <ActivitiesCard activities={data.activities} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}