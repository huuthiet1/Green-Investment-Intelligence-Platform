import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import EmailOTP from "../models/EmailOTP.js";
import { sendOTPEmail } from "../config/mail.js";
import { googleClient } from "../config/google.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const buildUserResponse = (user) => ({
  id: user._id,
  full_name: user.full_name,
  email: user.email,
  phone: user.phone,
  organization_name: user.organization_name,
  role: user.role,
  avatar_url: user.avatar_url,
  is_verified: user.is_verified,
  status: user.status,
  login_provider: user.login_provider,
});

export const register = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      organization_name,
      password,
      role,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    const allowedRoles = ["investor", "business"];
    const finalRole = allowedRoles.includes(role) ? role : "investor";

    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return res.status(400).json({
        message: "Email đã tồn tại",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      full_name,
      email: email.toLowerCase(),
      phone,
      organization_name,
      password: hashedPassword,
      role: finalRole,
      login_provider: "local",
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Đăng ký thành công",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server khi đăng ký",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(400).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Tài khoản hiện không hoạt động",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Tài khoản này không hỗ trợ đăng nhập bằng mật khẩu",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Email hoặc mật khẩu không đúng",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server khi đăng nhập",
      error: error.message,
    });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        message: "Vui lòng nhập email",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await EmailOTP.updateMany(
      { email: normalizedEmail, purpose: "login", is_used: false },
      { $set: { is_used: true } }
    );

    await EmailOTP.create({
      email: normalizedEmail,
      otp_code: otp,
      purpose: "login",
      expires_at: expiresAt,
    });

    await sendOTPEmail(normalizedEmail, otp);

    return res.status(200).json({
      message: "Mã OTP đã được gửi về email của bạn",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi gửi OTP",
      error: error.message,
    });
  }
};

export const verifyOtpLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Vui lòng nhập email và mã OTP",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpDoc = await EmailOTP.findOne({
      email: normalizedEmail,
      otp_code: otp,
      purpose: "login",
      is_used: false,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        message: "Mã OTP không hợp lệ",
      });
    }

    if (otpDoc.expires_at < new Date()) {
      return res.status(400).json({
        message: "Mã OTP đã hết hạn",
      });
    }

    otpDoc.is_used = true;
    await otpDoc.save();

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      user = await User.create({
        full_name: normalizedEmail.split("@")[0],
        email: normalizedEmail,
        password: "",
        role: "investor",
        login_provider: "otp",
        is_verified: true,
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        message: "Tài khoản hiện không hoạt động",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Đăng nhập OTP thành công",
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi khi xác thực OTP",
      error: error.message,
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
      process.env.GOOGLE_CLIENT_ID
    }&redirect_uri=${encodeURIComponent(
      process.env.GOOGLE_CALLBACK_URL
    )}&response_type=code&scope=${encodeURIComponent(
      "openid email profile"
    )}&access_type=offline&prompt=consent`;

    return res.redirect(redirectUri);
  } catch (error) {
    return res.status(500).json({
      message: "Không thể khởi tạo đăng nhập Google",
      error: error.message,
    });
  }
};

export const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send("Thiếu mã xác thực từ Google");
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.id_token) {
      return res.status(400).send("Không lấy được id_token từ Google");
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: tokenData.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload.email?.toLowerCase();
    const fullName = payload.name || "Google User";
    const avatar = payload.picture || "";
    const googleId = payload.sub;

    if (!email) {
      return res.status(400).send("Không lấy được email từ Google");
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        full_name: fullName,
        email,
        password: "",
        role: "investor",
        avatar_url: avatar,
        google_id: googleId,
        login_provider: "google",
        is_verified: true,
      });
    } else {
      if (!user.google_id) user.google_id = googleId;
      if (!user.avatar_url) user.avatar_url = avatar;
      user.login_provider = "google";
      await user.save();
    }

    const token = generateToken(user._id);
    const redirectUrl = `${process.env.CLIENT_URL}/login?token=${token}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    return res.status(500).send(`Google login error: ${error.message}`);
  }
};

export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
};