import {
  ArrowLeft,
  Building2,
  Coins,
  FileText,
  Leaf,
  Users,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ExportPdfButton from "../../components/ExportPdfButton";
import api from "../../lib/axios";

export default function BusinessProjectDetailPage() {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProject = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/projects/${id}`);

      setProject(res.data.project);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="p-10 text-center text-white">
        Đang tải dự án...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-10 text-center text-red-400">
        Không tìm thấy dự án
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 text-white">
      <div id="project-detail-pdf" className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/business/projects"
            className="inline-flex items-center gap-2 text-green-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Link>

          <ExportPdfButton
            targetId="project-detail-pdf"
            filename={`${project.title || "project"}.pdf`}
            label="Xuất PDF"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_420px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* IMAGE */}
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#10182B]">
              <img
                src={
                  project.thumbnail_url
                    ? `http://localhost:5001${project.thumbnail_url}`
                    : "https://placehold.co/1200x600?text=Green+Project"
                }
                alt={project.title}
                className="h-[420px] w-full object-cover"
              />
            </div>

            {/* INFO */}
            <div className="rounded-3xl border border-white/10 bg-[#10182B] p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-300">
                  {project.category_name || "Green Project"}
                </span>

                <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/70">
                  {project.status || "pending"}
                </span>
              </div>

              <h1 className="mt-5 text-4xl font-bold">
                {project.title}
              </h1>

              <p className="mt-6 whitespace-pre-wrap text-lg leading-8 text-white/70">
                {project.description || "Chưa có mô tả dự án"}
              </p>
            </div>

            {/* DOCUMENTS */}
            <div className="rounded-3xl border border-white/10 bg-[#10182B] p-8">
              <div className="mb-5 flex items-center gap-3">
                <FileText className="h-6 w-6 text-green-400" />

                <h2 className="text-2xl font-bold">
                  Hồ sơ tài liệu
                </h2>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-[#0B1120] p-5">
                  <div className="font-semibold">
                    Báo cáo ESG
                  </div>

                  <div className="mt-1 text-sm text-white/50">
                    ESG Report 2025
                  </div>
                </div>

                <div className="rounded-2xl bg-[#0B1120] p-5">
                  <div className="font-semibold">
                    Hồ sơ pháp lý
                  </div>

                  <div className="mt-1 text-sm text-white/50">
                    Legal Documents
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">
            {/* ESG */}
            <div className="rounded-3xl border border-white/10 bg-[#10182B] p-7">
              <div className="flex items-center gap-3">
                <Leaf className="h-6 w-6 text-green-400" />

                <h2 className="text-xl font-bold">
                  ESG Score
                </h2>
              </div>

              <div className="mt-8 text-center">
                <div className="text-6xl font-bold text-green-400">
                  {project.esg_score || 0}
                </div>

                <div className="mt-2 text-white/50">
                  Điểm ESG tổng
                </div>
              </div>
            </div>

            {/* FUNDING */}
            <div className="rounded-3xl border border-white/10 bg-[#10182B] p-7">
              <div className="flex items-center gap-3">
                <Coins className="h-6 w-6 text-green-400" />

                <h2 className="text-xl font-bold">
                  Gọi vốn
                </h2>
              </div>

              <div className="mt-6">
                <div className="flex justify-between text-sm text-white/60">
                  <span>Tiến độ gọi vốn</span>
                  <span>40%</span>
                </div>

                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#0B1120]">
                  <div className="h-full w-[40%] rounded-full bg-green-500" />
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4">
                <StatCard
                  label="Vốn cần"
                  value={`${Number(
                    project.capital_needed || 0
                  ).toLocaleString("vi-VN")}đ`}
                />

                <StatCard
                  label="ROI kỳ vọng"
                  value={`${project.roi_expected || 0}%`}
                />
              </div>
            </div>

            {/* INVESTORS */}
            <div className="rounded-3xl border border-white/10 bg-[#10182B] p-7">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-green-400" />

                <h2 className="text-xl font-bold">
                  Nhà đầu tư quan tâm
                </h2>
              </div>

              <div className="mt-6 space-y-4">
                <InvestorCard
                  name="Green Capital"
                  amount="5 tỷ"
                />

                <InvestorCard
                  name="Eco Ventures"
                  amount="2 tỷ"
                />
              </div>
            </div>

            {/* OWNER */}
            <div className="rounded-3xl border border-white/10 bg-[#10182B] p-7">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-green-400" />

                <h2 className="text-xl font-bold">
                  Doanh nghiệp
                </h2>
              </div>

              <div className="mt-6">
                <div className="text-lg font-semibold">
                  Green Startup Vietnam
                </div>

                <div className="mt-1 text-white/50">
                  Sustainable Business
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-[#0B1120] p-5">
      <div className="text-sm text-white/50">
        {label}
      </div>

      <div className="mt-2 text-xl font-bold">
        {value}
      </div>
    </div>
  );
}

function InvestorCard({ name, amount }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-[#0B1120] p-4">
      <div>
        <div className="font-semibold">
          {name}
        </div>

        <div className="text-sm text-white/50">
          Quan tâm đầu tư
        </div>
      </div>

      <div className="rounded-full bg-green-500/10 px-4 py-2 text-sm text-green-300">
        {amount}
      </div>
    </div>
  );
}