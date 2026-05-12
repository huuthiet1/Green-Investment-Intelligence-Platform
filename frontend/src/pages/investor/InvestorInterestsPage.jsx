import React, { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Eye,
  RefreshCcw,
  Send,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, SectionTitle } from "./InvestorLayout";
import api from "../../lib/axios";

export default function InvestorInterestsPage() {
  const navigate = useNavigate();

  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterests = async () => {
    try {
      setLoading(true);

      const res = await api.get("/investors/interests");

      setInterests(res.data.interests || []);
    } catch (error) {
      console.error("FETCH INTERESTS ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Không tải được cơ hội đầu tư"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterests();
  }, []);

  const totalBudget = useMemo(() => {
    return interests.reduce(
      (sum, item) =>
        sum + Number(item.estimated_budget || 0),
      0
    );
  }, [interests]);

  const acceptedCount = useMemo(() => {
    return interests.filter(
      (item) => item.status === "accepted"
    ).length;
  }, [interests]);

  const pendingCount = useMemo(() => {
    return interests.filter(
      (item) =>
        !item.status ||
        item.status === "interested" ||
        item.status === "pending"
    ).length;
  }, [interests]);

  const removeInterest = async (id) => {
    try {
      await api.delete(`/investors/interests/${id}`);

      setInterests((prev) =>
        prev.filter((item) => item._id !== id)
      );

      alert("Đã xóa cơ hội đầu tư");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Không thể xóa"
      );
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải cơ hội đầu tư...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Investor"
        title="Cơ hội đầu tư"
        right={
          <button
            onClick={fetchInterests}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard
          title="Đã quan tâm"
          value={interests.length}
          desc="Tổng cơ hội đầu tư"
        />

        <StatCard
          title="Đang chờ"
          value={pendingCount}
          desc="Đợi phản hồi doanh nghiệp"
        />

        <StatCard
          title="Tổng ngân sách"
          value={formatMoney(totalBudget)}
          desc="Ngân sách dự kiến đầu tư"
        />
      </div>

      {interests.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp className="mx-auto h-14 w-14 text-green-400" />

          <h3 className="mt-5 text-2xl font-bold text-white">
            Chưa có cơ hội đầu tư
          </h3>

          <p className="mt-3 text-white/45">
            Hãy khám phá dự án và gửi quan tâm đầu tư.
          </p>

          <button
            onClick={() =>
              navigate("/investor/projects")
            }
            className="mt-6 rounded-2xl bg-green-500 px-6 py-3 font-semibold text-slate-950 hover:bg-green-400"
          >
            Khám phá dự án
          </button>
        </Card>
      ) : (
        <div className="space-y-5">
          {interests.map((interest) => {
            const project = interest.project_id || {};

            return (
              <Card
                key={interest._id}
                className="overflow-hidden"
              >
                <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
                  <img
                    src={
                      project.thumbnail_url
                        ? `http://localhost:5001${project.thumbnail_url}`
                        : "https://placehold.co/900x600?text=Green+Project"
                    }
                    alt={project.title || "Project"}
                    className="h-full min-h-[260px] w-full object-cover"
                  />

                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="mb-3 flex flex-wrap gap-2">
                          <Badge>
                            {project.category_name ||
                              "Green Project"}
                          </Badge>

                          <Badge>
                            ESG {project.esg_score || 0}
                          </Badge>

                          <StatusBadge
                            status={
                              interest.status ||
                              "interested"
                            }
                          />
                        </div>

                        <h3 className="text-2xl font-bold text-white">
                          {project.title ||
                            "Dự án không tên"}
                        </h3>

                        <p className="mt-3 max-w-3xl leading-7 text-white/55">
                          {project.short_description ||
                            project.description ||
                            "Chưa có mô tả"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-green-500/10 px-4 py-3 text-right">
                        <p className="text-xs text-green-300">
                          Ngân sách dự kiến
                        </p>

                        <h3 className="mt-1 text-2xl font-bold text-white">
                          {formatMoney(
                            interest.estimated_budget || 0
                          )}
                        </h3>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                      <InfoBox
                        icon={Wallet}
                        label="Vốn gọi"
                        value={formatMoney(
                          project.capital_needed || 0
                        )}
                      />

                      <InfoBox
                        icon={TrendingUp}
                        label="ROI"
                        value={`${
                          project.roi_expected || 0
                        }%`}
                      />

                      <InfoBox
                        icon={CalendarDays}
                        label="Thời gian"
                        value={`${
                          project.project_duration_months ||
                          0
                        } tháng`}
                      />

                      <InfoBox
                        icon={Send}
                        label="Trạng thái"
                        value={translateStatus(
                          interest.status
                        )}
                      />
                    </div>

                    <div className="mt-6 rounded-2xl bg-slate-900/70 p-5">
                      <p className="text-sm text-white/45">
                        Tin nhắn gửi doanh nghiệp
                      </p>

                      <p className="mt-2 leading-7 text-white/75">
                        {interest.message ||
                          "Không có tin nhắn"}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          navigate(
                            `/investor/projects/${
                              project._id || project.id
                            }`
                          )
                        }
                        className="flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-white/80 hover:bg-white/5"
                      >
                        <Eye className="h-4 w-4" />
                        Xem dự án
                      </button>

                      <button
                        onClick={() =>
                          removeInterest(interest._id)
                        }
                        className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-3 text-red-300 hover:bg-red-500/20"
                      >
                        Xóa quan tâm
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, desc }) {
  return (
    <Card className="p-6">
      <p className="text-sm text-white/50">
        {title}
      </p>

      <h3 className="mt-2 text-3xl font-bold text-white">
        {value}
      </h3>

      <p className="mt-2 text-sm text-white/40">
        {desc}
      </p>
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

function StatusBadge({ status }) {
  const styles = {
    interested:
      "bg-yellow-500/10 text-yellow-300",
    pending:
      "bg-yellow-500/10 text-yellow-300",
    accepted:
      "bg-green-500/10 text-green-300",
    rejected:
      "bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs ${
        styles[status] ||
        "bg-white/10 text-white/70"
      }`}
    >
      {translateStatus(status)}
    </span>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-4">
      <div className="mb-2 flex items-center gap-2 text-green-300">
        <Icon className="h-4 w-4" />
        <span className="text-xs">
          {label}
        </span>
      </div>

      <div className="font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

function translateStatus(status) {
  const map = {
    interested: "Đã gửi",
    pending: "Đang chờ",
    accepted: "Được chấp nhận",
    rejected: "Bị từ chối",
  };

  return map[status] || status;
}

function formatMoney(value) {
  const number = Number(value || 0);

  if (number >= 1_000_000_000) {
    return `${(
      number / 1_000_000_000
    ).toFixed(1)} tỷ`;
  }

  if (number >= 1_000_000) {
    return `${(
      number / 1_000_000
    ).toFixed(1)} triệu`;
  }

  return `${number.toLocaleString(
    "vi-VN"
  )}đ`;
}