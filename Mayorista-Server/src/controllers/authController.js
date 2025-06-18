import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendEmail from "../utils/sendEmail.js";
import { UserRoles } from "../enums/enums.js";

dotenv.config();

// Parsear correos desde env (separados por coma)
const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
const superadminEmails = (process.env.SUPERADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());

// Registro
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Este email ya se encuentra registrado." });
    }

    const hash = await bcrypt.hash(password, 10);

    let assignedRole = UserRoles.USER;

    if (superadminEmails.includes(email.toLowerCase())) {
      assignedRole = UserRoles.SUPERADMIN;
    } else if (adminEmails.includes(email.toLowerCase())) {
      assignedRole = UserRoles.ADMIN;
    }

    const isTrustedEmail = [...adminEmails, ...superadminEmails].includes(email.toLowerCase());

    const user = await User.create({
      username,
      email,
      password: hash,
      role: assignedRole,
      isVerified: isTrustedEmail,
    });

    if (!isTrustedEmail) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_EMAIL_SECRET, {
        expiresIn: "1d",
      });

      const verifyLink = `${process.env.CLIENT_URL}/verify/${token}`;

      await sendEmail(
        email,
        "Verificá tu cuenta en RubioHnos",
        `<h3>Hola ${username}!</h3>
         <p>Hacé clic en el siguiente enlace para verificar tu cuenta:</p>
         <a href="${verifyLink}">${verifyLink}</a>`
      );
    }

    res.status(201).json({
      message: isTrustedEmail
        ? "Usuario creado exitosamente (BANDEJA DE SPAM!)."
        : "Usuario creado. Revisá tu email para verificar tu cuenta.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar el usuario." });
  }
};

// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    if (
      user.isBlocked === 1 ||
      user.isBlocked === true ||
      user.isBlocked === "1"
    ) {
      return res.status(403).json({ error: "Este usuario está bloqueado." });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: "Tu cuenta no está verificada. Revisá tu email.",
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al iniciar sesión." });
  }
};
