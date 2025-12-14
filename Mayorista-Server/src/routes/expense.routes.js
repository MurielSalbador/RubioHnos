

import { Router } from "express";
import {
  createExpense,
  getExpenses,
  updateExpenseStatus,
} from "../controllers/expense.controller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { isAdminOrSuperAdmin } from "../middlewares/role.middleware.js";

const router = Router();
console.log("🔥 expense.routes.js cargado");


// GET /api/expenses
router.get("/", verifyToken, isAdminOrSuperAdmin, getExpenses);

// POST /api/expenses
router.post("/", verifyToken, isAdminOrSuperAdmin, createExpense);

// PATCH /api/expenses/:id
router.patch("/:id", verifyToken, isAdminOrSuperAdmin, updateExpenseStatus);

export default router;
