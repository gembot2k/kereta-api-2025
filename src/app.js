// Setup aplikasi express
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import pelangganRoutes from "./routes/pelangganRoutes.js";
import petugasRoutes from "./routes/petugasRoutes.js";
import keretaRoutes from "./routes/keretaRoutes.js";
import gerbongRoutes from "./routes/gerbongRoutes.js";
import kursiRoutes from "./routes/kursiRoutes.js";
import jadwalRoutes from "./routes/jadwalRoutes.js";
import tiketRoutes from "./routes/tiketRoutes.js";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/pelanggan", pelangganRoutes);
app.use("/api/petugas", petugasRoutes);
app.use("/api/kereta", keretaRoutes);
app.use("/api/gerbong", gerbongRoutes);
app.use("/api/kursi", kursiRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/tiket", tiketRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Selamat datang di API Tiket Kereta Api",
  });
});

// Error handling
app.use((req, res, next) => {
  const error = new Error("Route tidak ditemukan");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    status: "error",
    message: error.message,
  });
});

export default app;
