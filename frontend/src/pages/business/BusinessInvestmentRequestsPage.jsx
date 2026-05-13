import { useEffect, useMemo, useState } from "react";
import api from "../../lib/axios";
import {
  CheckCircle2,
  RefreshCcw,
  XCircle,
  Wallet,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BusinessInvestmentRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/investments/business");
      setRequests(res.data.investments || []);
    } catch (error) {
      console.error("FETCH INVESTMENT REQUESTS ERROR:", error);
      alert(error.response?.data?.message || "Không tải được yêu cầu góp vốn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests]
  );

  const approvedAmount = useMemo(
    () =>
      requests
        .filter((r) => r.status === "approved")
        .reduce((sum, r) => sum + Number(r.amount || 0), 0),
    [requests]
  );

  const updateStatus = async (item, status) => {
    try {
      let rejection_reason = "";

      if (status === "rejected") {
        rejection_reason =
          prompt("Nhập lý do từ chối:", "Chưa phù hợp với điều kiện gọi vốn") ||
          "";
      }

      await api.put(`/investments/${item._id}/status`, {
        status,
        rejection_reason,
      });

      alert(
        status === "approved"
          ? "Đã duyệt yêu cầu góp vốn"
          : "Đã từ chối yêu cầu góp vốn"
      );

      fetchRequests();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xử lý yêu cầu");
    }
  };

  const startChat = async (item) => {
    try {
      const res = await api.post("/chat/conversations", {
        receiver_id: item.investor_id,
        project_id: item.project_id?._id || item.project_id,
        title: `Trao đổi góp vốn - ${item.project_title || "Dự án"}`,
      });

      navigate("/business/chat", {
        state: {
          conversationId: res.data.conversation._id,
        },
      });
    } catch (error) {
      alert(error.response?.data?.message || "Không tạo được cuộc trò chuyện");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-white/60">
        Đang tải yêu cầu góp vốn...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-white/50">Góp vốn</p>
          <h2 className="text-3xl font-bold">Yêu cầu góp vốn từ nhà đầu tư</h2>
        </div>

        <button
          onClick={fetchRequests}
          className="flex items-center gap-2 rounded-2xl bg-green-500 px-5 py-3 font-medium text-slate-950 hover:bg-green-400"
        >
          <RefreshCcw className="h-4 w-4" />
          Làm mới
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard title="Tổng yêu cầu" value={requests.length} />
        <StatCard title="Đang chờ" value={pendingCount} />
        <StatCard title="Đã duyệt" value={formatMoney(approvedAmount)} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#101827]">
        <table className="w-full">
          <thead className="border-b border-white/10 text-left text-white/50">
            <tr>
              <th className="p-5">Nhà đầu tư</th>
              <th>Dự án</th>
              <th>Vòng gọi vốn</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 text-center text-white/45">
                  Chưa có yêu cầu góp vốn
                </td>
              </tr>
            ) : (
              requests.map((item) => (
                <tr key={item._id} className="border-b border-white/5">
                  <td className="p-5">
                    <div className="font-semibold text-white">
                      {item.investor_name}
                    </div>
                    <div className="text-sm text-white/45">
                      {item.investor_email || item.investor_id}
                    </div>
                  </td>

                  <td className="text-white/70">{item.project_title}</td>

                  <td className="text-white/70">{item.round_name}</td>

                  <td className="font-semibold text-green-300">
                    {formatMoney(item.amount)}
                  </td>

                  <td>
                    <StatusBadge status={item.status} />
                  </td>

                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startChat(item)}
                        className="rounded-xl border border-white/10 p-2 hover:bg-white/5"
                        title="Chat"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>

                      {item.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(item, "approved")}
                            className="rounded-xl border border-green-400/20 bg-green-500/10 p-2 text-green-300 hover:bg-green-500/20"
                            title="Duyệt"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => updateStatus(item, "rejected")}
                            className="rounded-xl border border-red-400/20 bg-red-500/10 p-2 text-red-300 hover:bg-red-500/20"
                            title="Từ chối"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
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

function StatCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#101827] p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/10 text-green-400">
        <Wallet className="h-6 w-6" />
      </div>
      <p className="text-sm text-white/50">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: "bg-yellow-500/10 text-yellow-300",
    approved: "bg-green-500/10 text-green-300",
    rejected: "bg-red-500/10 text-red-300",
    cancelled: "bg-slate-500/10 text-slate-300",
  };

  const label = {
    pending: "Đang chờ",
    approved: "Đã duyệt",
    rejected: "Từ chối",
    cancelled: "Đã hủy",
  };

  return (
    <span className={`rounded-full px-3 py-1 text-sm ${map[status] || map.pending}`}>
      {label[status] || status}
    </span>
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