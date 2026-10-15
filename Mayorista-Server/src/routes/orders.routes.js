import express from "express";
import {
  getAllOrders,
  createOrder,
  getOrdersByUserEmail,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/ordersController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas protegidas
router.get("/", verifyToken, getAllOrders);
router.get("/user/:email", verifyToken, getOrdersByUserEmail);
router.post("/", verifyToken, createOrder); // ✅ crea pedido y descuenta stock
router.patch("/:id/status", verifyToken, updateOrderStatus);
router.delete("/:id", verifyToken, deleteOrder);

export default router;
