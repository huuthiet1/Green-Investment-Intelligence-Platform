import React, { memo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../lib/axios";
import {
  Leaf,
  Search,
  Bell,
  User,
  Heart,
  Wallet,
  TrendingUp,
  Activity,
  Menu,
  LogOut,
  Star,
  ArrowUpRight,
  Clock3,
  LineChart,
  Eye,
  FolderKanban,
  CircleDollarSign,
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

function SidebarItem({ icon: Icon, label, active = false }) {
  return (
    <button
      type="button"
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
  { label: "Khám phá dự án", icon: FolderKanban },
  { label: "Yêu thích", icon: Heart },
  { label: "Quan tâm đầu tư", icon: Wallet },
  { label: "Theo dõi ESG", icon: Leaf },
];

const CHART_BARS = [30, 48, 52, 60, 66, 72, 84];
const STAT_ICONS = [Heart, Wallet, TrendingUp, Eye];

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

const OpportunityCard = memo(function OpportunityCard({
  title,
  category,
  esg,
  capital,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="mt-1 text-sm text-white/50">{category}</p>
        </div>
        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
          ESG {esg}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-white/70">
        <span>Vốn gọi</span>
        <span className="font-medium text-white">{capital}</span>
      </div>

      <button
        type="button"
        className="mt-4 flex items-center gap-2 rounded-2xl bg-green-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-green-400"
      >
        Xem chi tiết
        <ArrowUpRight className="h-4 w-4" />
      </button>
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
          <h1 className="font-semibold">Investor Dashboard</h1>
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
            <h2 className="text-2xl font-bold">Bảng điều khiển nhà đầu tư</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/60 md:flex">
            <Search className="h-4 w-4" />
            <span className="text-sm">Tìm kiếm cơ hội đầu tư...</span>
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
              <div className="text-sm font-medium">{userName || "Investor"}</div>
              <div className="text-xs text-white/55">Nhà đầu tư</div>
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

function PortfolioChartCard({ summary = [] }) {
  return (
    <Card className="p-6">
      <SectionTitle
        eyebrow="Tổng quan đầu tư"
        title="Hiệu suất quan tâm & theo dõi"
        right={
          <div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-2 text-sm text-green-400">
            <TrendingUp className="h-4 w-4" />
            Cơ hội tăng tốt
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
              <h4 className="text-lg font-semibold">Mức độ quan tâm đầu tư</h4>
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

function QuickInfoCard() {
  return (
    <Card className="p-6">
      <SectionTitle eyebrow="Gợi ý nhanh" title="Hành động đề xuất" />

      <div className="mt-5 space-y-3">
        {[
          "Xem các dự án ESG trên 85",
          "Kiểm tra danh sách yêu thích",
          "Theo dõi vòng gọi vốn mới",
          "Liên hệ doanh nghiệp tiềm năng",
        ].map((item) => (
          <button
            key={item}
            type="button"
            className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-left transition hover:border-green-400/30 hover:bg-slate-900"
          >
            <span>{item}</span>
            <ArrowUpRight className="h-4 w-4 text-white/45" />
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
        <div className="flex items-center gap-2 text-sm text-white/55">
          <Clock3 className="h-4 w-4" />
          Theo dõi gần nhất
        </div>
        <p className="mt-2 text-sm text-white/75">
          Bạn vừa thêm 2 dự án mới vào danh sách yêu thích trong hôm nay.
        </p>
      </div>
    </Card>
  );
}

function OpportunitiesCard({ opportunities = [] }) {
  return (
    <Card className="p-6">
      <SectionTitle
        eyebrow="Cơ hội nổi bật"
        title="Dự án phù hợp với bạn"
        right={
          <button
            type="button"
            className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-green-400"
          >
            Khám phá thêm
          </button>
        }
      />

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {opportunities.map((item) => (
          <OpportunityCard key={item.id} {...item} />
        ))}
      </div>
    </Card>
  );
}

function ActivitiesCard({ activities = [] }) {
  return (
    <Card className="p-6">
      <SectionTitle eyebrow="Hoạt động gần đây" title="Lịch sử đầu tư" />

      <div className="mt-6 space-y-4">
        {activities.map((item) => (
          <ActivityItem key={item.id} {...item} />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-green-500/10 to-cyan-500/10 p-5">
        <div className="flex items-center gap-2 text-green-300">
          <Star className="h-4 w-4" />
          Gợi ý hôm nay
        </div>
        <p className="mt-2 text-sm leading-6 text-white/75">
          Các dự án năng lượng tái tạo có ESG cao đang có tỷ lệ quan tâm tăng nhanh.
        </p>
      </div>
    </Card>
  );
}

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/investor/overview")
      .then((res) => setData(res.data))
      .catch(() => {
        setData({
          stats: {
            favorites: 12,
            interests: 5,
            opportunities: 18,
            totalViews: 67,
          },
          summary: [
            { id: 1, label: "Dự án ESG cao", value: 9 },
            { id: 2, label: "Vòng gọi vốn mở", value: 6 },
            { id: 3, label: "Tin nhắn mới", value: 4 },
          ],
          opportunities: [
            {
              id: 1,
              title: "Solar Rooftop Bình Dương",
              category: "Năng lượng tái tạo",
              esg: 91,
              capital: "15 tỷ",
            },
            {
              id: 2,
              title: "Trang trại hữu cơ Đà Lạt",
              category: "Nông nghiệp xanh",
              esg: 87,
              capital: "9 tỷ",
            },
            {
              id: 3,
              title: "Nhà máy tái chế rác thải",
              category: "Kinh tế tuần hoàn",
              esg: 89,
              capital: "20 tỷ",
            },
            {
              id: 4,
              title: "Xe điện logistics",
              category: "Giao thông xanh",
              esg: 85,
              capital: "14 tỷ",
            },
          ],
          activities: [
            {
              id: 1,
              content: "Bạn đã thêm Solar Rooftop Bình Dương vào yêu thích.",
              time: "10 phút trước",
            },
            {
              id: 2,
              content: "Bạn đã gửi quan tâm đầu tư cho dự án Nhà máy tái chế.",
              time: "1 giờ trước",
            },
            {
              id: 3,
              content: "Có doanh nghiệp phản hồi tin nhắn của bạn.",
              time: "3 giờ trước",
            },
          ],
        });
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        Loading investor dashboard...
      </div>
    );
  }

  const stats = [
    {
      id: 1,
      title: "Dự án yêu thích",
      value: data.stats.favorites,
      change: "+3 hôm nay",
      icon: STAT_ICONS[0],
    },
    {
      id: 2,
      title: "Đã quan tâm đầu tư",
      value: data.stats.interests,
      change: "+1 tuần này",
      icon: STAT_ICONS[1],
    },
    {
      id: 3,
      title: "Cơ hội phù hợp",
      value: data.stats.opportunities,
      change: "ESG cao, vốn tốt",
      icon: STAT_ICONS[2],
    },
    {
      id: 4,
      title: "Lượt xem dự án",
      value: data.stats.totalViews,
      change: "+14 lượt",
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
              <PortfolioChartCard summary={data.summary} />
              <QuickInfoCard />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <OpportunitiesCard opportunities={data.opportunities} />
              <ActivitiesCard activities={data.activities} />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}