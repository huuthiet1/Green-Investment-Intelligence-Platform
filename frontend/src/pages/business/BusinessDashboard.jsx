import React, { memo } from "react";
import {
  ArrowUpRight,
  BadgeDollarSign,
  Clock3,
  Eye,
  FolderKanban,
  LineChart,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, SectionTitle } from "./BusinessLayout";
import useBusinessData from "./useBusinessData";

const CHART_BARS = [28, 40, 50, 63, 72, 80, 90];
const STAT_ICONS = [FolderKanban, Eye, Users, BadgeDollarSign];

const StatCard = memo(function StatCard({ title, value, change, icon: Icon }) {
  return (
    <Card className="p-5 shadow-xl shadow-black/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/55">{title}</p>
          <div className="mt-3 text-3xl font-bold">{value}</div>
          {change ? <p className="mt-2 text-sm text-green-400">{change}</p> : null}
        </div>
        <div className="rounded-2xl bg-green-500/10 p-3 text-green-400"><Icon className="h-5 w-5" /></div>
      </div>
    </Card>
  );
});

function ProjectRow({ name, status, views, investors, capital }) {
  return (
    <div className="grid grid-cols-5 items-center px-4 py-4 text-sm">
      <div className="col-span-2 min-w-0">
        <div className="truncate font-medium">{name}</div>
        <div className="truncate text-white/50">Dự án của doanh nghiệp</div>
      </div>
      <div>{views}</div>
      <div>{investors}</div>
      <div><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/75">{status} - {capital}</span></div>
    </div>
  );
}

function ActivityItem({ content, time }) {
  return (
    <div className="flex gap-4 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
      <div className="mt-1 h-3 w-3 rounded-full bg-green-400" />
      <div>
        <p className="text-sm leading-6 text-white/80">{content}</p>
        <p className="mt-1 text-xs text-white/45">{time}</p>
      </div>
    </div>
  );
}

function FundingChartCard({ summary = [] }) {
  return (
    <Card className="p-6">
      <SectionTitle eyebrow="Hiệu suất doanh nghiệp" title="Theo dõi gọi vốn & tương tác" right={<div className="flex items-center gap-2 rounded-full bg-green-500/10 px-3 py-2 text-sm text-green-400"><TrendingUp className="h-4 w-4" />Tăng trưởng tốt</div>} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {summary.map((item) => <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4"><div className="text-sm text-white/55">{item.label}</div><div className="mt-3 text-2xl font-bold">{item.value}</div></div>)}
      </div>
      <div className="mt-6 h-72 rounded-3xl border border-dashed border-green-400/20 bg-[linear-gradient(180deg,rgba(34,197,94,0.10),rgba(15,23,42,0.10))] p-6">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between"><div><p className="text-sm text-white/55">Biểu đồ mô phỏng</p><h4 className="text-lg font-semibold">Tiến độ gọi vốn</h4></div><LineChart className="h-6 w-6 text-green-400" /></div>
          <div className="flex h-40 items-end gap-3">{CHART_BARS.map((value, index) => <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-2xl bg-green-500/70" style={{ height: `${value}%` }} /><span className="text-xs text-white/45">T{index + 1}</span></div>)}</div>
        </div>
      </div>
    </Card>
  );
}

function QuickActionsCard() {
  const actions = [
    { label: "Tạo dự án mới", href: "/business/projects" },
    { label: "Cập nhật vòng gọi vốn", href: "/business/funding" },
    { label: "Tải lên tài liệu dự án", href: "/business/projects" },
    { label: "Xem nhà đầu tư quan tâm", href: "/business/investors" },
  ];
  return (
    <Card className="p-6">
      <SectionTitle eyebrow="Thao tác nhanh" title="Quản lý nhanh" />
      <div className="mt-5 space-y-3">{actions.map((item) => <a key={item.label} href={item.href} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-4 text-left transition hover:border-green-400/30 hover:bg-slate-900"><span>{item.label}</span><ArrowUpRight className="h-4 w-4 text-white/45" /></a>)}</div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4"><div className="flex items-center gap-2 text-sm text-white/55"><Clock3 className="h-4 w-4" />Cập nhật gần nhất</div><p className="mt-2 text-sm text-white/75">Dự án Solar Rooftop vừa nhận thêm 2 lượt quan tâm từ nhà đầu tư.</p></div>
    </Card>
  );
}

function ProjectsCard({ projects = [] }) {
  return (
    <Card className="p-6">
      <SectionTitle eyebrow="Dự án của bạn" title="Danh sách dự án đang theo dõi" right={<a href="/business/projects" className="rounded-2xl bg-green-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-green-400">Xem tất cả</a>} />
      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10">
        <div className="grid grid-cols-5 bg-slate-900/80 px-4 py-3 text-sm text-white/50"><div className="col-span-2">Tên dự án</div><div>Lượt xem</div><div>Nhà đầu tư</div><div>Trạng thái</div></div>
        <div className="divide-y divide-white/10">{projects.map((project) => <ProjectRow key={project.id} {...project} />)}</div>
      </div>
    </Card>
  );
}

function ActivitiesCard({ activities = [] }) {
  return (
    <Card className="p-6">
      <SectionTitle eyebrow="Hoạt động gần đây" title="Timeline doanh nghiệp" />
      <div className="mt-6 space-y-4">{activities.map((item) => <ActivityItem key={item.id} {...item} />)}</div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-green-500/10 to-cyan-500/10 p-5"><div className="flex items-center gap-2 text-green-300"><Star className="h-4 w-4" />Gợi ý hôm nay</div><p className="mt-2 text-sm leading-6 text-white/75">Hãy cập nhật thêm tài liệu pháp lý và ESG để tăng độ tin cậy khi kêu gọi vốn.</p></div>
    </Card>
  );
}

export default function BusinessDashboard() {
  const { data, loading } = useBusinessData();
  if (loading || !data) return <div className="flex h-96 items-center justify-center text-white">Loading business dashboard...</div>;

  const stats = [
    { id: 1, title: "Tổng dự án", value: data.stats.totalProjects, change: "+1 tháng này", icon: STAT_ICONS[0] },
    { id: 2, title: "Tổng lượt xem", value: data.stats.totalViews, change: "+18 tuần này", icon: STAT_ICONS[1] },
    { id: 3, title: "Nhà đầu tư quan tâm", value: data.stats.totalInvestors, change: "+4 mới", icon: STAT_ICONS[2] },
    { id: 4, title: "Tổng vốn kêu gọi", value: data.stats.totalCapital, change: "Đang tăng", icon: STAT_ICONS[3] },
  ];

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{stats.map((item) => <StatCard key={item.id} {...item} />)}</div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]"><FundingChartCard summary={data.summary} /><QuickActionsCard /></div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><ProjectsCard projects={data.projects} /><ActivitiesCard activities={data.activities} /></div>
    </>
  );
}
