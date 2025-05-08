// Controller autentikasi
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/db.js";
import { generateToken } from "../utils/jwt.js";
import { responseSuccess, responseError } from "../utils/response.js";

// Register user baru sebagai pelanggan
const register = async (req, res) => {
  try {
    const { username, password, nik, namaPenumpang, alamat, telp } = req.body;

    // Cek jika username sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return responseError(res, 400, "Username sudah terdaftar");
    }

    // Cek jika NIK sudah terdaftar
    const existingPelanggan = await prisma.pelanggan.findUnique({
      where: { nik },
    });

    if (existingPelanggan) {
      return responseError(res, 400, "NIK sudah terdaftar");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat ID unik
    const userId = uuidv4();
    const pelangganId = uuidv4();

    // Buat user dan pelanggan dalam satu transaksi
    const result = await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          username,
          password: hashedPassword,
          role: "pelanggan",
        },
      }),
      prisma.pelanggan.create({
        data: {
          id: pelangganId,
          nik,
          namaPenumpang,
          alamat,
          telp,
          userId,
        },
      }),
    ]);

    // Generate token
    const token = generateToken({
      id: userId,
      role: "pelanggan",
      username,
    });

    return responseSuccess(
      res,
      201,
      {
        user: { id: userId, username, role: "pelanggan" },
        pelanggan: {
          id: pelangganId,
          namaPenumpang,
          nik,
        },
        token,
      },
      "Registrasi berhasil",
    );
  } catch (error) {
    console.error("Error register:", error);
    return responseError(res, 500, "Gagal mendaftarkan akun");
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Cek jika user ada
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return responseError(res, 404, "Username atau password salah");
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return responseError(res, 401, "Username atau password salah");
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      role: user.role,
      username: user.username,
    });

    // Ambil data tambahan berdasarkan role
    let additionalData = null;
    if (user.role === "pelanggan") {
      additionalData = await prisma.pelanggan.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          namaPenumpang: true,
          nik: true,
        },
      });
    } else if (user.role === "petugas") {
      additionalData = await prisma.petugas.findUnique({
        where: { userId: user.id },
        select: {
          id: true,
          namaPetugas: true,
        },
      });
    }

    // Remove password from response
    const { password: _, ...userData } = user;

    return responseSuccess(
      res,
      200,
      {
        user: userData,
        [user.role]: additionalData,
        token,
      },
      "Login berhasil",
    );
  } catch (error) {
    console.error("Error login:", error);
    return responseError(res, 500, "Gagal login");
  }
};

// Mendaftarkan petugas baru (hanya bisa dilakukan oleh petugas)
const registerPetugas = async (req, res) => {
  try {
    const { username, password, namaPetugas, alamat, telp } = req.body;

    // Cek jika username sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return responseError(res, 400, "Username sudah terdaftar");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat ID unik
    const userId = uuidv4();
    const petugasId = uuidv4();

    // Buat user dan petugas dalam satu transaksi
    const result = await prisma.$transaction([
      prisma.user.create({
        data: {
          id: userId,
          username,
          password: hashedPassword,
          role: "petugas",
        },
      }),
      prisma.petugas.create({
        data: {
          id: petugasId,
          namaPetugas,
          alamat,
          telp,
          userId,
        },
      }),
    ]);

    return responseSuccess(
      res,
      201,
      {
        user: { id: userId, username, role: "petugas" },
        petugas: {
          id: petugasId,
          namaPetugas,
        },
      },
      "Petugas berhasil didaftarkan",
    );
  } catch (error) {
    console.error("Error register petugas:", error);
    return responseError(res, 500, "Gagal mendaftarkan petugas");
  }
};

export { register, login, registerPetugas };
