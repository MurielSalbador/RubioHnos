// index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// db
import { sequelize } from "./db.js";           // DB productos
import { sequelize as userDB } from "./dbUser.js"; // DB usuarios

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
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Rutas existentes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use('/api/categories', categoryRoutes);
app.use("/api/password", resetPasswordRoutes);

const PORT = 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await userDB.authenticate();   // autenticar también la base de usuarios

    console.log("Bases de datos conectadas.");

    await sequelize.sync({ alter: true });
    await userDB.sync({ alter: true });

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
};

startServer();
