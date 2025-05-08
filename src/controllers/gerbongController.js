// Controller untuk gerbong
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/db.js";
import { responseSuccess, responseError } from "../utils/response.js";

// Mendapatkan semua gerbong (dengan filter kereta opsional)
const getAllGerbong = async (req, res) => {
  try {
    const { keretaId } = req.query;

    // Buat filter jika keretaId disediakan
    const where = keretaId ? { keretaId } : {};

    const gerbong = await prisma.gerbong.findMany({
      where,
      include: {
        kereta: true,
        kursi: true,
      },
    });

    return responseSuccess(res, 200, gerbong, "Berhasil mendapatkan data gerbong");
  } catch (error) {
    console.error("Error get all gerbong:", error);
    return responseError(res, 500, "Gagal mendapatkan data gerbong");
  }
};

// Mendapatkan gerbong berdasarkan ID
const getGerbongById = async (req, res) => {
  try {
    const { id } = req.params;

    const gerbong = await prisma.gerbong.findUnique({
      where: { id },
      include: {
        kereta: true,
        kursi: true,
      },
    });

    if (!gerbong) {
      return responseError(res, 404, "Gerbong tidak ditemukan");
    }

    return responseSuccess(res, 200, gerbong, "Berhasil mendapatkan data gerbong");
  } catch (error) {
    console.error("Error get gerbong by ID:", error);
    return responseError(res, 500, "Gagal mendapatkan data gerbong");
  }
};

// Membuat gerbong baru
const createGerbong = async (req, res) => {
  try {
    const { namaGerbong, kuota, keretaId } = req.body;

    // Cek jika kereta ada
    const kereta = await prisma.kereta.findUnique({
      where: { id: keretaId },
    });

    if (!kereta) {
      return responseError(res, 404, "Kereta tidak ditemukan");
    }

    // Validasi kuota
    if (kuota <= 0 || !Number.isInteger(kuota)) {
      return responseError(res, 400, "Kuota harus berupa angka bulat positif");
    }

    // Buat gerbong baru
    const gerbongId = uuidv4();

    // Buat array kursi untuk dibuat
    const kursiData = Array.from({ length: kuota }, (_, i) => ({
      id: uuidv4(),
      noKursi: i + 1,
      gerbongId,
    }));

    // Buat gerbong dan kursi dalam satu transaksi
    const result = await prisma.$transaction([
      prisma.gerbong.create({
        data: {
          id: gerbongId,
          namaGerbong,
          kuota,
          keretaId,
        },
      }),
      ...kursiData.map((kursi) =>
        prisma.kursi.create({
          data: kursi,
        }),
      ),
    ]);

    // Dapatkan gerbong yang baru saja dibuat dengan semua kursinya
    const newGerbong = await prisma.gerbong.findUnique({
      where: { id: gerbongId },
      include: {
        kereta: true,
        kursi: true,
      },
    });

    return responseSuccess(res, 201, newGerbong, "Gerbong berhasil dibuat");
  } catch (error) {
    console.error("Error create gerbong:", error);
    return responseError(res, 500, "Gagal membuat gerbong");
  }
};

// Mengupdate gerbong
const updateGerbong = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaGerbong, keretaId } = req.body;

    // Cek jika gerbong ada
    const gerbongExists = await prisma.gerbong.findUnique({
      where: { id },
    });

    if (!gerbongExists) {
      return responseError(res, 404, "Gerbong tidak ditemukan");
    }

    // Cek jika kereta ada (jika keretaId disediakan)
    if (keretaId) {
      const kereta = await prisma.kereta.findUnique({
        where: { id: keretaId },
      });

      if (!kereta) {
        return responseError(res, 404, "Kereta tidak ditemukan");
      }
    }

    // Persiapkan data untuk update
    const updateData = {};

    if (namaGerbong) updateData.namaGerbong = namaGerbong;
    if (keretaId) updateData.keretaId = keretaId;

    const gerbong = await prisma.gerbong.update({
      where: { id },
      data: updateData,
      include: {
        kereta: true,
        kursi: true,
      },
    });

    return responseSuccess(res, 200, gerbong, "Gerbong berhasil diupdate");
  } catch (error) {
    console.error("Error update gerbong:", error);
    return responseError(res, 500, "Gagal mengupdate gerbong");
  }
};

// Menghapus gerbong
const deleteGerbong = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek jika gerbong ada
    const gerbongExists = await prisma.gerbong.findUnique({
      where: { id },
    });

    if (!gerbongExists) {
      return responseError(res, 404, "Gerbong tidak ditemukan");
    }

    // Cek jika ada kursi yang sudah dipesan
    const bookedSeats = await prisma.detailPembelianTiket.findFirst({
      where: {
        kursi: {
          gerbongId: id,
        },
      },
    });

    if (bookedSeats) {
      return responseError(
        res,
        400,
        "Tidak dapat menghapus gerbong karena ada kursi yang sudah dipesan",
      );
    }

    await prisma.gerbong.delete({
      where: { id },
    });

    return responseSuccess(res, 200, null, "Gerbong berhasil dihapus");
  } catch (error) {
    console.error("Error delete gerbong:", error);
    return responseError(res, 500, "Gagal menghapus gerbong");
  }
};

export { getAllGerbong, getGerbongById, createGerbong, updateGerbong, deleteGerbong };
