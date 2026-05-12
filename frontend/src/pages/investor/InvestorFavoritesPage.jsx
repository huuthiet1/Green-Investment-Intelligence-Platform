import React, { useEffect, useState } from "react";
import {
  Eye,
  Heart,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, SectionTitle } from "./InvestorLayout";
import api from "../../lib/axios";

export default function InvestorFavoritesPage() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      const res = await api.get("/investors/favorites");

      setFavorites(res.data.favorites || []);
    } catch (error) {
      console.error("FETCH FAVORITES ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const removeFavorite = async (id) => {
    try {
      await api.delete(`/investors/favorites/${id}`);

      setFavorites((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xóa yêu thích");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải dự án yêu thích...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="Investor"
        title="Dự án yêu thích"
        right={
          <button
            onClick={fetchFavorites}
            className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950"
          >
            <RefreshCcw className="h-4 w-4" />
            Làm mới
          </button>
        }
      />

      {favorites.length === 0 ? (
        <Card className="p-10 text-center text-white/45">
          Chưa có dự án yêu thích
        </Card>
      ) : (
        <div className="grid gap-5 xl:grid-cols-3">
          {favorites.map((item) => {
            const project = item.project_id || {};

            const image = project.thumbnail_url
              ? `http://localhost:5001${project.thumbnail_url}`
              : "https://placehold.co/800x500?text=Project";

            return (
              <Card
                key={item._id}
                className="overflow-hidden"
              >
                <img
                  src={image}
                  alt={project.title}
                  className="h-52 w-full object-cover"
                />

                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />

                    <span className="text-sm text-red-300">
                      Yêu thích
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {project.title || "Dự án"}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">
                    {project.description || "Chưa có mô tả"}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <MiniStat
                      label="ESG"
                      value={project.esg_score || 0}
                    />

                    <MiniStat
                      label="ROI"
                      value={`${project.roi_expected || 0}%`}
                    />
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() =>
                        navigate(
                          `/investor/projects/${project._id}`
                        )
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-white/80 hover:bg-white/5"
                    >
                      <Eye className="h-4 w-4" />
                      Chi tiết
                    </button>

                    <button
                      onClick={() =>
                        removeFavorite(item._id)
                      }
                      className="flex items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-900/70 p-4">
      <p className="text-xs text-white/45">{label}</p>
      <p className="mt-1 font-semibold text-white">
        {value}
      </p>
    </div>
  );
}