import express from "express";
import { getAllCategories, createCategory } from "../controllers/categoryController.js";
import { verifyToken, isAdminOrSuperAdmin } from "../middlewares/authMiddleware.js"; 

const router = express.Router();

router.get("/", getAllCategories);

// 👇 protegé la ruta POST como hiciste en productos
router.post("/", verifyToken, isAdminOrSuperAdmin, createCategory);

export default router;
