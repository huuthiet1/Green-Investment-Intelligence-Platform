import React, { useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import api from "../../lib/axios";

const quickPrompts = [
  "Gợi ý dự án xanh đáng đầu tư",
  "Làm sao để tăng điểm ESG?",
  "Cách gọi vốn hiệu quả cho doanh nghiệp",
  "Đánh giá rủi ro dự án như thế nào?",
];

export default function SmartBotPage() {
  const [role, setRole] = useState("investor");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Xin chào! Tôi là trợ lý đầu tư xanh. Tôi có thể gợi ý dự án cho nhà đầu tư hoặc tư vấn doanh nghiệp tối ưu ESG và gọi vốn.",
    },
  ]);

  const sendMessage = async (text = input) => {
    if (!text.trim()) return;

    const userMessage = {
      sender: "user",
      text,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      setLoading(true);

      const res = await api.post("/ai-bot/ask", {
        message: text,
        role,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: res.data.reply,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: error.response?.data?.message || "Bot đang gặp lỗi, vui lòng thử lại.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm text-green-300">
              <Sparkles className="h-4 w-4" />
              Green Investment AI Assistant
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              Chatbot gợi ý đầu tư xanh
            </h1>
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"
          >
            <option value="investor">Tôi là nhà đầu tư</option>
            <option value="business">Tôi là doanh nghiệp</option>
          </select>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 p-5">
            <div className="flex flex-wrap gap-3">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="rounded-full border border-green-400/20 bg-green-500/10 px-4 py-2 text-sm text-green-300 hover:bg-green-500/20"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[560px] space-y-5 overflow-y-auto p-6">
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";

              return (
                <div
                  key={index}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-300">
                      <Bot className="h-5 w-5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] whitespace-pre-wrap rounded-3xl px-5 py-4 text-sm leading-6 ${
                      isUser
                        ? "bg-green-500 text-slate-950"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {isUser && (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3 text-green-300">
                <Bot className="h-5 w-5" />
                Bot đang phân tích...
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-3 border-t border-white/10 p-5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi, ví dụ: Tôi nên đầu tư dự án nào?"
              className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 outline-none placeholder:text-white/35"
            />

            <button
              disabled={loading}
              className="rounded-2xl bg-green-500 px-5 text-slate-950 hover:bg-green-400 disabled:opacity-60"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}