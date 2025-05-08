// Routes untuk autentikasi
import express from "express";
import { register, login, registerPetugas } from "../controllers/authController.js";
import { auth, isPetugas } from "../middlewares/auth.js";

const router = express.Router();

// Route untuk register pelanggan
router.post("/register", register);

// Route untuk login
router.post("/login", login);

// Route untuk register petugas (hanya bisa dilakukan oleh petugas)
router.post("/register/petugas", auth, isPetugas, registerPetugas);

export default router;
