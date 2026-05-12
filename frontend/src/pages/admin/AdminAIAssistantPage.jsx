import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Brain,
  CheckCircle2,
  FileWarning,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import { Card, SectionTitle } from "./AdminLayout";
import api from "../../lib/axios";

export default function AdminAIAssistantPage() {
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total_projects: 0,
    total_users: 0,
    pending_projects: 0,
    fraud_projects: 0,
    low_esg_projects: 0,
    reports: 0,
  });

  const [fraudProjects, setFraudProjects] = useState([]);
  const [lowESGProjects, setLowESGProjects] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  const fetchAIAnalysis = async () => {
    try {
      setLoading(true);

      const [
        projectsRes,
        usersRes,
        reportsRes,
        esgRes,
      ] = await Promise.all([
        api.get("/projects"),
        api.get("/admin/users"),
        api.get("/reports"),
        api.get("/esg"),
      ]);

      const projects = projectsRes.data.projects || [];
      const users = usersRes.data.users || [];
      const reports = reportsRes.data.reports || [];
      const esgScores = esgRes.data.scores || [];

      const pendingProjects = projects.filter(
        (p) => p.status === "pending"
      );

      const fraudRisk = projects.filter(
        (p) =>
          p.ai_risk_level === "high" ||
          Number(p.ai_risk_score || 0) >= 70
      );

      const lowESG = esgScores
        .filter((e) => Number(e.total_score || 0) < 60)
        .sort((a, b) => a.total_score - b.total_score);

      setStats({
        total_projects: projects.length,
        total_users: users.length,
        pending_projects: pendingProjects.length,
        fraud_projects: fraudRisk.length,
        low_esg_projects: lowESG.length,
        reports: reports.length,
      });

      setFraudProjects(fraudRisk.slice(0, 5));
      setLowESGProjects(lowESG.slice(0, 5));

      const aiRecommendations = [];

      if (fraudRisk.length > 0) {
        aiRecommendations.push({
          type: "danger",
          title: "Dự án rủi ro cao",
          content: `${fraudRisk.length} dự án có dấu hiệu fraud hoặc AI risk cao.`,
        });
      }

      if (lowESG.length > 0) {
        aiRecommendations.push({
          type: "warning",
          title: "ESG thấp",
          content: `${lowESG.length} dự án có ESG dưới mức an toàn.`,
        });
      }

      if (pendingProjects.length > 5) {
        aiRecommendations.push({
          type: "info",
          title: "Pending nhiều",
          content:
            "Hệ thống đang có nhiều dự án chờ duyệt.",
        });
      }

      if (reports.length > 10) {
        aiRecommendations.push({
          type: "danger",
          title: "Báo cáo tăng cao",
          content:
            "Số lượng báo cáo vi phạm đang tăng bất thường.",
        });
      }

      if (aiRecommendations.length === 0) {
        aiRecommendations.push({
          type: "success",
          title: "Hệ thống ổn định",
          content:
            "Không phát hiện bất thường lớn trong hệ thống.",
        });
      }

      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error("FETCH ADMIN AI ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIAnalysis();
  }, []);

  const systemHealth = useMemo(() => {
    let score = 100;

    score -= stats.fraud_projects * 5;
    score -= stats.low_esg_projects * 2;
    score -= stats.pending_projects;

    return Math.max(score, 0);
  }, [stats]);

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        AI đang phân tích hệ thống...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Artificial Intelligence"
        title="AI System Analysis"
        right={
          <button
            onClick={fetchAIAnalysis}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Phân tích lại
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <AIStatCard
          icon={BarChart3}
          title="Tổng dự án"
          value={stats.total_projects}
        />

        <AIStatCard
          icon={Users}
          title="Người dùng"
          value={stats.total_users}
        />

        <AIStatCard
          icon={ShieldAlert}
          title="Fraud Risk"
          value={stats.fraud_projects}
          danger
        />

        <AIStatCard
          icon={FileWarning}
          title="Reports"
          value={stats.reports}
          warning
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-green-500/10 p-4 text-green-300">
              <Brain className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                AI System Health
              </h3>

              <p className="text-sm text-white/45">
                Đánh giá tổng quan nền tảng
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border-[16px] border-green-500/20">
              <div className="text-center">
                <h2 className="text-6xl font-black text-green-400">
                  {systemHealth}
                </h2>

                <p className="mt-2 text-white/45">
                  Health Score
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <MiniBox
              label="Fraud"
              value={stats.fraud_projects}
              color="text-red-300"
            />

            <MiniBox
              label="Low ESG"
              value={stats.low_esg_projects}
              color="text-yellow-300"
            />

            <MiniBox
              label="Pending"
              value={stats.pending_projects}
              color="text-cyan-300"
            />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-500/10 p-4 text-red-300">
              <Sparkles className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                AI Recommendations
              </h3>

              <p className="text-sm text-white/45">
                Khuyến nghị từ AI
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {recommendations.map((item, index) => (
              <RecommendationCard
                key={index}
                recommendation={item}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-red-500/10 p-4 text-red-300">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                Fraud Risk Projects
              </h3>

              <p className="text-sm text-white/45">
                Dự án có rủi ro cao
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {fraudProjects.length === 0 ? (
              <EmptyState text="Không có dự án fraud cao" />
            ) : (
              fraudProjects.map((project) => (
                <ProjectRiskCard
                  key={project._id}
                  title={project.title}
                  score={project.ai_risk_score || 0}
                  status={project.status}
                  type="fraud"
                />
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-yellow-500/10 p-4 text-yellow-300">
              <TrendingUp className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">
                ESG Risk Projects
              </h3>

              <p className="text-sm text-white/45">
                Dự án ESG thấp
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {lowESGProjects.length === 0 ? (
              <EmptyState text="Không có dự án ESG thấp" />
            ) : (
              lowESGProjects.map((item) => (
                <ProjectRiskCard
                  key={item._id}
                  title={
                    item.project_id?.title || "Không rõ"
                  }
                  score={item.total_score || 0}
                  status={item.rating || "normal"}
                  type="esg"
                />
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AIStatCard({
  icon: Icon,
  title,
  value,
  danger,
  warning,
}) {
  return (
    <Card className="p-5">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
          danger
            ? "bg-red-500/10 text-red-300"
            : warning
            ? "bg-yellow-500/10 text-yellow-300"
            : "bg-green-500/10 text-green-300"
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>

      <p className="mt-5 text-sm text-white/45">{title}</p>

      <h3 className="mt-2 text-4xl font-black text-white">
        {value}
      </h3>
    </Card>
  );
}

function RecommendationCard({ recommendation }) {
  const config = {
    danger: {
      bg: "bg-red-500/10",
      border: "border-red-400/20",
      text: "text-red-300",
    },

    warning: {
      bg: "bg-yellow-500/10",
      border: "border-yellow-400/20",
      text: "text-yellow-300",
    },

    success: {
      bg: "bg-green-500/10",
      border: "border-green-400/20",
      text: "text-green-300",
    },

    info: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-400/20",
      text: "text-cyan-300",
    },
  };

  const style = config[recommendation.type];

  return (
    <div
      className={`rounded-2xl border p-5 ${style.bg} ${style.border}`}
    >
      <div className="flex items-start gap-3">
        <div className={style.text}>
          {recommendation.type === "success" ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>

        <div>
          <h4 className={`font-semibold ${style.text}`}>
            {recommendation.title}
          </h4>

          <p className="mt-2 text-sm leading-6 text-white/70">
            {recommendation.content}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProjectRiskCard({
  title,
  score,
  status,
  type,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-white">
            {title}
          </h4>

          <p className="mt-1 text-sm text-white/45">
            Status: {status}
          </p>
        </div>

        <div
          className={`rounded-2xl px-4 py-2 text-lg font-bold ${
            type === "fraud"
              ? "bg-red-500/10 text-red-300"
              : "bg-yellow-500/10 text-yellow-300"
          }`}
        >
          {score}
        </div>
      </div>
    </div>
  );
}

function MiniBox({ label, value, color }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-5 text-center">
      <p className="text-sm text-white/45">{label}</p>

      <h3 className={`mt-2 text-3xl font-black ${color}`}>
        {value}
      </h3>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-white/45">
      {text}
    </div>
  );
}