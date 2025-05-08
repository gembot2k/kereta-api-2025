// Routes untuk petugas
import express from "express";
import {
  getAllPetugas,
  getPetugasById,
  updatePetugas,
  deletePetugas,
} from "../controllers/petugasController.js";
import { auth, isPetugas } from "../middlewares/auth.js";

const router = express.Router();

// Route untuk mendapatkan semua petugas (hanya petugas)
router.get("/", auth, isPetugas, getAllPetugas);

// Route untuk mendapatkan petugas berdasarkan ID
router.get("/:id", auth, isPetugas, getPetugasById);

// Route untuk mengupdate petugas
router.put("/:id", auth, isPetugas, updatePetugas);

// Route untuk menghapus petugas
router.delete("/:id", auth, isPetugas, deletePetugas);

export default router;
