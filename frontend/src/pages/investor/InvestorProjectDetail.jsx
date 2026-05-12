import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Heart,
  Leaf,
  MessageCircle,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Card } from "./InvestorLayout";
import api from "../../lib/axios";

export default function InvestorProjectDetail() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    try {
      setLoading(true);

      const [projectRes, fundingRes] = await Promise.allSettled([
        api.get(`/projects/${id}`),
        api.get("/funding"),
      ]);

      if (projectRes.status === "fulfilled") {
        setProject(projectRes.value.data.project || projectRes.value.data);
      }

      if (fundingRes.status === "fulfilled") {
        const allRounds = fundingRes.value.data.rounds || [];
        setRounds(
          allRounds.filter((r) => {
            const projectId = r.project_id?._id || r.project_id;
            return String(projectId) === String(id);
          })
        );
      }
    } catch (error) {
      console.error("INVESTOR PROJECT DETAIL ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const sendInterest = async () => {
    try {
      await api.post("/investors/interests", {
        project_id: id,
        message: "Tôi quan tâm đến dự án này.",
        estimated_budget: 0,
      });

      alert("Đã gửi quan tâm đầu tư");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi gửi quan tâm");
    }
  };

  const addFavorite = async () => {
    try {
      await api.post("/investors/favorites", {
        project_id: id,
      });

      alert("Đã lưu dự án yêu thích");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi lưu yêu thích");
    }
  };

  const startChat = async () => {
    try {
      await api.post("/chat/conversations", {
        project_id: id,
        sender_id: "investor-demo",
        receiver_id: "business-demo",
        title: project?.title || "Trao đổi dự án",
      });

      alert("Đã tạo cuộc trò chuyện. Vào mục Tin nhắn để trao đổi.");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi tạo chat");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải chi tiết dự án...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="py-20 text-center text-red-300">
        Không tìm thấy dự án
      </div>
    );
  }

  const image = project.thumbnail_url
    ? `http://localhost:5001${project.thumbnail_url}`
    : "https://placehold.co/1200x600?text=Green+Project";

  return (
    <div className="space-y-6">
      <Link
        to="/investor/projects"
        className="inline-flex items-center gap-2 text-green-400"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại danh sách dự án
      </Link>

      <Card className="overflow-hidden">
        <img
          src={image}
          alt={project.title}
          className="h-[420px] w-full object-cover"
        />

        <div className="p-8">
          <div className="mb-4 flex flex-wrap gap-3">
            <Badge>{project.category_name || "Green Project"}</Badge>
            <Badge>{project.status || "approved"}</Badge>
            <Badge>{translateRisk(project.risk_level || "medium")}</Badge>
          </div>

          <h1 className="text-4xl font-bold text-white">
            {project.title || "Dự án không tên"}
          </h1>

          <p className="mt-5 whitespace-pre-wrap text-lg leading-8 text-white/65">
            {project.description || project.short_description || "Chưa có mô tả"}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={sendInterest}
              className="rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
            >
              Quan tâm đầu tư
            </button>

            <button
              onClick={addFavorite}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-white/80 hover:bg-white/5"
            >
              <Heart className="h-4 w-4" />
              Lưu yêu thích
            </button>

            <button
              onClick={startChat}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-white/80 hover:bg-white/5"
            >
              <MessageCircle className="h-4 w-4" />
              Chat doanh nghiệp
            </button>
          </div>
        </div>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={Wallet}
          label="Vốn cần gọi"
          value={formatMoney(project.capital_needed || 0)}
        />

        <InfoCard
          icon={TrendingUp}
          label="ROI kỳ vọng"
          value={`${project.roi_expected || 0}%`}
        />

        <InfoCard
          icon={Leaf}
          label="ESG Score"
          value={project.esg_score || 0}
        />

        <InfoCard
          icon={Building2}
          label="Thời gian"
          value={`${project.project_duration_months || 0} tháng`}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-7">
          <h2 className="text-2xl font-bold text-white">Phân tích đầu tư</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <AnalysisBox
              title="Mức rủi ro"
              value={translateRisk(project.risk_level || "medium")}
              desc="Nhà đầu tư nên kiểm tra tài liệu, pháp lý và tiến độ gọi vốn."
            />

            <AnalysisBox
              title="ESG"
              value={`${project.esg_score || 0}/100`}
              desc="Điểm ESG càng cao càng phù hợp với đầu tư bền vững."
            />

            <AnalysisBox
              title="ROI"
              value={`${project.roi_expected || 0}%`}
              desc="ROI kỳ vọng cần được đối chiếu với mô hình kinh doanh."
            />

            <AnalysisBox
              title="Tác động xanh"
              value={`${project.carbon_reduction_est || 0} CO2`}
              desc="Ước tính giảm phát thải hoặc tác động môi trường."
            />
          </div>
        </Card>

        <Card className="p-7">
          <h2 className="text-2xl font-bold text-white">Vòng gọi vốn</h2>

          <div className="mt-6 space-y-4">
            {rounds.length === 0 ? (
              <div className="rounded-2xl bg-slate-900/70 p-6 text-center text-white/45">
                Chưa có vòng gọi vốn
              </div>
            ) : (
              rounds.map((round) => {
                const target = Number(round.target_amount || 0);
                const raised = Number(round.raised_amount || 0);
                const percent =
                  target > 0 ? Math.min(Math.round((raised / target) * 100), 100) : 0;

                return (
                  <div
                    key={round._id}
                    className="rounded-2xl bg-slate-900/70 p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-white">
                        {round.round_name || "Vòng gọi vốn"}
                      </h3>

                      <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-300">
                        {round.status || "upcoming"}
                      </span>
                    </div>

                    <div className="mt-4 text-sm text-white/55">
                      {formatMoney(raised)} / {formatMoney(target)}
                    </div>

                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-green-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <p className="mt-2 text-right text-sm text-white/45">
                      {percent}%
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/70">
      {children}
    </span>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-6">
      <div className="rounded-2xl bg-green-500/10 p-3 text-green-400 w-fit">
        <Icon className="h-6 w-6" />
      </div>

      <p className="mt-4 text-sm text-white/50">{label}</p>
      <h3 className="mt-2 text-2xl font-bold text-white">{value}</h3>
    </Card>
  );
}

function AnalysisBox({ title, value, desc }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-5">
      <p className="text-sm text-white/45">{title}</p>
      <h3 className="mt-2 text-xl font-bold text-green-300">{value}</h3>
      <p className="mt-3 text-sm leading-6 text-white/55">{desc}</p>
    </div>
  );
}

function translateRisk(risk) {
  const map = {
    low: "Rủi ro thấp",
    medium: "Rủi ro trung bình",
    high: "Rủi ro cao",
  };

  return map[risk] || risk;
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