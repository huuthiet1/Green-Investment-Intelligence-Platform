import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB kết nối thành công");
  } catch (error) {
    console.error("Lỗi khi kết nối DB:", error.message);
    process.exit(1);
  }
};