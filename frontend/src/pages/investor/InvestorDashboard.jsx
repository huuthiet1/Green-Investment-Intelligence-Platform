import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  FolderHeart,
  Leaf,
  MessageCircle,
  RefreshCcw,
  Search,
  TrendingUp,
  Wallet,
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
import { useNavigate } from "react-router-dom";
import { Card, SectionTitle } from "./InvestorLayout";
import api from "../../lib/axios";

export default function InvestorDashboard() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [fundingRounds, setFundingRounds] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [interests, setInterests] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const [
        projectRes,
        fundingRes,
        favoriteRes,
        interestRes,
        investmentRes,
      ] = await Promise.allSettled([
        api.get("/projects"),
        api.get("/funding"),
        api.get("/investors/favorites"),
        api.get("/investors/interests"),
        api.get("/investments"),
      ]);

      if (projectRes.status === "fulfilled") {
        setProjects(projectRes.value.data.projects || []);
      }

      if (fundingRes.status === "fulfilled") {
        setFundingRounds(fundingRes.value.data.rounds || []);
      }

      if (favoriteRes.status === "fulfilled") {
        setFavorites(favoriteRes.value.data.favorites || []);
      }

      if (interestRes.status === "fulfilled") {
        setInterests(interestRes.value.data.interests || []);
      }

      if (investmentRes.status === "fulfilled") {
        setInvestments(investmentRes.value.data.investments || []);
      }
    } catch (error) {
      console.error("INVESTOR DASHBOARD ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const approvedProjects = useMemo(() => {
    return projects.filter((p) => (p.status || "approved") === "approved");
  }, [projects]);

  const totalCapitalNeeded = useMemo(() => {
    return approvedProjects.reduce(
      (sum, p) => sum + Number(p.capital_needed || 0),
      0
    );
  }, [approvedProjects]);

  const totalInvestmentOffer = useMemo(() => {
    return investments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [investments]);

  const avgESG = useMemo(() => {
    if (!approvedProjects.length) return 0;

    return Math.round(
      approvedProjects.reduce((sum, p) => sum + Number(p.esg_score || 0), 0) /
        approvedProjects.length
    );
  }, [approvedProjects]);

  const highEsgProjects = useMemo(() => {
    return approvedProjects
      .filter((p) => Number(p.esg_score || 0) >= 70)
      .sort((a, b) => Number(b.esg_score || 0) - Number(a.esg_score || 0))
      .slice(0, 5);
  }, [approvedProjects]);

  const capitalChart = useMemo(() => {
    return approvedProjects.slice(0, 6).map((p) => ({
      name: shorten(p.title || p.name || "Dự án"),
      capital: Number(p.capital_needed || 0),
      esg: Number(p.esg_score || 0),
    }));
  }, [approvedProjects]);

  const categoryChart = useMemo(() => {
    const map = {};

    approvedProjects.forEach((p) => {
      const category = p.category_name || "Khác";
      map[category] = (map[category] || 0) + 1;
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [approvedProjects]);

  const recentFundingRounds = useMemo(() => {
    return fundingRounds.slice(0, 5);
  }, [fundingRounds]);

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải dashboard nhà đầu tư...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Investor"
        title="Tổng quan đầu tư"
        right={
          <button
            onClick={fetchDashboard}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BriefcaseBusiness}
          label="Dự án khả dụng"
          value={approvedProjects.length}
          sub="Dự án đã được duyệt"
        />

        <StatCard
          icon={Wallet}
          label="Tổng vốn gọi"
          value={formatMoney(totalCapitalNeeded)}
          sub="Nhu cầu vốn toàn hệ thống"
        />

        <StatCard
          icon={Leaf}
          label="ESG trung bình"
          value={avgESG}
          sub="Điểm ESG dự án"
        />

        <StatCard
          icon={FolderHeart}
          label="Yêu thích"
          value={favorites.length}
          sub="Dự án đã lưu"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <QuickAction
          icon={Search}
          title="Khám phá dự án"
          desc="Tìm dự án đã duyệt theo ESG, ROI, vốn gọi."
          onClick={() => navigate("/investor/projects")}
        />

        <QuickAction
          icon={TrendingUp}
          title="Cơ hội đầu tư"
          desc="Xem các dự án bạn đã gửi quan tâm."
          onClick={() => navigate("/investor/opportunities")}
        />

        <QuickAction
          icon={MessageCircle}
          title="Chat doanh nghiệp"
          desc="Trao đổi trực tiếp với chủ dự án."
          onClick={() => navigate("/investor/chat")}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="p-6 xl:col-span-2">
          <div className="mb-5 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold text-white">
              Vốn gọi theo dự án
            </h3>
          </div>

          <div className="h-80 min-h-[320px]">
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
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold text-white">
              Danh mục dự án
            </h3>
          </div>

          <div className="h-80 min-h-[320px]">
            {categoryChart.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChart}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={105}
                    label
                  >
                    {categoryChart.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={
                          [
                            "#22c55e",
                            "#38bdf8",
                            "#f97316",
                            "#a855f7",
                            "#eab308",
                          ][index % 5]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyText text="Chưa có dữ liệu danh mục" />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <Leaf className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold text-white">
              Top dự án ESG cao
            </h3>
          </div>

          <div className="space-y-3">
            {highEsgProjects.length ? (
              highEsgProjects.map((project) => (
                <ProjectRow
                  key={project._id || project.id}
                  project={project}
                  onClick={() =>
                    navigate(`/investor/projects/${project._id || project.id}`)
                  }
                />
              ))
            ) : (
              <EmptyText text="Chưa có dự án ESG cao" />
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <Wallet className="h-5 w-5 text-green-400" />
            <h3 className="text-xl font-semibold text-white">
              Vòng gọi vốn mới
            </h3>
          </div>

          <div className="space-y-3">
            {recentFundingRounds.length ? (
              recentFundingRounds.map((round) => (
                <FundingRow key={round._id} round={round} />
              ))
            ) : (
              <EmptyText text="Chưa có vòng gọi vốn" />
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <InfoBox
          title="Đã quan tâm"
          value={interests.length}
          desc="Số dự án bạn đã gửi quan tâm đầu tư."
        />

        <InfoBox
          title="Đề nghị góp vốn"
          value={investments.length}
          desc="Số đề nghị góp vốn đã gửi."
        />

        <InfoBox
          title="Tổng đề nghị"
          value={formatMoney(totalInvestmentOffer)}
          desc="Tổng số tiền bạn đã đề nghị góp vốn."
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-white/50">{label}</p>
          <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
          <p className="mt-2 text-sm text-white/40">{sub}</p>
        </div>

        <div className="rounded-2xl bg-green-500/10 p-3 text-green-400">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}

function QuickAction({ icon: Icon, title, desc, onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-[#101827] p-6 text-left transition hover:border-green-400/30 hover:bg-white/5"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/50">{desc}</p>
    </button>
  );
}

function ProjectRow({ project, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl bg-slate-900/70 p-4 text-left hover:bg-white/5"
    >
      <div>
        <p className="font-semibold text-white">
          {project.title || project.name || "Dự án không tên"}
        </p>

        <p className="mt-1 text-sm text-white/45">
          {project.category_name || "Chưa có danh mục"}
        </p>
      </div>

      <div className="rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-300">
        ESG {project.esg_score || 0}
      </div>
    </button>
  );
}

function FundingRow({ round }) {
  const target = Number(round.target_amount || 0);
  const raised = Number(round.raised_amount || 0);
  const percent = target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;

  return (
    <div className="rounded-2xl bg-slate-900/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">
            {round.round_name || "Vòng gọi vốn"}
          </p>

          <p className="mt-1 text-sm text-white/45">
            {round.project_id?.title || "Dự án"}
          </p>
        </div>

        <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300">
          {round.status || "open"}
        </span>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-green-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-white/45">
        {formatMoney(raised)} / {formatMoney(target)} • {percent}%
      </p>
    </div>
  );
}

function InfoBox({ title, value, desc }) {
  return (
    <Card className="p-6">
      <p className="text-sm text-white/50">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
      <p className="mt-2 text-sm leading-6 text-white/45">{desc}</p>
    </Card>
  );
}

function EmptyText({ text }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center rounded-2xl bg-slate-900/60 p-6 text-center text-white/45">
      {text}
    </div>
  );
}

function formatMoney(value) {
  const number = Number(value || 0);

  if (number >= 1_000_000_000) {
    return `${(number / 1_000_000_000).toFixed(1)} tỷ`;
  }

  if (number >= 1_000_000) {
    return `${(number / 1_000_000).toFixed(1)} triệu`;
  }

  return `${number.toLocaleString("vi-VN")}đ`;
}

function shorten(text) {
  if (!text) return "Dự án";
  return text.length > 14 ? `${text.slice(0, 14)}...` : text;
}