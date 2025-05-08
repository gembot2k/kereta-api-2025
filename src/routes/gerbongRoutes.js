// Routes untuk gerbong
import express from "express";
import {
  getAllGerbong,
  getGerbongById,
  createGerbong,
  updateGerbong,
  deleteGerbong,
} from "../controllers/gerbongController.js";
import { auth, isPetugas } from "../middlewares/auth.js";

const router = express.Router();

// Route untuk mendapatkan semua gerbong
router.get("/", getAllGerbong);

// Route untuk mendapatkan gerbong berdasarkan ID
router.get("/:id", getGerbongById);

// Route untuk membuat gerbong baru (hanya petugas)
router.post("/", auth, isPetugas, createGerbong);

// Route untuk mengupdate gerbong (hanya petugas)
router.put("/:id", auth, isPetugas, updateGerbong);

// Route untuk menghapus gerbong (hanya petugas)
router.delete("/:id", auth, isPetugas, deleteGerbong);

export default router;
