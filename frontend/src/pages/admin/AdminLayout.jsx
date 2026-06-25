import React, { useState } from "react";
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Shield,
  Users,
  FileWarning,
  Gavel,
  Settings,
  Calculator,
  ShieldAlert,
  FileClock,
  Bot,
  Menu,
  X,
} from "lucide-react";

import { NavLink, Outlet, useNavigate } from "react-router-dom";
import AdminNotificationDropdown from "../../components/AdminNotificationDropdown";

const navItems = [
  { label: "Tổng quan", icon: LayoutDashboard, to: "/admin" },
  { label: "Dự án", icon: FolderKanban, to: "/admin/projects" },
  { label: "Điều hành", icon: Gavel, to: "/admin/moderation" },
  { label: "Người dùng", icon: Users, to: "/admin/users" },
  { label: "Duyệt dự án", icon: Gavel, to: "/admin/approval-workflow" },
  {
    label: "Khả thi tài chính",
    icon: Calculator,
    to: "/admin/financial-feasibility",
  },
  {
    label: "Cài đặt hệ thống",
    icon: Settings,
    to: "/admin/system-settings",
  },
  { label: "Báo cáo", icon: FileWarning, to: "/admin/reports" },
  { label: "Phân tích", icon: BarChart3, to: "/admin/analytics" },
  {
    label: "Phát hiện gian lận",
    icon: ShieldAlert,
    to: "/admin/fraud-detection",
  },
  {
    label: "Nhật ký kiểm duyệt",
    icon: FileClock,
    to: "/admin/audit-logs",
  },
  {
    label: "Trợ lý AI",
    icon: Bot,
    to: "/admin/ai-assistant",
  },
];

export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-[#101827] ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  right,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-white/45">
          {eyebrow}
        </p>

        <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
          {title}
        </h2>
      </div>

      {right}
    </div>
  );
}

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  logout,
}) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          h-screen
          w-[280px]
          overflow-y-auto
          border-r border-white/10
          bg-[#050B18]
          p-5
          transition-transform duration-300

          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <h3 className="font-semibold">
            Menu
          </h3>

          <button
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
            <Shield className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm text-white/50">
              Green Investment
            </p>

            <h1 className="font-bold">
              Admin Dashboard
            </h1>
          </div>
        </div>

        <nav className="mt-10 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                onClick={() =>
                  setSidebarOpen(false)
                }
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    isActive
                      ? "bg-green-500 text-slate-950"
                      : "text-white/75 hover:bg-white/5"
                  }`
                }
              >
                <Icon className="h-5 w-5" />

                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-red-300 transition hover:bg-red-500/20"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </aside>
    </>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#020617] text-white">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        logout={logout}
      />

      <main className="min-h-screen flex-1 lg:ml-[280px]">
        <header className="border-b border-white/10 bg-[#050B18] px-4 py-4 lg:px-8 lg:py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-xl border border-white/10 p-2 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div>
                <p className="text-sm text-white/45">
                  Xin chào Admin
                </p>

                <h2 className="text-xl font-bold lg:text-3xl">
                  Bảng điều khiển quản trị
                </h2>
              </div>
            </div>

            <AdminNotificationDropdown />
          </div>
        </header>

        <section className="p-3 sm:p-4 lg:p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
}