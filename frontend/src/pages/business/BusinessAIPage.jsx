import React, { useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { Card, SectionTitle } from "./BusinessLayout";
import api from "../../lib/axios";

const quickPrompts = [
  "Tôi nên cải thiện dự án như thế nào?",
  "Làm sao để tăng điểm ESG?",
  "Gợi ý cách gọi vốn hiệu quả",
  "Tôi còn thiếu tài liệu gì?",
  "Làm sao thu hút nhà đầu tư?",
];

export default function BusinessAIPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Xin chào! Tôi là trợ lý AI cho doanh nghiệp. Tôi có thể tư vấn cải thiện dự án, ESG, gọi vốn, tài liệu và cách thu hút nhà đầu tư.",
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

      const res = await api.post("/business-bot/ask", {
        message: text,
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
          text:
            error.response?.data?.message ||
            "Bot doanh nghiệp đang gặp lỗi. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionTitle
        eyebrow="AI tư vấn"
        title="Trợ lý AI cho doanh nghiệp"
        right={
          <div className="rounded-2xl bg-green-500/10 px-4 py-2 text-green-300">
            Business Assistant
          </div>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <p className="flex items-center gap-2 text-sm text-green-300">
            <Sparkles className="h-4 w-4" />
            Gợi ý nhanh
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
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
                className={`flex gap-3 ${
                  isUser ? "justify-end" : "justify-start"
                }`}
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
              AI đang phân tích dữ liệu doanh nghiệp...
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
            placeholder="Ví dụ: dự án của tôi cần cải thiện gì?"
            className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-white/35"
          />

          <button
            disabled={loading}
            className="rounded-2xl bg-green-500 px-5 text-slate-950 hover:bg-green-400 disabled:opacity-60"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </Card>
    </div>
  );
}