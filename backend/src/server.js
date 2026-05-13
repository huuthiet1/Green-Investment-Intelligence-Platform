import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { connectDB } from "./config/db.js";
import { protect, allowRoles } from "./middleware/auth.js";

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

dotenv.config();

const app = express();
const __dirname = path.resolve();
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin:
  process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL
    : "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

// ================= SOCKET.IO =================
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
origin:
  process.env.NODE_ENV === "production"
    ? process.env.CLIENT_URL
    : "http://localhost:5173",    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));



// ================= PUBLIC ROUTES =================
app.get("/", (req, res) => {
  res.send("API đang chạy...");
});

app.get("/api/health", (req, res) => {
  res.json({
    message: "Backend is running",
  });
});

// Auth public
app.use("/api/auth", authRoutes);

// AI bot public hoặc private đều được
app.use("/api/ai-bot", aiBotRoutes);

// ======================================================
// BUSINESS / INVESTOR SHARED PRIVATE ROUTES
// Yêu cầu đăng nhập, dữ liệu sẽ lấy theo req.user trong từng route
// ======================================================

app.use("/api/dashboard", protect, dashboardRoutes);
app.use("/api/business", protect, businessRoutes);
app.use("/api/projects", protect, projectRoutes);
app.use("/api/funding", protect, fundingRoutes);
app.use("/api/chat", protect, chatRoutes);
app.use("/api/esg", protect, esgRoutes);
app.use("/api/reports", protect, reportRoutes);
app.use("/api/documents", protect, documentRoutes);
app.use("/api/analytics", protect, analyticsRoutes);
app.use("/api/notifications", protect, notificationRoutes);
app.use("/api/business-bot", protect, businessBotRoutes);
app.use("/api/matching", protect, matchingRoutes);
app.use("/api/ai-tools", protect, aiToolsRoutes);

// Investor
app.use("/api/investors", protect, investorRoutes);
app.use("/api/investments", protect, investmentRoutes);
app.use("/api/investor-ai", protect, investorAIRoutes);

// ======================================================
// ADMIN PRIVATE ROUTES
// Chỉ admin mới được vào
// ======================================================

app.use("/api/admin", protect, allowRoles("admin"), adminRoutes);
app.use(
  "/api/admin/notifications",
  protect,
  allowRoles("admin"),
  notificationRoutesAdmin
);
app.use("/api/system", protect, allowRoles("admin"), systemRoutes);
app.use("/api/fraud", protect, allowRoles("admin"), fraudRoutes);
app.use("/api/audit-logs", protect, allowRoles("admin"), auditRoutes);
app.use(
  "/api/admin-ai",
  protect,
  allowRoles("admin"),
  adminAIAssistantRoutes
);

// KYC cho business/investor gửi, admin cũng xem được trong route
app.use("/api/kyc", protect, kycRoutes);
// ================= FRONTEND PRODUCTION =================
if (process.env.NODE_ENV === "production") {
  app.use(
    express.static(
      path.join(__dirname, "../frontend/dist")
    )
  );

  app.get("*", (req, res) => {
    res.sendFile(
      path.join(
        __dirname,
        "../frontend/dist/index.html"
      )
    );
  });
}
   

// ================= API 404 =================
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "Route API không tồn tại",
    path: req.originalUrl,
  });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});