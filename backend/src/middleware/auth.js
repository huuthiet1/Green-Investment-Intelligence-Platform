import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    let token = "";

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "Chưa đăng nhập",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id || decoded.userId;

    const user = await User.findById(userId).select("-password -password_hash");

    if (!user) {
      return res.status(401).json({
        message: "Token không hợp lệ",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Phiên đăng nhập không hợp lệ",
    });
  }
}

export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: "Chưa đăng nhập",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Không có quyền truy cập",
      });
    }

    next();
  };
}