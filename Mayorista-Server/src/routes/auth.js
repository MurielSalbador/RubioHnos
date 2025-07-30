import express from "express";
import { register, login } from "../controllers/authController.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Ruta de verificación de email
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_EMAIL_SECRET);
    const user = await User.findByPk(decoded._id);

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "Cuenta verificada con éxito" });
  } catch (err) {
    res.status(400).json({ message: "Token inválido o expirado" });
  }
});

export default router;
