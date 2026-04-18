import nodemailer from "nodemailer";

export const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (to, otp) => {
  await mailTransporter.sendMail({
    from: `"Green Investment Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Mã OTP đăng nhập hệ thống",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Mã OTP đăng nhập</h2>
        <p>Bạn vừa yêu cầu đăng nhập vào hệ thống Green Investment Platform.</p>
        <p>Mã OTP của bạn là:</p>
        <div style="font-size: 28px; font-weight: bold; color: #16a34a; letter-spacing: 4px;">
          ${otp}
        </div>
        <p>Mã có hiệu lực trong 5 phút.</p>
        <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
      </div>
    `,
  });
};