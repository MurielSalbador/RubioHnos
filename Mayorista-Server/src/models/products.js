// src/models/products.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

export const Products = sequelize.define('Products', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  // categoryId: {
  //   type: DataTypes.INTEGER,
  //   references: {
  //     model: 'Categories',
  //     key: 'id',
  //   },
  // },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
});

