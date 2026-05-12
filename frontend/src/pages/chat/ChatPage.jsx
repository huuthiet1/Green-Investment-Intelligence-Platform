import React, { useEffect, useState } from "react";
import api from "../../lib/axios";
import socket from "../../lib/socket";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

const CURRENT_USER_ID = "business-demo";
const OTHER_USER_ID = "investor-demo";

const AI_CONVERSATION = {
  _id: "ai-bot",
  title: "AI Tư vấn đầu tư xanh",
  last_message: "Hỏi tôi về ESG, gọi vốn, ROI, rủi ro...",
  is_ai: true,
};

export default function ChatPage({ mode = "business" }) {
  const [conversations, setConversations] = useState([AI_CONVERSATION]);
  const [selectedConversation, setSelectedConversation] =
    useState(AI_CONVERSATION);

  const [messages, setMessages] = useState([
    {
      _id: "ai-welcome",
      conversation_id: "ai-bot",
      sender_id: "ai-bot",
      receiver_id: CURRENT_USER_ID,
      content:
        "Xin chào! Tôi là trợ lý AI đầu tư xanh. Bạn có thể hỏi tôi về dự án, ESG, ROI, rủi ro hoặc cách gọi vốn hiệu quả.",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [typingText, setTypingText] = useState("");

  const fetchConversations = async () => {
    try {
      const res = await api.get("/chat/conversations");
      const realConversations = res.data.conversations || [];
      setConversations([AI_CONVERSATION, ...realConversations]);
    } catch (error) {
      console.error(error);
      setConversations([AI_CONVERSATION]);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (conversationId === "ai-bot") return;

    const res = await api.get(`/chat/conversations/${conversationId}/messages`);
    setMessages(res.data.messages || []);
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversation?._id) return;

    if (selectedConversation._id === "ai-bot") {
      setMessages([
        {
          _id: "ai-welcome",
          conversation_id: "ai-bot",
          sender_id: "ai-bot",
          receiver_id: CURRENT_USER_ID,
          content:
            "Xin chào! Tôi là trợ lý AI đầu tư xanh. Bạn có thể hỏi tôi về dự án, ESG, ROI, rủi ro hoặc cách gọi vốn hiệu quả.",
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    socket.emit("join_conversation", selectedConversation._id);
    fetchMessages(selectedConversation._id);

    const handleNewMessage = (message) => {
      if (message.conversation_id === selectedConversation._id) {
        setMessages((prev) => [...prev, message]);
      }

      fetchConversations();
    };

    const handleTyping = ({ user }) => {
      setTypingText(`${user || "Người dùng"} đang nhập...`);
      setTimeout(() => setTypingText(""), 1200);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.emit("leave_conversation", selectedConversation._id);
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
    };
  }, [selectedConversation]);

  const handleCreateDemoConversation = async () => {
    const res = await api.post("/chat/conversations", {
      sender_id: CURRENT_USER_ID,
      receiver_id: OTHER_USER_ID,
      title: "Quỹ Green Capital",
    });

    await fetchConversations();
    setSelectedConversation(res.data.conversation);
  };

  const handleSendToAI = async (content) => {
    const userMessage = {
      _id: `user-${Date.now()}`,
      conversation_id: "ai-bot",
      sender_id: CURRENT_USER_ID,
      receiver_id: "ai-bot",
      content,
      message_type: "text",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setTypingText("AI đang phân tích...");

    try {
      const res = await api.post("/ai-bot/ask", {
        message: content,
        role: "business",
      });

      const botMessage = {
        _id: `bot-${Date.now()}`,
        conversation_id: "ai-bot",
        sender_id: "ai-bot",
        receiver_id: CURRENT_USER_ID,
        content: res.data.reply,
        message_type: "text",
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          _id: `bot-error-${Date.now()}`,
          conversation_id: "ai-bot",
          sender_id: "ai-bot",
          receiver_id: CURRENT_USER_ID,
          content:
            error.response?.data?.message ||
            "Bot AI đang gặp lỗi. Kiểm tra backend route /api/ai-bot/ask.",
          message_type: "text",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setTypingText("");
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();

    if (!input.trim() || !selectedConversation?._id) return;

    const content = input.trim();
    setInput("");

    if (selectedConversation._id === "ai-bot") {
      await handleSendToAI(content);
      return;
    }

    await api.post("/chat/messages", {
      conversation_id: selectedConversation._id,
      sender_id: CURRENT_USER_ID,
      receiver_id: OTHER_USER_ID,
      content,
      message_type: "text",
    });
  };

  const handleSendAttachment = async (file, messageType) => {
    if (!selectedConversation?._id) return;

    if (selectedConversation._id === "ai-bot") {
      setMessages((prev) => [
        ...prev,
        {
          _id: `ai-file-warning-${Date.now()}`,
          conversation_id: "ai-bot",
          sender_id: "ai-bot",
          receiver_id: CURRENT_USER_ID,
          content: "AI bot hiện chỉ hỗ trợ tư vấn bằng văn bản.",
          message_type: "text",
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversation_id", selectedConversation._id);
    formData.append("sender_id", CURRENT_USER_ID);
    formData.append("receiver_id", OTHER_USER_ID);
    formData.append("message_type", messageType);
    formData.append("content", "");

    await api.post("/chat/messages/attachment", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const handleInputChange = (value) => {
    setInput(value);

    if (selectedConversation?._id && selectedConversation._id !== "ai-bot") {
      socket.emit("typing", {
        conversation_id: selectedConversation._id,
        user: "Business",
      });
    }
  };

  const handleStartCall = () => {
    alert("Tính năng gọi điện sẽ dùng WebRTC. Hiện tại đã có UI nút gọi.");
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      <ChatSidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelect={setSelectedConversation}
        onCreateDemo={handleCreateDemoConversation}
      />

      <ChatWindow
        conversation={selectedConversation}
        messages={messages}
        input={input}
        setInput={handleInputChange}
        onSend={handleSend}
        onSendAttachment={handleSendAttachment}
        onStartCall={handleStartCall}
        currentUserId={CURRENT_USER_ID}
        typingText={typingText}
      />
    </div>
  );
}