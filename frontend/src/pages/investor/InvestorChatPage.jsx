import React from "react";
import ChatPage from "../chat/ChatPage";

export default function InvestorChatPage() {
  return (
    <div className="h-[calc(100vh-140px)] overflow-hidden rounded-3xl border border-white/10">
      <ChatPage mode="investor" />
    </div>
  );
}