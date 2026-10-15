// src/models/categories.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Categories = sequelize.define("Categories", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
});
