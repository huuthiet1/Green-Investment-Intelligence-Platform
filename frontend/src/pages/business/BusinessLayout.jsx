import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  Activity,
  FolderKanban,
  Leaf,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  User,
  Users,
  Wallet,
} from "lucide-react";

import {
  Bot,
  BarChart3,
  MessageCircle,
  Brain,
  Sparkles,
  HandCoins,
  X,
} from "lucide-react";

import NotificationDropdown from "../../components/NotificationDropdown";

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function Card({ className = "", children }) {
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

export function SectionTitle({ eyebrow, title, right }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-sm text-white/55">
            {eyebrow}
          </p>
        )}

        <h3 className="mt-1 text-lg sm:text-xl font-semibold">
          {title}
        </h3>
      </div>

      {right}
    </div>
  );
}

const sidebarItems = [
  { label: "Tổng quan", icon: Activity, to: "/business" },
  { label: "Dự án của tôi", icon: FolderKanban, to: "/business/projects" },
  { label: "Gọi vốn", icon: Wallet, to: "/business/funding" },
  { label: "Nhà đầu tư", icon: Users, to: "/business/investors" },
  { label: "ESG", icon: Leaf, to: "/business/esg" },
  { label: "Báo cáo", icon: ShieldCheck, to: "/business/reports" },
  { label: "Tài liệu", icon: FolderKanban, to: "/business/documents" },
  { label: "Tin nhắn", icon: MessageCircle, to: "/business/chat" },
  {
    label: "Yêu cầu góp vốn",
    icon: HandCoins,
    to: "/business/investment-requests",
  },
  { label: "Phân tích", icon: BarChart3, to: "/business/analytics" },
  {
    label: "Xem điểm tín dụng xanh",
    icon: ShieldCheck,
    to: "/business/green-credit-score",
  },
  {
    label: "AI Tools",
    icon: Sparkles,
    to: "/business/ai-tools",
  },
  {
    label: "Phù hợp nhà đầu tư",
    icon: Brain,
    to: "/business/investor-matching",
  },
];

function Sidebar({
  onLogout,
  sidebarOpen,
  setSidebarOpen,
}) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen
          w-72
          overflow-y-auto
          border-r border-white/10
          bg-slate-950/95
          p-6
          backdrop-blur
          transition-transform duration-300

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:static
          lg:translate-x-0
          lg:block
        `}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <h3 className="font-semibold">
            Menu
          </h3>

          <button
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15 ring-1 ring-green-400/30">
            <Leaf className="h-6 w-6 text-green-400" />
          </div>

          <div>
            <p className="text-sm text-white/55">
              Green Investment
            </p>

            <h1 className="font-semibold">
              Business Dashboard
            </h1>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {sidebarItems.map(
            ({ label, icon: Icon, to }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/business"}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 transition",

                    isActive
                      ? "bg-green-500 text-slate-950"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )
                }
              >
                <Icon className="h-5 w-5" />

                <span>{label}</span>
              </NavLink>
            )
          )}
        </nav>

        <button
          onClick={onLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </aside>
    </>
  );
}

function Header({
  userName,
  organizationName,
  onLogout,
  setSidebarOpen,
}) {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div>
            <p className="text-sm text-white/55">
              Xin chào trở lại
            </p>

            <h2 className="text-lg font-bold sm:text-xl lg:text-2xl">
              Bảng điều khiển doanh nghiệp
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden md:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/60">
            <Search className="h-4 w-4" />

            <span className="text-sm">
              Tìm dự án, nhà đầu tư...
            </span>
          </div>

          <NotificationDropdown />

          <div className="hidden sm:flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <User className="h-4 w-4" />
            </div>

            <div>
              <div className="text-sm font-medium">
                {organizationName ||
                  userName ||
                  "Business"}
              </div>

              <div className="text-xs text-white/55">
                Chủ dự án
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:block">
              Đăng xuất
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default function BusinessLayout() {
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar
          onLogout={handleLogout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        <main className="min-w-0 flex-1">
          <Header
            userName={user?.full_name}
            organizationName={
              user?.organization_name
            }
            onLogout={handleLogout}
            setSidebarOpen={setSidebarOpen}
          />

          <section className="px-3 py-4 sm:px-4 lg:px-8">
            <Outlet />
          </section>
        </main>
      </div>
    </div>
  );
}