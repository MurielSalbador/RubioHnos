import express from "express";
import {
  createProduct,
  getAllProducts,
  getUniqueBrands,
  getProductById,
  updateProduct,
  deleteProduct,
  decrementStock,
  decrementMultipleStock,
  getProductsByCategory,
  getProductsByBrand
} from "../controllers/productsController.js";
import { verifyToken, isAdminOrSuperAdmin } from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";



const router = express.Router();


//Ruta actualizar stock
router.put('/decrement-stock',verifyToken, isAdminOrSuperAdmin, decrementStock);


//ruta actualizacion multiple
router.put('/decrement-multiple', verifyToken, isAdminOrSuperAdmin, decrementMultipleStock);


// Rutas públicas
router.get("/", getAllProducts);
router.get("/brands", getUniqueBrands);
router.get("/:id", getProductById);
router.get('/category/:categoryId', getProductsByCategory);
router.get("/brand/:slug", getProductsByBrand);


// Rutas protegidas para admin y superAdmin
router.post("/", verifyToken, isAdminOrSuperAdmin, upload.single("image"), createProduct);
router.put("/:id", verifyToken, isAdminOrSuperAdmin, upload.single("image"), updateProduct);
router.delete("/:id", verifyToken, isAdminOrSuperAdmin, deleteProduct);


export default router;
