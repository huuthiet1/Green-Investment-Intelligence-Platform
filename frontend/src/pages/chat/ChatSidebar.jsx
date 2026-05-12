import React from "react";
import { MessageCircle } from "lucide-react";

export default function ChatSidebar({
  conversations,
  selectedConversation,
  onSelect,
  onCreateDemo,
}) {
  return (
    <aside className="w-[330px] border-r border-white/10 bg-slate-950 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/50">Kết nối đầu tư</p>
          <h2 className="text-xl font-bold">Tin nhắn</h2>
        </div>

        <button
          onClick={onCreateDemo}
          className="rounded-2xl bg-green-500 px-3 py-2 text-sm font-medium text-slate-950"
        >
          Tạo demo
        </button>
      </div>

      <div className="space-y-2">
        {conversations.map((item) => {
          const active = selectedConversation?._id === item._id;

          return (
            <button
              key={item._id}
              onClick={() => onSelect(item)}
              className={`w-full rounded-2xl p-4 text-left transition ${
                active ? "bg-green-500/20" : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-500/10 text-green-400">
                  <MessageCircle className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="truncate font-semibold">
                    {item.title || "Cuộc trò chuyện"}
                  </h3>
                  <p className="truncate text-sm text-white/45">
                    {item.last_message || "Chưa có tin nhắn"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}