import React, { useState } from "react";
import {
  Bot,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Search,
  TrendingUp,
  Wallet,
  Menu,
  X,
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

export function Card({
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-[#101827] text-white ${className}`}
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
            <TrendingUp className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm text-white/50">
              Green Investment
            </p>

            <h1 className="font-bold">
              Investor Portal
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
                end={item.to === "/investor"}
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

export default function InvestorLayout() {
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
                  Xin chào Nhà đầu tư
                </p>

                <h2 className="text-xl font-bold lg:text-3xl">
                  Investor Dashboard
                </h2>
              </div>
            </div>

            <div className="hidden sm:block rounded-2xl bg-green-500/10 px-4 py-2 text-sm text-green-300">
              Investor Mode
            </div>
          </div>
        </header>

        <section className="p-3 sm:p-4 lg:p-8">
          <Outlet />
        </section>
      </main>
    </div>
  );
}