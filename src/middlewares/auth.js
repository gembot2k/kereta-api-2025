// Middleware autentikasi
import { verifyToken } from "../utils/jwt.js";
import { responseError } from "../utils/response.js";

// Middleware auth untuk semua user
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return responseError(res, 401, "Akses ditolak. Token tidak ditemukan");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return responseError(res, 403, "Akses ditolak. Token tidak valid");
    }

    // Set user info in request
    req.user = decoded;
    next();
  } catch (error) {
    return responseError(res, 401, "Akses ditolak. Silakan login kembali");
  }
};

// Middleware untuk memeriksa role pelanggan
const isPelanggan = (req, res, next) => {
  if (req.user.role !== "pelanggan") {
    return responseError(res, 403, "Akses ditolak. Hanya pelanggan yang diizinkan");
  }
  next();
};

// Middleware untuk memeriksa role petugas
const isPetugas = (req, res, next) => {
  if (req.user.role !== "petugas") {
    return responseError(res, 403, "Akses ditolak. Hanya petugas yang diizinkan");
  }
  next();
};

export { auth, isPelanggan, isPetugas };
