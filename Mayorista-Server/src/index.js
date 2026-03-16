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

console.log("🔥 expensesRoutes LOADED");

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log("📂 Carpeta 'uploads' creada automáticamente");
}

console.log("Rutas cargadas correctamente");

const app = express();

// Middleware
app.use(compression());
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  if (req.is('application/json')) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

// 📂 Servir archivos estáticos
app.use("/uploads", express.static(path.resolve("uploads")));

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

// Ruta raíz
app.get('/', (req, res) => {
  res.send('El backend con MongoDB funciona correctamente');
});

// Conectar y lanzar el servidor
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
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


