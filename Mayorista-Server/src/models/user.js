import { DataTypes } from "sequelize";
import { sequelize } from "../dbUser.js";
import { UserRoles } from "../enums/enums.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(Object.values(UserRoles)),
      allowNull: false,
      defaultValue: UserRoles.USER,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  isVerified: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},
  },
  {
    timestamps: false,
  }
);

export default User;
