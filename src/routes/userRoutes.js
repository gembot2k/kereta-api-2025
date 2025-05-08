// Routes untuk user
import express from "express";
import { getProfile, updatePassword } from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Route untuk mendapatkan profil user
router.get("/profile", auth, getProfile);

// Route untuk update password
router.put("/password", auth, updatePassword);

export default router;
