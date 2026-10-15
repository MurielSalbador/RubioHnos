// routes/user.routes.js
import express from "express";
import {
  getAllUsers,
  updateUserRole,
  toggleBlockUser,
  deleteUser,
} from "../controllers/userController.js";

import {
  verifyToken,
  isSuperAdmin,
  isAdminOrSuperAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Ruta accesible por admin y superAdmin
router.get("/", verifyToken, isAdminOrSuperAdmin, getAllUsers);

// ✅ Estas solo las puede usar el superAdmin
router.put("/:id/role", verifyToken, isSuperAdmin, updateUserRole);
router.put("/:id/block", verifyToken, isSuperAdmin, toggleBlockUser);
router.delete("/:id", verifyToken, isSuperAdmin, deleteUser);

export default router;
