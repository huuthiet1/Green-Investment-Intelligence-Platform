import express from "express";
import {
  getMe,
  googleCallback,
  googleLogin,
  login,
  register,
  sendOtp,
  verifyOtpLogin,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOtp);
router.post("/verify-otp-login", verifyOtpLogin);
router.get("/google", googleLogin);
router.get("/google/callback", googleCallback);
router.get("/me", protect, getMe);

export default router;