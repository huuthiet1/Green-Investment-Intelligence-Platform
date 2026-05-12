import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle2,
  Leaf,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, SectionTitle } from "./InvestorLayout";
import api from "../../lib/axios";

export default function InvestorAIPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] =
    useState(null);

  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");

      setProjects(
        (res.data.projects || []).filter(
          (p) => p.status === "approved"
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const analyzeProject = async () => {
    if (!selectedProject) return;

    try {
      setLoading(true);

      const res = await api.post(
        "/investor-ai/analyze",
        {
          project_id: selectedProject,
        }
      );

      setAnalysis(res.data.analysis);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "AI phân tích thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Artificial Intelligence"
        title="AI Tư vấn đầu tư"
        right={
          <button
            onClick={analyzeProject}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950"
          >
            <RefreshCcw className="h-4 w-4" />
            Phân tích
          </button>
        }
      />

      <Card className="p-6">
        <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
          <select
            value={selectedProject || ""}
            onChange={(e) =>
              setSelectedProject(e.target.value)
            }
            className="rounded-2xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none"
          >
            <option value="">
              Chọn dự án để AI phân tích
            </option>

            {projects.map((project) => (
              <option
                key={project._id}
                value={project._id}
              >
                {project.title}
              </option>
            ))}
          </select>

          <button
            onClick={analyzeProject}
            disabled={loading}
            className="rounded-2xl bg-green-500 px-5 py-4 font-semibold text-slate-950 hover:bg-green-400"
          >
            {loading
              ? "Đang phân tích..."
              : "AI Analyze"}
          </button>
        </div>
      </Card>

      {!analysis ? (
        <Card className="p-16 text-center">
          <Bot className="mx-auto h-16 w-16 text-green-400" />

          <h3 className="mt-6 text-2xl font-bold text-white">
            AI Investment Advisor
          </h3>

          <p className="mt-3 text-white/55">
            AI sẽ phân tích ESG, ROI, Risk và
            đưa ra khuyến nghị đầu tư.
          </p>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              icon={Leaf}
              label="ESG"
              value={analysis.metrics.esg_score}
              color="green"
            />

            <MetricCard
              icon={ShieldAlert}
              label="Risk"
              value={analysis.metrics.risk_score}
              color="red"
            />

            <MetricCard
              icon={TrendingUp}
              label="ROI"
              value={`${analysis.metrics.roi}%`}
              color="blue"
            />

            <MetricCard
              icon={Brain}
              label="AI Score"
              value={analysis.metrics.investment_score}
              color="yellow"
            />
          </div>

          <Card className="p-8">
            <div className="flex items-center gap-4">
              <div className="rounded-3xl bg-green-500/10 p-5 text-green-300">
                <Sparkles className="h-10 w-10" />
              </div>

              <div>
                <p className="text-sm text-white/45">
                  AI Recommendation
                </p>

                <h2 className="mt-1 text-4xl font-black text-white">
                  {translateRecommendation(
                    analysis.recommendation
                  )}
                </h2>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-300" />

                <h3 className="text-2xl font-bold text-white">
                  Điểm mạnh
                </h3>
              </div>

              <div className="mt-6 space-y-4">
                {analysis.strengths.length === 0 ? (
                  <Empty text="Không có dữ liệu" />
                ) : (
                  analysis.strengths.map(
                    (item, index) => (
                      <InsightCard
                        key={index}
                        text={item}
                        type="success"
                      />
                    )
                  )
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-red-300" />

                <h3 className="text-2xl font-bold text-white">
                  Rủi ro
                </h3>
              </div>

              <div className="mt-6 space-y-4">
                {analysis.risks.length === 0 ? (
                  <Empty text="Không có rủi ro lớn" />
                ) : (
                  analysis.risks.map(
                    (item, index) => (
                      <InsightCard
                        key={index}
                        text={item}
                        type="danger"
                      />
                    )
                  )
                )}
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-green-300" />

              <h3 className="text-2xl font-bold text-white">
                AI Insights
              </h3>
            </div>

            <div className="mt-6 space-y-4">
              {analysis.ai_insights.map(
                (item, index) => (
                  <InsightCard
                    key={index}
                    text={item}
                    type="info"
                  />
                )
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}) {
  const styles = {
    green:
      "bg-green-500/10 text-green-300",
    red:
      "bg-red-500/10 text-red-300",
    blue:
      "bg-blue-500/10 text-blue-300",
    yellow:
      "bg-yellow-500/10 text-yellow-300",
  };

  return (
    <Card className="p-6">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl ${styles[color]}`}
      >
        <Icon className="h-6 w-6" />
      </div>

      <p className="mt-4 text-sm text-white/45">
        {label}
      </p>

      <h3 className="mt-2 text-4xl font-black text-white">
        {value}
      </h3>
    </Card>
  );
}

function InsightCard({ text, type }) {
  const styles = {
    success:
      "border-green-400/20 bg-green-500/10 text-green-200",
    danger:
      "border-red-400/20 bg-red-500/10 text-red-200",
    info:
      "border-cyan-400/20 bg-cyan-500/10 text-cyan-200",
  };

  return (
    <div
      className={`rounded-2xl border p-5 leading-7 ${styles[type]}`}
    >
      {text}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="rounded-2xl bg-slate-900/60 p-6 text-center text-white/45">
      {text}
    </div>
  );
}

function translateRecommendation(type) {
  const map = {
    strong_buy: "Strong Buy",
    buy: "Buy",
    watch: "Watch",
    avoid: "Avoid",
  };

  return map[type] || type;
}