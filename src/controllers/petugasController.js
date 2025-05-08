// Controller untuk petugas
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { responseSuccess, responseError } from "../utils/response.js";

// Mendapatkan semua petugas (hanya untuk petugas)
const getAllPetugas = async (req, res) => {
  try {
    const petugas = await prisma.petugas.findMany({
      include: {
        user: {
          select: {
            username: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return responseSuccess(res, 200, petugas, "Berhasil mendapatkan data petugas");
  } catch (error) {
    console.error("Error get all petugas:", error);
    return responseError(res, 500, "Gagal mendapatkan data petugas");
  }
};

// Mendapatkan petugas berdasarkan ID
const getPetugasById = async (req, res) => {
  try {
    const { id } = req.params;

    const petugas = await prisma.petugas.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!petugas) {
      return responseError(res, 404, "Petugas tidak ditemukan");
    }

    return responseSuccess(res, 200, petugas, "Berhasil mendapatkan data petugas");
  } catch (error) {
    console.error("Error get petugas by ID:", error);
    return responseError(res, 500, "Gagal mendapatkan data petugas");
  }
};

// Mengupdate data petugas
const updatePetugas = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaPetugas, alamat, telp } = req.body;

    // Cek jika petugas ada
    const petugasExists = await prisma.petugas.findUnique({
      where: { id },
    });

    if (!petugasExists) {
      return responseError(res, 404, "Petugas tidak ditemukan");
    }

    // Validasi input
    if (!namaPetugas && !alamat && !telp) {
      return responseError(res, 400, "Tidak ada data yang diubah");
    }

    // Persiapkan data untuk update
    const updateData = {};

    if (namaPetugas) updateData.namaPetugas = namaPetugas;
    if (alamat) updateData.alamat = alamat;
    if (telp) updateData.telp = telp;

    const petugas = await prisma.petugas.update({
      where: { id },
      data: updateData,
    });

    return responseSuccess(res, 200, petugas, "Data petugas berhasil diupdate");
  } catch (error) {
    console.error("Error update petugas:", error);
    return responseError(res, 500, "Gagal mengupdate data petugas");
  }
};

// Menghapus petugas
const deletePetugas = async (req, res) => {
  try {
    const { id } = req.params;
    const requestingPetugasId = req.user.id;

    // Cek jika petugas ada
    const petugasExists = await prisma.petugas.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!petugasExists) {
      return responseError(res, 404, "Petugas tidak ditemukan");
    }

    // Petugas tidak dapat menghapus dirinya sendiri
    if (petugasExists.userId === requestingPetugasId) {
      return responseError(res, 400, "Anda tidak dapat menghapus akun sendiri");
    }

    // Hapus user dan petugas dalam satu transaksi
    await prisma.$transaction([
      prisma.petugas.delete({
        where: { id },
      }),
      prisma.user.delete({
        where: { id: petugasExists.userId },
      }),
    ]);

    return responseSuccess(res, 200, null, "Petugas berhasil dihapus");
  } catch (error) {
    console.error("Error delete petugas:", error);
    return responseError(res, 500, "Gagal menghapus petugas");
  }
};

export { getAllPetugas, getPetugasById, updatePetugas, deletePetugas };
