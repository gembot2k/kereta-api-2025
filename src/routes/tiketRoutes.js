// Routes untuk pembelian tiket
import express from "express";
import {
  getMyTickets,
  getTicketById,
  createTicket,
  getAllTickets,
} from "../controllers/tiketController.js";
import { auth, isPelanggan, isPetugas } from "../middlewares/auth.js";

const router = express.Router();

// Route untuk mendapatkan semua pembelian tiket milik pelanggan yang sedang login
router.get("/mytickets", auth, isPelanggan, getMyTickets);

// Route untuk mendapatkan detail tiket berdasarkan ID
router.get("/:id", auth, getTicketById);

// Route untuk membuat pembelian tiket baru
router.post("/", auth, isPelanggan, createTicket);

// Route untuk petugas mendapatkan semua pembelian tiket
router.get("/", auth, isPetugas, getAllTickets);

export default router;
