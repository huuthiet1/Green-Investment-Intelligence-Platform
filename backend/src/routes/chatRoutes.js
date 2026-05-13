import express from "express";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import Project from "../models/Project.js";
import chatUpload from "../middleware/chatUpload.js";

const router = express.Router();

function currentUserId(req) {
  return req.user._id.toString();
}

function isParticipant(conversation, userId) {
  return conversation.participants.map(String).includes(String(userId));
}

// ======================================================
// GET MY CONVERSATIONS
// API: GET /api/chat/conversations
// ======================================================

router.get("/conversations", async (req, res) => {
  try {
    const userId = currentUserId(req);

    const conversations = await Conversation.find({
      participants: userId,
    }).sort({
      last_message_at: -1,
    });

    res.json({ conversations });
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ======================================================
// CREATE / GET CONVERSATION
// API: POST /api/chat/conversations
// Body: { project_id, receiver_id, title }
// ======================================================

router.post("/conversations", async (req, res) => {
  try {
    const senderId = currentUserId(req);

    const {
      project_id,
      receiver_id,
      title = "Cuộc trò chuyện mới",
    } = req.body || {};

    if (!receiver_id) {
      return res.status(400).json({
        message: "Thiếu receiver_id",
      });
    }

    let projectId = undefined;

    if (project_id) {
      if (!mongoose.Types.ObjectId.isValid(project_id)) {
        return res.status(400).json({
          message: "project_id không hợp lệ",
        });
      }

      projectId = project_id;
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiver_id],
      },
      project_id: projectId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        project_id: projectId,
        participants: [senderId, receiver_id],
        title,
        last_message: "",
        last_message_at: new Date(),
      });
    }

    res.status(201).json({ conversation });
  } catch (error) {
    console.error("CREATE CONVERSATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ======================================================
// CREATE CONVERSATION BY PROJECT OWNER
// Investor chỉ cần gửi project_id, backend tự tìm owner
// API: POST /api/chat/conversations/project
// Body: { project_id }
// ======================================================

router.post("/conversations/project", async (req, res) => {
  try {
    const senderId = currentUserId(req);
    const { project_id } = req.body || {};

    if (!project_id) {
      return res.status(400).json({
        message: "Thiếu project_id",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(project_id)) {
      return res.status(400).json({
        message: "project_id không hợp lệ",
      });
    }

    const project = await Project.findById(project_id);

    if (!project) {
      return res.status(404).json({
        message: "Không tìm thấy dự án",
      });
    }

    const receiverId = project.owner_id?.toString();

    if (!receiverId) {
      return res.status(400).json({
        message: "Dự án chưa có owner_id",
      });
    }

    if (receiverId === senderId) {
      return res.status(400).json({
        message: "Bạn không thể chat với chính mình",
      });
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
      project_id,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        project_id,
        participants: [senderId, receiverId],
        title: `Trao đổi đầu tư - ${project.title || "Dự án"}`,
        last_message: "",
        last_message_at: new Date(),
      });
    }

    res.status(201).json({ conversation });
  } catch (error) {
    console.error("CREATE PROJECT CONVERSATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ======================================================
// GET MESSAGES OF MY CONVERSATION
// API: GET /api/chat/conversations/:id/messages
// ======================================================

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const userId = currentUserId(req);

    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    if (!isParticipant(conversation, userId)) {
      return res.status(403).json({
        message: "Không có quyền xem cuộc trò chuyện này",
      });
    }

    const messages = await Message.find({
      conversation_id: req.params.id,
    }).sort({
      createdAt: 1,
    });

    res.json({ messages });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ======================================================
// SEND TEXT MESSAGE
// API: POST /api/chat/messages
// Body: { conversation_id, content }
// ======================================================

router.post("/messages", async (req, res) => {
  try {
    const senderId = currentUserId(req);

    const {
      conversation_id,
      content,
      message_type = "text",
    } = req.body || {};

    if (!conversation_id) {
      return res.status(400).json({
        message: "Thiếu conversation_id",
      });
    }

    if (!content) {
      return res.status(400).json({
        message: "Tin nhắn không được rỗng",
      });
    }

    const conversation = await Conversation.findById(conversation_id);

    if (!conversation) {
      return res.status(404).json({
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    if (!isParticipant(conversation, senderId)) {
      return res.status(403).json({
        message: "Không có quyền gửi tin nhắn trong cuộc trò chuyện này",
      });
    }

    const receiverId = conversation.participants
      .map(String)
      .find((id) => id !== senderId);

    const message = await Message.create({
      conversation_id,
      project_id: conversation.project_id || undefined,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      message_type,
      attachment_url: "",
      attachment_name: "",
    });

    await Conversation.findByIdAndUpdate(conversation_id, {
      last_message: content,
      last_message_at: new Date(),
    });

    req.app.get("io")?.to(conversation_id).emit("new_message", message);

    res.status(201).json({ message });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

// ======================================================
// SEND ATTACHMENT MESSAGE
// API: POST /api/chat/messages/attachment
// FormData: file, conversation_id, message_type
// ======================================================

router.post(
  "/messages/attachment",
  chatUpload.single("file"),
  async (req, res) => {
    try {
      const senderId = currentUserId(req);

      const {
        conversation_id,
        content = "",
        message_type = "file",
      } = req.body || {};

      if (!conversation_id) {
        return res.status(400).json({
          message: "Thiếu conversation_id",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Chưa chọn file",
        });
      }

      const conversation = await Conversation.findById(conversation_id);

      if (!conversation) {
        return res.status(404).json({
          message: "Không tìm thấy cuộc trò chuyện",
        });
      }

      if (!isParticipant(conversation, senderId)) {
        return res.status(403).json({
          message: "Không có quyền gửi file trong cuộc trò chuyện này",
        });
      }

      const receiverId = conversation.participants
        .map(String)
        .find((id) => id !== senderId);

      const attachment_url = `/uploads/chat/${req.file.filename}`;

      const message = await Message.create({
        conversation_id,
        project_id: conversation.project_id || undefined,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
        message_type,
        attachment_url,
        attachment_name: req.file.originalname,
      });

      await Conversation.findByIdAndUpdate(conversation_id, {
        last_message:
          message_type === "image"
            ? "[Hình ảnh]"
            : message_type === "audio"
            ? "[Ghi âm]"
            : "[Tệp đính kèm]",
        last_message_at: new Date(),
      });

      req.app.get("io")?.to(conversation_id).emit("new_message", message);

      res.status(201).json({ message });
    } catch (error) {
      console.error("SEND ATTACHMENT ERROR:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// ======================================================
// MARK MESSAGE READ
// API: PUT /api/chat/messages/:id/read
// ======================================================

router.put("/messages/:id/read", async (req, res) => {
  try {
    const userId = currentUserId(req);

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        message: "Không tìm thấy tin nhắn",
      });
    }

    if (String(message.receiver_id) !== userId) {
      return res.status(403).json({
        message: "Không có quyền đánh dấu đã đọc",
      });
    }

    message.is_read = true;
    message.read_at = new Date();

    await message.save();

    res.json({ message });
  } catch (error) {
    console.error("READ MESSAGE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;