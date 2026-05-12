import React from "react";
import {
  Bot,
  FolderHeart,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Search,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "Tổng quan",
    icon: LayoutDashboard,
    to: "/investor",
  },
  {
    label: "Khám phá dự án",
    icon: Search,
    to: "/investor/projects",
  },
  {
    label: "Cơ hội đầu tư",
    icon: TrendingUp,
    to: "/investor/interests",
  },
  // {
  //   label: "Yêu thích",
  //   icon: FolderHeart,
  //   to: "/investor/favorites",
  // },
  {
    label: "Góp vốn",
    icon: Wallet,
    to: "/investor/funding",
  },
  {
    label: "Tin nhắn",
    icon: MessageCircle,
    to: "/investor/chat",
  },
  {
    label: "AI tư vấn",
    icon: Bot,
    to: "/investor/ai",
  },
];

export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-[#101827] text-white ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ eyebrow, title, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm text-white/45">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{title}</h2>
      </div>

      {right}
    </div>
  );
}

export default function InvestorLayout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <aside className="fixed left-0 top-0 h-screen w-[280px] border-r border-white/10 bg-[#050B18] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
            <TrendingUp className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm text-white/50">Green Investment</p>
            <h1 className="font-bold">Investor Portal</h1>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/investor"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? "bg-green-500 text-slate-950"
                      : "text-white/75 hover:bg-white/5"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="absolute bottom-6 left-5 right-5 flex items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-red-300 hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </aside>

      <main className="ml-[280px] min-h-screen flex-1">
        <header className="flex items-center justify-between border-b border-white/10 bg-[#050B18] px-8 py-6">
          <div>
            <p className="text-sm text-white/45">Xin chào Nhà đầu tư</p>
            <h2 className="text-3xl font-bold">Investor Dashboard</h2>
          </div>

          <div className="rounded-2xl bg-green-500/10 px-4 py-2 text-sm text-green-300">
            Investor Mode
          </div>
        </header>

        <section className="p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
}