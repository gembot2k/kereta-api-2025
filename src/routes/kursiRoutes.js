// Routes untuk kursi
import express from "express";
import { getAllKursi, getKursiById, getAvailableKursi } from "../controllers/kursiController.js";

const router = express.Router();

// Route untuk mendapatkan semua kursi
router.get("/", getAllKursi);

// Route untuk mendapatkan kursi berdasarkan ID
router.get("/:id", getKursiById);

// Route untuk mendapatkan kursi tersedia berdasarkan jadwal
router.get("/available/:jadwalId", getAvailableKursi);

export default router;
