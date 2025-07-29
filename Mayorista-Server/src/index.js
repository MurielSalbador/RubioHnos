// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";

import mongoose from "mongoose";  // <-- Importar mongoose

// db
import { sequelize } from "./db.js";           // DB productos (SQL)
import { sequelize as userDB } from "./dbUser.js"; // DB usuarios (SQL)
import { seedProducts } from './seeders/seedProducts.js';

// rutas
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.routes.js";
import orderRoutes from "./routes/orders.routes.js";
import userRoutes from "./routes/user.routes.js";
import categoryRoutes from './routes/category.routes.js';
import resetPasswordRoutes from "./routes/resetPassword.routes.js";

// modelos
import { Products } from "./models/products.js";
import { Categories } from "./models/categories.js";
import "./models/user.js";

// asociaciones
Categories.hasMany(Products, { foreignKey: "categoryId" });
Products.belongsTo(Categories, { foreignKey: "categoryId" });

console.log("Reset password routes cargadas");

const app = express();
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

// Rutas existentes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/password", resetPasswordRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Conectar a MongoDB Atlas con Mongoose
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("✅ Conectado a MongoDB Atlas");

    // Autenticar Sequelize bases SQL
    await sequelize.authenticate();
    await userDB.authenticate();

    console.log("Bases de datos SQL conectadas.");

    // Sincronizar esquemas y sembrar productos
    await sequelize.sync({ alter: true });
    await userDB.sync({ alter: true });
    await seedProducts();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
};

startServer();

app.get('/', (req, res) => {
  res.send('El backend funciona');
});