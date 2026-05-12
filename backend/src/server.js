import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";

// ================= BUSINESS ROUTES =================
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import businessRoutes from "./routes/business.js";
import projectRoutes from "./routes/projectRoutes.js";
import fundingRoutes from "./routes/fundingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import aiBotRoutes from "./routes/aiBotRoutes.js";
import investorRoutes from "./routes/investorRoutes.js";
import esgRoutes from "./routes/esgRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import businessBotRoutes from "./routes/businessBotRoutes.js";
import matchingRoutes from "./routes/matchingRoutes.js";
import aiToolsRoutes from "./routes/aiToolsRoutes.js";

// ================= ADMIN ROUTES =================
import adminRoutes from "./routes/adminRoutes.js";
import notificationRoutesAdmin from "./routes/notificationRoutesAdmin.js";
import systemRoutes from "./routes/systemRoutes.js";
import fraudRoutes from "./routes/fraudRoutes.js";
import kycRoutes from "./routes/kycRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import adminAIAssistantRoutes from "./routes/adminAIAssistantRoutes.js";

// ================= INVESTOR ROUTES =================
import investmentRoutes from "./routes/investmentRoutes.js";
import investorAIRoutes from "./routes/investorAIRoutes.js";

// ================= ENV CONFIG =================
dotenv.config();

// ================= APP INIT =================
const app = express();

connectDB();

// ================= HTTP + SOCKET SERVER =================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

// ================= SOCKET.IO EVENTS =================
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined ${conversationId}`);
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on("typing", ({ conversation_id, user }) => {
    socket.to(conversation_id).emit("typing", { user });
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// ================= GLOBAL MIDDLEWARE =================
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cho phép frontend xem file upload
app.use("/uploads", express.static("uploads"));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("API đang chạy...");
});

app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

// ======================================================
// ===================== BUSINESS API ====================
// ======================================================

// Đăng nhập / đăng ký
app.use("/api/auth", authRoutes);

// Dashboard business
app.use("/api/dashboard", dashboardRoutes);

// Business profile / business info
app.use("/api/business", businessRoutes);

// Dự án
// Frontend gọi: /api/projects
app.use("/api/projects", projectRoutes);

// Gọi vốn
// Frontend gọi: /api/funding
app.use("/api/funding", fundingRoutes);

// Chat realtime business ↔ investor
// Frontend gọi: /api/chat
app.use("/api/chat", chatRoutes);

// AI bot chat chung
// Frontend gọi: /api/ai-bot
app.use("/api/ai-bot", aiBotRoutes);

// Investor interest / favorite
// Frontend gọi: /api/investors
app.use("/api/investors", investorRoutes);

// ESG
// Frontend gọi: /api/esg
app.use("/api/esg", esgRoutes);

// Báo cáo
// Frontend gọi: /api/reports
app.use("/api/reports", reportRoutes);

// Tài liệu dự án
// Frontend gọi: /api/documents
app.use("/api/documents", documentRoutes);

// Analytics business
// Frontend gọi: /api/analytics
app.use("/api/analytics", analyticsRoutes);

// Notification business
// Frontend gọi: /api/notifications
app.use("/api/notifications", notificationRoutes);

// Business AI bot riêng
// Frontend gọi: /api/business-bot
app.use("/api/business-bot", businessBotRoutes);

// AI matching investor
// Frontend gọi: /api/matching
app.use("/api/matching", matchingRoutes);

// AI tools business
// Frontend gọi: /api/ai-tools
app.use("/api/ai-tools", aiToolsRoutes);

// ======================================================
// ===================== INVESTOR API ====================
// ======================================================

// Investor góp vốn
// Frontend gọi: /api/investments
app.use("/api/investments", investmentRoutes);

// Investor AI tư vấn đầu tư
// Frontend gọi: /api/investor-ai
app.use("/api/investor-ai", investorAIRoutes);

// ======================================================
// ======================= ADMIN API =====================
// ======================================================

// Admin dashboard / users / projects / reports
// Frontend gọi: /api/admin
app.use("/api/admin", adminRoutes);

// Notification riêng cho admin
// Frontend gọi: /api/admin/notifications
app.use("/api/admin/notifications", notificationRoutesAdmin);

// System settings
// Frontend gọi: /api/system/settings
app.use("/api/system", systemRoutes);

// AI Fraud Detection
// Frontend gọi: /api/fraud
app.use("/api/fraud", fraudRoutes);

// KYC Verification
// Frontend gọi: /api/kyc
app.use("/api/kyc", kycRoutes);

// Audit logs
// Frontend gọi: /api/audit-logs
app.use("/api/audit-logs", auditRoutes);

// Admin AI Assistant
// Frontend gọi: /api/admin-ai/chat
app.use("/api/admin-ai", adminAIAssistantRoutes);

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({
    message: "Route không tồn tại",
    path: req.originalUrl,
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});