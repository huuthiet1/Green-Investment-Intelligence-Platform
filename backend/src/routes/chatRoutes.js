import express from "express";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import chatUpload from "../middleware/chatUpload.js";
const router = express.Router();

router.get("/conversations", async (req, res) => {
  try {
    const conversations = await Conversation.find().sort({
      last_message_at: -1,
    });

    res.json({ conversations });
  } catch (error) {
    console.error("GET CONVERSATIONS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/conversations", async (req, res) => {
  try {
    const {
      project_id,
      sender_id = "business-demo",
      receiver_id = "investor-demo",
      title = "Cuộc trò chuyện mới",
    } = req.body || {};

    let conversation = await Conversation.findOne({
      participants: { $all: [sender_id, receiver_id] },
      project_id: project_id || undefined,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        project_id: project_id || undefined,
        participants: [sender_id, receiver_id],
        title,
      });
    }

    res.status(201).json({ conversation });
  } catch (error) {
    console.error("CREATE CONVERSATION ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/conversations/:id/messages", async (req, res) => {
  try {
    const messages = await Message.find({
      conversation_id: req.params.id,
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const {
      conversation_id,
      project_id,
      sender_id = "business-demo",
      receiver_id = "investor-demo",
      content,
      message_type = "text",
      attachment_url = "",
      attachment_name = "",
    } = req.body || {};

    if (!conversation_id) {
      return res.status(400).json({ message: "Thiếu conversation_id" });
    }

    if (!content && !attachment_url) {
      return res.status(400).json({ message: "Tin nhắn không được rỗng" });
    }

    const message = await Message.create({
      conversation_id,
      project_id: project_id || undefined,
      sender_id,
      receiver_id,
      content,
      message_type,
      attachment_url,
    });

    await Conversation.findByIdAndUpdate(conversation_id, {
      last_message: content || "[Tệp đính kèm]",
      last_message_at: new Date(),
    });

    req.app.get("io")?.to(conversation_id).emit("new_message", message);

    res.status(201).json({ message });
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post(
  "/messages/attachment",
  chatUpload.single("file"),
  async (req, res) => {
    try {
      const {
        conversation_id,
        project_id,
        sender_id = "business-demo",
        receiver_id = "investor-demo",
        content = "",
        message_type = "file",
      } = req.body || {};

      if (!conversation_id) {
        return res.status(400).json({ message: "Thiếu conversation_id" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Chưa chọn file" });
      }

      const attachment_url = `/uploads/chat/${req.file.filename}`;

      const message = await Message.create({
        conversation_id,
        project_id: project_id || undefined,
        sender_id,
        receiver_id,
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

router.put("/messages/:id/read", async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      {
        is_read: true,
        read_at: new Date(),
      },
      { new: true }
    );

    res.json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;