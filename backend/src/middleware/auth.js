import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id || decoded._id).select(
      "-password -password_hash"
    );

    if (!user) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Phiên đăng nhập không hợp lệ" });
  }
}