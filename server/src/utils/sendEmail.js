// File: utils/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1. Khởi tạo transporter (Lấy thông tin từ .env)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // 2. Cấu hình email
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html, // Dùng HTML nếu có, không thì thôi
    attachments: options.attachments
  };

  // 3. Gửi
  const info = await transporter.sendMail(message);
  console.log("Email sent ID: %s", info.messageId);
};

export default sendEmail;