import React from "react";
import { FileText } from "lucide-react";

const API_URL = "http://localhost:5001";

export default function MessageBubble({ message, currentUserId }) {
  const isMe = message.sender_id === currentUserId;
  const isAI = message.sender_id === "ai-bot";
  const type = message.message_type || "text";

  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          isMe
            ? "bg-green-500 text-slate-950"
            : isAI
            ? "border border-emerald-400/20 bg-emerald-500/10 text-emerald-100"
            : "bg-slate-800 text-white"
        }`}
      >
        {type === "image" && message.attachment_url && (
          <img
            src={`${API_URL}${message.attachment_url}`}
            alt="Ảnh chat"
            className="mb-2 max-h-80 rounded-xl object-cover"
          />
        )}

        {type === "audio" && message.attachment_url && (
          <audio controls className="mb-2 w-72">
            <source src={`${API_URL}${message.attachment_url}`} />
            Trình duyệt không hỗ trợ audio.
          </audio>
        )}

        {type === "file" && message.attachment_url && (
          <a
            href={`${API_URL}${message.attachment_url}`}
            target="_blank"
            rel="noreferrer"
            className="mb-2 flex items-center gap-2 rounded-xl bg-black/20 p-3 underline"
          >
            <FileText className="h-5 w-5" />
            {message.attachment_name || "Tải file"}
          </a>
        )}

        {message.content && (
          <p className="whitespace-pre-wrap text-sm leading-6">
            {message.content}
          </p>
        )}

        <p className="mt-1 text-right text-xs opacity-70">
          {new Date(message.createdAt || Date.now()).toLocaleTimeString(
            "vi-VN",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          )}
        </p>
      </div>
    </div>
  );
}