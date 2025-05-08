// Controller untuk kereta
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/db.js";
import { responseSuccess, responseError } from "../utils/response.js";

// Mendapatkan semua kereta
const getAllKereta = async (req, res) => {
  try {
    const kereta = await prisma.kereta.findMany({
      include: {
        gerbong: true,
      },
    });

    return responseSuccess(res, 200, kereta, "Berhasil mendapatkan data kereta");
  } catch (error) {
    console.error("Error get all kereta:", error);
    return responseError(res, 500, "Gagal mendapatkan data kereta");
  }
};

// Mendapatkan kereta berdasarkan ID
const getKeretaById = async (req, res) => {
  try {
    const { id } = req.params;

    const kereta = await prisma.kereta.findUnique({
      where: { id },
      include: {
        gerbong: true,
        jadwal: true,
      },
    });

    if (!kereta) {
      return responseError(res, 404, "Kereta tidak ditemukan");
    }

    return responseSuccess(res, 200, kereta, "Berhasil mendapatkan data kereta");
  } catch (error) {
    console.error("Error get kereta by ID:", error);
    return responseError(res, 500, "Gagal mendapatkan data kereta");
  }
};

// Membuat kereta baru
const createKereta = async (req, res) => {
  try {
    const { namaKereta, deskripsi, kelas } = req.body;

    // Validasi kelas kereta
    const validKelas = ["ekonomi", "bisnis", "eksekutif", "luxury"];
    if (!validKelas.includes(kelas)) {
      return responseError(res, 400, "Kelas kereta tidak valid");
    }

    const kereta = await prisma.kereta.create({
      data: {
        id: uuidv4(),
        namaKereta,
        deskripsi,
        kelas,
      },
    });

    return responseSuccess(res, 201, kereta, "Kereta berhasil dibuat");
  } catch (error) {
    console.error("Error create kereta:", error);
    return responseError(res, 500, "Gagal membuat kereta");
  }
};

// Mengupdate kereta
const updateKereta = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaKereta, deskripsi, kelas } = req.body;

    // Cek jika kereta ada
    const keretaExists = await prisma.kereta.findUnique({
      where: { id },
    });

    if (!keretaExists) {
      return responseError(res, 404, "Kereta tidak ditemukan");
    }

    // Validasi kelas kereta jika ada
    if (kelas) {
      const validKelas = ["ekonomi", "bisnis", "eksekutif", "luxury"];
      if (!validKelas.includes(kelas)) {
        return responseError(res, 400, "Kelas kereta tidak valid");
      }
    }

    const kereta = await prisma.kereta.update({
      where: { id },
      data: {
        namaKereta,
        deskripsi,
        kelas,
      },
    });

    return responseSuccess(res, 200, kereta, "Kereta berhasil diupdate");
  } catch (error) {
    console.error("Error update kereta:", error);
    return responseError(res, 500, "Gagal mengupdate kereta");
  }
};

// Menghapus kereta
const deleteKereta = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek jika kereta ada
    const keretaExists = await prisma.kereta.findUnique({
      where: { id },
    });

    if (!keretaExists) {
      return responseError(res, 404, "Kereta tidak ditemukan");
    }

    await prisma.kereta.delete({
      where: { id },
    });

    return responseSuccess(res, 200, null, "Kereta berhasil dihapus");
  } catch (error) {
    console.error("Error delete kereta:", error);
    return responseError(res, 500, "Gagal menghapus kereta");
  }
};

export { getAllKereta, getKeretaById, createKereta, updateKereta, deleteKereta };
