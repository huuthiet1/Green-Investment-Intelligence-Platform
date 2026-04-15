import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB ket noi thanh cong'); // ✔️ đúng
  } catch (error) {
    console.log('Lỗi khi kết nối DB', error);
    process.exit(1);
  }
};