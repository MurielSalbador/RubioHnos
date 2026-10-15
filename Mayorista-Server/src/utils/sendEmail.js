import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Un solo "cartero" reutilizable (antes se creaba uno nuevo en cada envío)
let transporter = null;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }
  return transporter;
};

const sendEmail = async (to, subject, html) => {
  await getTransporter().sendMail({
    // Antes decía EMAIL_USER (variable que no existe) y salía "undefined"
    from: `"Rubio Hnos" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
