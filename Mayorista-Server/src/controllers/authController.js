import User from "../mongoModels/user.mongo.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import sendEmail from "../utils/sendEmail.js";
import { UserRoles } from "../enums/enums.js";

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
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });

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

    const isTrustedEmail = [...adminEmails, ...superadminEmails].includes(email.toLowerCase());

    const newUser = new User({
      username,
      email,
      password: hash,
      role: assignedRole,
      isVerified: isTrustedEmail,
    });

    await newUser.save();

    if (!isTrustedEmail) {
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_EMAIL_SECRET, {
        expiresIn: "1d",
      });

     const verifyLink = `${process.env.CLIENT_URL}/verify/${token}`;

      await sendEmail(
        email,
        "Verificá tu cuenta en RubiHnos",
        `<h3>Hola ${username}!</h3>
         <p>Hacé clic en el siguiente enlace para verificar tu cuenta:</p>
         <a href="${verifyLink}">${verifyLink}</a>`
      );
    }

    res.status(201).json({
      message: isTrustedEmail
        ? "Usuario creado exitosamente."
        : "Usuario creado. Revisá tu email para verificar la cuenta.",
    });
  } catch (err) {
    console.error("Registro error:", err);
    res.status(500).json({ error: "Error al registrar el usuario." });
  }
};

// === LOGIN ===
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ error: "Usuario no encontrado." });

    if (user.isBlocked) {
      return res.status(403).json({ error: "Este usuario está bloqueado." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ error: "Tu cuenta no está verificada. Revisá tu email." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Contraseña incorrecta." });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
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

// === VERIFICACIÓN DE EMAIL ===
export const verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    console.log("Token decodificado:", decoded);

    const user = await User.findById(decoded.id);
    console.log("Usuario encontrado:", user);

    if (!user) {
      console.error("Usuario no encontrado para el ID:", decoded.id);
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "La cuenta ya estaba verificada." });
    }

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Cuenta verificada con éxito" });
  } catch (err) {
    console.error("Verificación fallida:", err);
    res.status(400).json({ message: "Token inválido o expirado" });
  }
};

