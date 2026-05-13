import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { MessageCircle, Mail, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BusinessInvestorsPage() {
  const [investors, setInvestors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchInvestors = async () => {
    try {
      setLoading(true);
      const res = await api.get("/investors");
      setInvestors(res.data.investors || []);
    } catch (error) {
      console.error("FETCH INVESTORS ERROR:", error);
      alert(error.response?.data?.message || "Không tải được nhà đầu tư");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const handleChat = async (investor) => {
    try {
      const res = await api.post("/chat/conversations", {
        receiver_id: investor.investor_id,
        project_id: investor.project_id,
        title: `Trao đổi đầu tư - ${investor.project_title || "Dự án"}`,
      });

      navigate("/business/chat", {
        state: {
          conversationId: res.data.conversation._id,
        },
      });
    } catch (error) {
      console.error("CREATE CHAT ERROR:", error);
      alert(error.response?.data?.message || "Không tạo được cuộc trò chuyện");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải danh sách nhà đầu tư...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-white/50">Nhà đầu tư</p>
          <h2 className="text-3xl font-bold">
            Danh sách nhà đầu tư quan tâm
          </h2>
        </div>

        <button
          onClick={fetchInvestors}
          className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
        >
          <RefreshCcw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#10182b]">
        <table className="w-full">
          <thead className="border-b border-white/10 text-left text-white/50">
            <tr>
              <th className="p-5">Nhà đầu tư</th>
              <th>Dự án</th>
              <th>Ngân sách</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {investors.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-white/45">
                  Chưa có nhà đầu tư quan tâm
                </td>
              </tr>
            ) : (
              investors.map((item) => (
                <tr key={item._id} className="border-b border-white/5">
                  <td className="p-5">
                    <div className="font-semibold">
                      {item.name || item.investor_name || "Nhà đầu tư"}
                    </div>

                    <div className="text-sm text-white/50">
                      {item.email || item.investor_id}
                    </div>
                  </td>

                  <td className="text-white/70">
                    {item.project_title || item.project_id?.title || "Dự án"}
                  </td>

                  <td>
                    {Number(
                      item.estimated_budget || item.budget || 0
                    ).toLocaleString("vi-VN")}{" "}
                    VND
                  </td>

                  <td>
                    <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                      {item.status || "interested"}
                    </span>
                  </td>

                  <td>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleChat(item)}
                        className="rounded-xl border border-white/10 p-2 hover:bg-white/5"
                        title="Nhắn tin"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>

                      <a
                        href={
                          item.email
                            ? `mailto:${item.email}`
                            : undefined
                        }
                        className="rounded-xl border border-white/10 p-2 hover:bg-white/5"
                        title="Email"
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}