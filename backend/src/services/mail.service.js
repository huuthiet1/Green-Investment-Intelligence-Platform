import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.mail.host,
  port: env.mail.port,
  secure: false,
  auth: env.mail.user && env.mail.pass ? {
    user: env.mail.user,
    pass: env.mail.pass
  } : undefined
});

export async function sendOtpMail(to, otp, purpose = 'login') {
  if (!env.mail.user || !env.mail.pass) {
    console.log(`[MAIL_DISABLED] OTP ${otp} for ${to} (${purpose})`);
    return;
  }

  await transporter.sendMail({
    from: env.mail.from,
    to,
    subject: 'Ma OTP dang nhap Green Investment',
    html: `
      <div style="font-family:Arial,sans-serif">
        <h2>Green Investment Intelligence Platform</h2>
        <p>Ma OTP cua ban cho muc dich <b>${purpose}</b> la:</p>
        <h1 style="letter-spacing:4px">${otp}</h1>
        <p>Ma co hieu luc trong 5 phut.</p>
      </div>
    `
  });
}
