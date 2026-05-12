import { useEffect, useState } from "react";
import api from "../../lib/axios";
import { MessageCircle, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function BusinessInvestorsPage() {
  const [investors, setInvestors] = useState([]);
  const navigate = useNavigate();

  const fetchInvestors = async () => {
    try {
      const res = await api.get("/investors");
      setInvestors(res.data.investors || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchInvestors();
  }, []);

  const handleChat = async (investor) => {
    try {
      const res = await api.post("/chat/conversations", {
        sender_id: "business-demo",
        receiver_id: investor._id,
        title: investor.investor_name,
      });

      navigate("/chat", {
        state: {
          conversationId: res.data.conversation._id,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-white/50">Nhà đầu tư</p>
        <h2 className="text-3xl font-bold">
          Danh sách nhà đầu tư quan tâm
        </h2>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#10182b]">
        <table className="w-full">
          <thead className="border-b border-white/10 text-left text-white/50">
            <tr>
              <th className="p-5">Nhà đầu tư</th>
              <th>Ngân sách</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>

          <tbody>
            {investors.map((item) => (
              <tr
                key={item._id}
                className="border-b border-white/5"
              >
                <td className="p-5">
                  <div className="font-semibold">
                    {item.investor_name}
                  </div>

                  <div className="text-sm text-white/50">
                    {item.project_id?.title}
                  </div>
                </td>

                <td>
                  {Number(item.budget || 0).toLocaleString("vi-VN")} VND
                </td>

                <td>
                  <span className="rounded-full bg-green-500/10 px-3 py-1 text-sm text-green-400">
                    {item.status}
                  </span>
                </td>

                <td>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleChat(item)}
                      className="rounded-xl border border-white/10 p-2 hover:bg-white/5"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>

                    <button
                      className="rounded-xl border border-white/10 p-2 hover:bg-white/5"
                    >
                      <Mail className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}