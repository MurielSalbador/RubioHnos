// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import multer from "multer";
import compression from "compression";

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


