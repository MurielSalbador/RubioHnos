import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";

const Orders = sequelize.define("orders", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  items: {
    type: DataTypes.JSON, // <-- importante
    allowNull: false,
  },
  total: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pendiente",  // Valor inicial
  },
});

export default Orders;
