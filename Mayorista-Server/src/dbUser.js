// src/config/dbUser.js
import { Sequelize } from "sequelize";

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './PetCareShop_User.sqlite',
  logging: false,
});
