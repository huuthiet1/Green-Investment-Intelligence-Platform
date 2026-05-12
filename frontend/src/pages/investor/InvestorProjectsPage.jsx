import React, { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Filter,
  Heart,
  Leaf,
  RefreshCcw,
  Search,
  Send,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, SectionTitle } from "./InvestorLayout";
import api from "../../lib/axios";

export default function InvestorProjectsPage() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("all");
  const [risk, setRisk] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      setProjects(res.data.projects || []);
    } catch (error) {
      console.error("FETCH INVESTOR PROJECTS ERROR:", error);
      alert(error.response?.data?.message || "Không tải được dự án");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const approvedProjects = useMemo(() => {
    return projects.filter((p) => (p.status || "approved") === "approved");
  }, [projects]);

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(approvedProjects.map((p) => p.category_name).filter(Boolean)),
    ];
  }, [approvedProjects]);

  const filteredProjects = useMemo(() => {
    return approvedProjects.filter((p) => {
      const text = `${p.title || ""} ${p.name || ""} ${
        p.description || ""
      } ${p.category_name || ""}`.toLowerCase();

      const matchKeyword = text.includes(keyword.toLowerCase());
      const matchCategory = category === "all" || p.category_name === category;
      const matchRisk = risk === "all" || (p.risk_level || "medium") === risk;

      return matchKeyword && matchCategory && matchRisk;
    });
  }, [approvedProjects, keyword, category, risk]);

  const saveFavorite = async (project) => {
    try {
      await api.post("/investors/favorites", {
        project_id: project._id || project.id,
      });

      alert("Đã lưu dự án yêu thích");
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi lưu yêu thích");
    }
  };

  const sendInterest = async (project) => {
  try {
    // 1. gửi quan tâm
    await api.post("/investors/interests", {
      project_id: project._id || project.id,
      message: "Tôi quan tâm đến dự án này.",
      estimated_budget: 0,
    });

    // 2. tạo conversation
    await api.post("/chat/conversations", {
      project_id: project._id || project.id,
      sender_id: "investor-demo",
      receiver_id: "business-demo",
      title: `Trao đổi đầu tư - ${
        project.title || "Dự án"
      }`,
    });

    alert(
      "Đã gửi quan tâm đầu tư và tạo cuộc trò chuyện"
    );
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Lỗi gửi quan tâm đầu tư"
    );
  }
};

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải danh sách dự án...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Investor"
        title="Khám phá dự án xanh"
        right={
          <button
            onClick={fetchProjects}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-4">
        <StatCard label="Dự án khả dụng" value={approvedProjects.length} />
        <StatCard
          label="ESG cao"
          value={
            approvedProjects.filter((p) => Number(p.esg_score || 0) >= 75)
              .length
          }
        />
        <StatCard
          label="Rủi ro thấp"
          value={
            approvedProjects.filter((p) => (p.risk_level || "medium") === "low")
              .length
          }
        />
        <StatCard
          label="Đang gọi vốn"
          value={approvedProjects.filter((p) => p.status === "approved").length}
        />
      </div>

      <Card className="p-5">
        <div className="grid gap-3 xl:grid-cols-[1fr_260px_230px]">
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white/60">
            <Search className="h-4 w-4" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên, mô tả, danh mục..."
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white/60">
            <Filter className="h-4 w-4" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent text-white outline-none"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "all" ? "Tất cả danh mục" : item}
                </option>
              ))}
            </select>
          </label>

          <select
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          >
            <option value="all">Tất cả rủi ro</option>
            <option value="low">Rủi ro thấp</option>
            <option value="medium">Rủi ro trung bình</option>
            <option value="high">Rủi ro cao</option>
          </select>
        </div>
      </Card>

      {filteredProjects.length === 0 ? (
        <Card className="p-10 text-center text-white/45">
          Không có dự án phù hợp
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id || project.id}
              project={project}
              onView={() =>
                navigate(`/investor/projects/${project._id || project.id}`)
              }
              onFavorite={() => saveFavorite(project)}
              onInterest={() => sendInterest(project)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onView, onFavorite, onInterest }) {
  const image = project.thumbnail_url
    ? `http://localhost:5001${project.thumbnail_url}`
    : "https://placehold.co/900x560?text=Green+Project";

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={image}
          alt={project.title || "Project"}
          className="h-56 w-full object-cover"
        />

        <div className="absolute left-4 top-4 rounded-full bg-green-500/90 px-3 py-1 text-sm font-semibold text-slate-950">
          ESG {project.esg_score || 0}
        </div>

        <button
          onClick={onFavorite}
          className="absolute right-4 top-4 rounded-full bg-black/50 p-3 text-white backdrop-blur hover:bg-red-500"
          title="Lưu yêu thích"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="p-6">
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge>{project.category_name || "Green Project"}</Badge>
          <Badge>{translateRisk(project.risk_level || "medium")}</Badge>
          <Badge>{project.status || "approved"}</Badge>
        </div>

        <h3 className="line-clamp-2 text-xl font-bold text-white">
          {project.title || project.name || "Dự án không tên"}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">
          {project.short_description ||
            project.description ||
            "Chưa có mô tả dự án"}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MiniStat
            icon={TrendingUp}
            label="ROI"
            value={`${project.roi_expected || 0}%`}
          />

          <MiniStat
            icon={Wallet}
            label="Vốn gọi"
            value={formatMoney(project.capital_needed || 0)}
          />

          <MiniStat
            icon={Leaf}
            label="ESG"
            value={project.esg_score || 0}
          />

          <MiniStat
            icon={Filter}
            label="Thời gian"
            value={`${project.project_duration_months || 0} tháng`}
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onView}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-white/80 hover:bg-white/5"
          >
            <Eye className="h-4 w-4" />
            Chi tiết
          </button>

          <button
            onClick={onInterest}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-green-400"
          >
            <Send className="h-4 w-4" />
            Quan tâm
          </button>
        </div>
      </div>
    </Card>
  );
}

function StatCard({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-white/50">{label}</p>
      <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
    </Card>
  );
}

function Badge({ children }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/65">
      {children}
    </span>
  );
}

function MiniStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-4">
      <div className="mb-2 flex items-center gap-2 text-green-300">
        <Icon className="h-4 w-4" />
        <span className="text-xs">{label}</span>
      </div>

      <div className="font-semibold text-white">{value}</div>
    </div>
  );
}

function translateRisk(risk) {
  const map = {
    low: "Rủi ro thấp",
    medium: "Rủi ro TB",
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