import React, { useEffect, useMemo, useState } from "react";
import api from "../../lib/axios";
import socket from "../../lib/socket";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

const AI_CONVERSATION = {
  _id: "ai-bot",
  title: "AI Tư vấn đầu tư xanh",
  last_message:
    "Hỏi tôi về ESG, gọi vốn, ROI, rủi ro...",
  is_ai: true,
};

export default function ChatPage({
  mode = "business",
}) {
  // ======================================================
  // CURRENT LOGIN USER
  // ======================================================

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "{}"
      );
    } catch {
      return {};
    }
  }, []);

  const CURRENT_USER_ID =
    currentUser?._id ||
    currentUser?.id ||
    "";

  // ======================================================
  // STATE
  // ======================================================

  const [conversations, setConversations] =
    useState([AI_CONVERSATION]);

  const [
    selectedConversation,
    setSelectedConversation,
  ] = useState(AI_CONVERSATION);

  const [messages, setMessages] = useState([
    {
      _id: "ai-welcome",
      conversation_id: "ai-bot",
      sender_id: "ai-bot",
      receiver_id: CURRENT_USER_ID,
      content:
        "Xin chào! Tôi là trợ lý AI đầu tư xanh. Bạn có thể hỏi tôi về ESG, ROI, rủi ro hoặc chiến lược gọi vốn.",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState("");
  const [typingText, setTypingText] =
    useState("");

  // ======================================================
  // FETCH CONVERSATIONS
  // ======================================================

  const fetchConversations = async () => {
    try {
      const res = await api.get(
        "/chat/conversations"
      );

      const realConversations =
        res.data.conversations || [];

      setConversations([
        AI_CONVERSATION,
        ...realConversations,
      ]);
    } catch (error) {
      console.error(
        "FETCH CONVERSATIONS ERROR:",
        error
      );

      setConversations([AI_CONVERSATION]);
    }
  };

  // ======================================================
  // FETCH MESSAGES
  // ======================================================

  const fetchMessages = async (
    conversationId
  ) => {
    if (conversationId === "ai-bot")
      return;

    try {
      const res = await api.get(
        `/chat/conversations/${conversationId}/messages`
      );

      setMessages(res.data.messages || []);
    } catch (error) {
      console.error(
        "FETCH MESSAGES ERROR:",
        error
      );
    }
  };

  // ======================================================
  // INIT
  // ======================================================

  useEffect(() => {
    fetchConversations();
  }, []);

  // ======================================================
  // SOCKET + LOAD MESSAGE
  // ======================================================

  useEffect(() => {
    if (!selectedConversation?._id) return;

    // ================= AI BOT =================

    if (
      selectedConversation._id === "ai-bot"
    ) {
      setMessages([
        {
          _id: "ai-welcome",
          conversation_id: "ai-bot",
          sender_id: "ai-bot",
          receiver_id: CURRENT_USER_ID,
          content:
            "Xin chào! Tôi là trợ lý AI đầu tư xanh. Bạn có thể hỏi tôi về ESG, ROI, rủi ro hoặc chiến lược gọi vốn.",
          createdAt:
            new Date().toISOString(),
        },
      ]);

      return;
    }

    // ================= REAL CHAT =================

    socket.emit(
      "join_conversation",
      selectedConversation._id
    );

    fetchMessages(
      selectedConversation._id
    );

    const handleNewMessage = (
      message
    ) => {
      if (
        message.conversation_id ===
        selectedConversation._id
      ) {
        setMessages((prev) => [
          ...prev,
          message,
        ]);
      }

      fetchConversations();
    };

    const handleTyping = ({
      user,
    }) => {
      setTypingText(
        `${user || "Người dùng"} đang nhập...`
      );

      setTimeout(() => {
        setTypingText("");
      }, 1200);
    };

    socket.on(
      "new_message",
      handleNewMessage
    );

    socket.on(
      "typing",
      handleTyping
    );

    return () => {
      socket.emit(
        "leave_conversation",
        selectedConversation._id
      );

      socket.off(
        "new_message",
        handleNewMessage
      );

      socket.off(
        "typing",
        handleTyping
      );
    };
  }, [
    selectedConversation,
    CURRENT_USER_ID,
  ]);

  // ======================================================
  // AI CHAT
  // ======================================================

  const handleSendToAI = async (
    content
  ) => {
    const userMessage = {
      _id: `user-${Date.now()}`,
      conversation_id: "ai-bot",
      sender_id: CURRENT_USER_ID,
      receiver_id: "ai-bot",
      content,
      message_type: "text",
      createdAt:
        new Date().toISOString(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setTypingText(
      "AI đang phân tích..."
    );

    try {
      const res = await api.post(
        "/ai-bot/ask",
        {
          message: content,
          role: mode,
        }
      );

      const botMessage = {
        _id: `bot-${Date.now()}`,
        conversation_id: "ai-bot",
        sender_id: "ai-bot",
        receiver_id: CURRENT_USER_ID,
        content:
          res.data.reply ||
          "AI chưa có phản hồi.",
        message_type: "text",
        createdAt:
          new Date().toISOString(),
      };

      setMessages((prev) => [
        ...prev,
        botMessage,
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          _id: `bot-error-${Date.now()}`,
          conversation_id: "ai-bot",
          sender_id: "ai-bot",
          receiver_id: CURRENT_USER_ID,
          content:
            error.response?.data
              ?.message ||
            "AI đang gặp lỗi.",
          message_type: "text",
          createdAt:
            new Date().toISOString(),
        },
      ]);
    } finally {
      setTypingText("");
    }
  };

  // ======================================================
  // SEND TEXT MESSAGE
  // ======================================================

  const handleSend = async (e) => {
    e.preventDefault();

    if (
      !input.trim() ||
      !selectedConversation?._id
    )
      return;

    const content = input.trim();

    setInput("");

    // ================= AI =================

    if (
      selectedConversation._id === "ai-bot"
    ) {
      await handleSendToAI(content);
      return;
    }

    // ================= REAL MESSAGE =================

    try {
      await api.post(
        "/chat/messages",
        {
          conversation_id:
            selectedConversation._id,
          content,
          message_type: "text",
        }
      );
    } catch (error) {
      console.error(
        "SEND MESSAGE ERROR:",
        error
      );
    }
  };

  // ======================================================
  // SEND ATTACHMENT
  // ======================================================

  const handleSendAttachment =
    async (file, messageType) => {
      if (
        !selectedConversation?._id
      )
        return;

      if (
        selectedConversation._id ===
        "ai-bot"
      ) {
        setMessages((prev) => [
          ...prev,
          {
            _id: `ai-warning-${Date.now()}`,
            conversation_id:
              "ai-bot",
            sender_id: "ai-bot",
            receiver_id:
              CURRENT_USER_ID,
            content:
              "AI bot hiện chỉ hỗ trợ văn bản.",
            message_type: "text",
            createdAt:
              new Date().toISOString(),
          },
        ]);

        return;
      }

      try {
        const formData =
          new FormData();

        formData.append(
          "file",
          file
        );

        formData.append(
          "conversation_id",
          selectedConversation._id
        );

        formData.append(
          "message_type",
          messageType
        );

        formData.append(
          "content",
          ""
        );

        await api.post(
          "/chat/messages/attachment",
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );
      } catch (error) {
        console.error(
          "SEND ATTACHMENT ERROR:",
          error
        );
      }
    };

  // ======================================================
  // TYPING
  // ======================================================

  const handleInputChange = (
    value
  ) => {
    setInput(value);

    if (
      selectedConversation?._id &&
      selectedConversation._id !==
        "ai-bot"
    ) {
      socket.emit("typing", {
        conversation_id:
          selectedConversation._id,

        user:
          currentUser?.name ||
          currentUser?.full_name ||
          currentUser?.email ||
          "Người dùng",
      });
    }
  };

  // ======================================================
  // CALL
  // ======================================================

  const handleStartCall = () => {
    alert(
      "Tính năng WebRTC video/audio call sẽ phát triển tiếp."
    );
  };

  // ======================================================
  // UI
  // ======================================================

  return (
  <div className="flex h-full min-h-0 bg-slate-950 text-white">
      <ChatSidebar
        conversations={
          conversations
        }
        selectedConversation={
          selectedConversation
        }
        onSelect={
          setSelectedConversation
        }
      />

      <ChatWindow
        conversation={
          selectedConversation
        }
        messages={messages}
        input={input}
        setInput={
          handleInputChange
        }
        onSend={handleSend}
        onSendAttachment={
          handleSendAttachment
        }
        onStartCall={
          handleStartCall
        }
        currentUserId={
          CURRENT_USER_ID
        }
        typingText={typingText}
      />
    </div>
  );
}