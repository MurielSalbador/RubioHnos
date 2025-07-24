// src/config/dbUser.js
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './RubioHnosUser.sqlite',
  logging: false,
});
