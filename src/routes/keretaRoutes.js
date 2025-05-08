// Routes untuk kereta
import express from "express";
import {
  getAllKereta,
  getKeretaById,
  createKereta,
  updateKereta,
  deleteKereta,
} from "../controllers/keretaController.js";
import { auth, isPetugas } from "../middlewares/auth.js";

const router = express.Router();

// Route untuk mendapatkan semua kereta
router.get("/", getAllKereta);

// Route untuk mendapatkan kereta berdasarkan ID
router.get("/:id", getKeretaById);

// Route untuk membuat kereta baru (hanya petugas)
router.post("/", auth, isPetugas, createKereta);

// Route untuk mengupdate kereta (hanya petugas)
router.put("/:id", auth, isPetugas, updateKereta);

// Route untuk menghapus kereta (hanya petugas)
router.delete("/:id", auth, isPetugas, deleteKereta);

export default router;
