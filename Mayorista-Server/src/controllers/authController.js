import User from "../mongoModels/user.mongo.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendEmail from "../utils/sendEmail.js";
import { UserRoles } from "../enums/enums.js";
import { getJwtSecret } from "../middlewares/authMiddleware.js";

const escapeRegex = (text = "") => String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// Busca el email sin importar mayúsculas (hay usuarios viejos guardados con mayúsculas)
const findByEmail = (email) =>
  User.findOne({ email: new RegExp(`^${escapeRegex(email)}$`, "i") });

dotenv.config();

// Parsear emails de rol desde .env
const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map(e => e.trim().toLowerCase());

const superadminEmails = (process.env.SUPERADMIN_EMAILS || "")
  .split(",")
  .map(e => e.trim().toLowerCase());

// === REGISTRO ===
export const register = async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const email = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Completá nombre, email y contraseña." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "El email no es válido." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
  }

  try {
    const existingUser = await findByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: "Este email ya está registrado." });
    }

    const hash = await bcrypt.hash(password, 10);

    let assignedRole = UserRoles.USER;

    if (superadminEmails.includes(email.toLowerCase())) {
      assignedRole = UserRoles.SUPERADMIN;
    } else if (adminEmails.includes(email.toLowerCase())) {
      assignedRole = UserRoles.ADMIN;
    }

    const newUser = new User({
      username,
      email,
      password: hash,
      role: assignedRole,
      isVerified: true, // 🔹 Siempre se registra como verificado
    });

    await newUser.save();

    res.status(201).json({ message: "Usuario creado exitosamente." });
  } catch (err) {
    console.error("Registro error:", err);
    res.status(500).json({ error: "Error al registrar el usuario." });
  }
};

// === LOGIN ===
export const login = async (req, res) => {
  const email = String(req.body?.email || "").trim();
  const password = String(req.body?.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "Completá email y contraseña." });
  }

  try {
    const user = await findByEmail(email);

    if (!user) return res.status(401).json({ error: "Usuario no encontrado." });

    if (user.isBlocked) {
      return res.status(403).json({ error: "Este usuario está bloqueado." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta." });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Error al iniciar sesión." });
  }
};

