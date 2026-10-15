import nodemailer from "nodemailer";
import User from "../mongoModels/user.mongo.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import { getJwtSecret } from "../middlewares/authMiddleware.js";

dotenv.config();

const escapeRegex = (text = "") => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// El token de recuperación incluye parte del hash actual de la contraseña:
// así el enlace deja de servir apenas se usa (antes se podía reutilizar
// durante 1 hora) y no puede confundirse con un token de sesión.
const passwordFingerprint = (user) => String(user.password).slice(-12);

// Enviar email de recuperación
export const sendResetEmail = async (req, res) => {
  const email = String(req.body?.email || "").trim();

  try {
    if (!email) return res.status(400).json({ error: "Ingresá tu email." });

    const user = await User.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, "i") });
    if (!user) {
      return res.status(200).json({ message: "Si el correo está registrado, te enviamos un enlace." });
    }

    const token = jwt.sign(
      { id: user._id, purpose: "reset", fp: passwordFingerprint(user) },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;


    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: user.email,
      subject: "Restablecer contraseña",
      html: `
        <p>Hola ${user.username},</p>
        <p>Hacé clic en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este enlace vence en 1 hora.</p>
      `,
    };

    try {
  await transporter.sendMail(mailOptions);
  console.log("[sendResetEmail] Correo enviado correctamente");
} catch (err) {
  console.error("[sendResetEmail] Error al enviar:", err);
  return res.status(500).json({ error: "No se pudo enviar el correo." });
}


    res.status(200).json({ message: "Correo de recuperación enviado." });

  } catch (error) {
    console.error("[sendResetEmail] Error:", error);
    res.status(500).json({ error: "Error al enviar el correo de recuperación." });
  }
};

// Cambiar contraseña usando token
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres." });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (decoded.purpose !== "reset") {
      return res.status(400).json({ error: "Token inválido o expirado." });
    }

    const user = await User.findById(decoded.id);
    if (!user || decoded.fp !== passwordFingerprint(user)) {
      return res.status(400).json({ error: "Este enlace ya fue usado o venció. Pedí uno nuevo." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Contraseña actualizada correctamente." });

  } catch (error) {
    console.error("[resetPassword] Error:", error);
    res.status(400).json({ error: "Token inválido o expirado." });
  }
};
