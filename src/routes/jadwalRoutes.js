// Routes untuk jadwal
import express from "express";
import {
  getAllJadwal,
  getJadwalById,
  searchJadwal,
  createJadwal,
  updateJadwal,
  deleteJadwal,
} from "../controllers/jadwalController.js";
import { auth, isPetugas } from "../middlewares/auth.js";

const router = express.Router();

// Route untuk mendapatkan semua jadwal
router.get("/", getAllJadwal);

// Route untuk mencari jadwal berdasarkan filter
router.get("/search", searchJadwal);

// Route untuk mendapatkan jadwal berdasarkan ID
router.get("/:id", getJadwalById);

// Route untuk membuat jadwal baru (hanya petugas)
router.post("/", auth, isPetugas, createJadwal);

// Route untuk mengupdate jadwal (hanya petugas)
router.put("/:id", auth, isPetugas, updateJadwal);

// Route untuk menghapus jadwal (hanya petugas)
router.delete("/:id", auth, isPetugas, deleteJadwal);

export default router;
