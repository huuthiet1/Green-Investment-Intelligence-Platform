import React, { useEffect, useState } from "react";
import { Brain, FileText, Leaf, ShieldAlert } from "lucide-react";
import { Card, SectionTitle } from "./BusinessLayout";
import api from "../../lib/axios";

export default function BusinessAIToolsPage() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [result, setResult] = useState("");

  useEffect(() => {
    api.get("/ai-tools/projects").then((res) => {
      setProjects(res.data.projects || []);
    });
  }, []);

  const runTool = async (type) => {
    if (!projectId) {
      alert("Vui lòng chọn dự án");
      return;
    }

    setResult("AI đang phân tích...");

    try {
      if (type === "esg") {
        const res = await api.post(`/ai-tools/esg-score/${projectId}`);
        setResult(
          `AI ESG Score: ${res.data.score.total_score}/100\nXếp loại: ${res.data.score.esg_level}\n\n${res.data.score.evaluation_note}`
        );
      }

      if (type === "risk") {
        const res = await api.post(`/ai-tools/risk/${projectId}`);
        setResult(
          `Mức rủi ro: ${res.data.risk.level}\nĐiểm rủi ro: ${res.data.risk.score}\n\nLý do:\n- ${res.data.risk.reasons.join(
            "\n- "
          )}\n\nGợi ý:\n- ${res.data.advice.join("\n- ")}`
        );
      }

      if (type === "summary") {
        const res = await api.post(`/ai-tools/summary/${projectId}`);
        setResult(res.data.summary);
      }
    } catch (error) {
      setResult(error.response?.data?.message || "Lỗi AI");
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="AI Tools"
        title="Bộ công cụ AI cho doanh nghiệp"
        right={
          <div className="rounded-2xl bg-green-500/10 px-4 py-2 text-green-300">
            Smart AI
          </div>
        }
      />

      <Card className="p-6">
        <label className="text-sm text-white/60">Chọn dự án</label>
        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
        >
          <option value="">-- Chọn dự án --</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.title}
            </option>
          ))}
        </select>
      </Card>

      <div className="grid gap-5 md:grid-cols-3">
        <AIToolCard
          icon={Leaf}
          title="AI ESG Scoring"
          desc="Tự động chấm điểm ESG dựa trên dữ liệu dự án."
          onClick={() => runTool("esg")}
        />

        <AIToolCard
          icon={ShieldAlert}
          title="AI Risk Analysis"
          desc="Phân tích rủi ro tài chính, ESG và thông tin thiếu."
          onClick={() => runTool("risk")}
        />

        <AIToolCard
          icon={FileText}
          title="AI Pitch Summary"
          desc="Tạo đoạn giới thiệu dự án dành cho nhà đầu tư."
          onClick={() => runTool("summary")}
        />
      </div>

      <Card className="p-6">
        <div className="mb-3 flex items-center gap-2 text-green-300">
          <Brain className="h-5 w-5" />
          <h3 className="font-semibold">Kết quả AI</h3>
        </div>

        <pre className="whitespace-pre-wrap rounded-2xl bg-slate-900 p-5 text-sm leading-7 text-white/75">
          {result || "Chọn một công cụ AI để bắt đầu phân tích."}
        </pre>
      </Card>
    </div>
  );
}

function AIToolCard({ icon: Icon, title, desc, onClick }) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-300">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/55">{desc}</p>

      <button
        onClick={onClick}
        className="mt-5 w-full rounded-2xl bg-green-500 px-4 py-3 font-medium text-slate-950 hover:bg-green-400"
      >
        Chạy AI
      </button>
    </Card>
  );
}