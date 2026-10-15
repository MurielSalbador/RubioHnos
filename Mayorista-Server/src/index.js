// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import multer from "multer";
import compression from "compression";
import rateLimit from "express-rate-limit";

// rutas
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from './routes/category.routes.js';
import resetPasswordRoutes from "./routes/resetPassword.routes.js";
import expensesRoutes from "./routes/expense.routes.js";

import fs from "fs";


const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("📂 Carpeta 'uploads' creada automáticamente");
}

console.log("Rutas cargadas correctamente");

const app = express();

// Render pone un proxy adelante: lo necesitamos para saber la IP real
app.set("trust proxy", 1);

// Límite de intentos para evitar que prueben contraseñas sin parar
// o que llenen de mails a un cliente con "olvidé mi contraseña"
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Esperá unos minutos y probá de nuevo." },
});

// Middleware
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(cors());

// 📂 Servir archivos estáticos
app.use("/uploads", express.static(path.resolve("uploads")));

// Ruta raíz (también sirve para "despertar" el servidor en Render)
app.get('/', (req, res) => {
  res.send('El backend con MongoDB funciona correctamente');
});

// Rutas de la API
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/password", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/password", resetPasswordRoutes);
app.use("/api/expenses", expensesRoutes);


// ⚠️ debe ir DESPUÉS de definir app.use("/api/...")
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message === "Formato de imagen no válido") {
    console.error("❌ Error de Multer:", err.message);
    return res.status(400).json({ error: err.message });
  }

  console.error("❌ Error inesperado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;


// Conectar y lanzar el servidor
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Conectado a MongoDB Atlas");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
  }
};

startServer();


