import nodemailer from "nodemailer";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

// Enviar el email de recuperación
export const sendResetEmail = async (req, res) => {
  const { email } = req.body;

  try {
    console.log("[sendResetEmail] Recibido email:", email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("[sendResetEmail] Usuario no encontrado.");
      return res.status(200).json({ message: "Si el correo está registrado, te enviamos un enlace." });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "rubio2025", { expiresIn: "1h" });
    console.log("[sendResetEmail] Token generado:", token);

    const resetLink = `http://localhost:5173/reset-password/${token}`;
    console.log("[sendResetEmail] Enlace de reset:", resetLink);

    console.log("MAIL_USER:", process.env.MAIL_USER);
    console.log("MAIL_PASS:", process.env.MAIL_PASS);
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    console.log("[sendResetEmail] Transporter creado");

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Restablecer contraseña",
      html: `
        <p>Hola ${user.username},</p>
        <p>Hacé clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este enlace vence en 1 hora.</p>
      `,
    };

    console.log("[sendResetEmail] Opciones de mail listas");

    await transporter.sendMail(mailOptions);
    console.log("[sendResetEmail] Correo enviado");

    res.status(200).json({ message: "Correo de recuperación enviado." });

  } catch (error) {
    console.error("[sendResetEmail] Error:", error);
    res.status(500).json({ error: "Error al enviar el correo de recuperación." });
  }
};

// Cambiar la contraseña con token válido
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "rubio2025");
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(400).json({ error: "Usuario no encontrado." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada correctamente." });

  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Token inválido o expirado." });
  }
};