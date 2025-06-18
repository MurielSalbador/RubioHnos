import { Router } from "express";
import { sendResetEmail, resetPassword } from "../controllers/resetPasswordController.js";

const router = Router();

router.post("/forgot-password", sendResetEmail);
router.post("/reset-password", resetPassword);

export default router;
