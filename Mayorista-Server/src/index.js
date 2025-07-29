// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";

// rutas
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from './routes/category.routes.js';
import resetPasswordRoutes from "./routes/resetPassword.routes.js";

console.log("Rutas cargadas correctamente");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  if (req.is('application/json')) {
    express.json()(req, res, next);
  } else {
    next();
  }
});

app.use("/uploads", express.static(path.resolve("uploads")));

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/password", resetPasswordRoutes);

const PORT = process.env.PORT || 3000;

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

// Ruta raíz
app.get('/', (req, res) => {
  res.send('El backend con MongoDB funciona correctamente');
});
