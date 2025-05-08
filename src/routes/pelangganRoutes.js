// Routes untuk pelanggan
import express from "express";
import {
  getAllPelanggan,
  getPelangganById,
  updatePelanggan,
  deletePelanggan,
} from "../controllers/pelangganController.js";
import { auth, isPetugas } from "../middlewares/auth.js";

const router = express.Router();

// Route untuk mendapatkan semua pelanggan (hanya petugas)
router.get("/", auth, isPetugas, getAllPelanggan);

// Route untuk mendapatkan pelanggan berdasarkan ID
router.get("/:id", auth, isPetugas, getPelangganById);

// Route untuk mengupdate pelanggan
router.put("/:id", auth, isPetugas, updatePelanggan);

// Route untuk menghapus pelanggan
router.delete("/:id", auth, isPetugas, deletePelanggan);

export default router;
