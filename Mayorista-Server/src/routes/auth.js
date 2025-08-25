import express from "express";
import { register, login } from "../controllers/authController.js";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
