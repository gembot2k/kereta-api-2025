// Controller untuk pelanggan
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { responseSuccess, responseError } from "../utils/response.js";

// Mendapatkan semua pelanggan (hanya untuk petugas)
const getAllPelanggan = async (req, res) => {
  try {
    const pelanggan = await prisma.pelanggan.findMany({
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

    return responseSuccess(res, 200, pelanggan, "Berhasil mendapatkan data pelanggan");
  } catch (error) {
    console.error("Error get all pelanggan:", error);
    return responseError(res, 500, "Gagal mendapatkan data pelanggan");
  }
};

// Mendapatkan pelanggan berdasarkan ID
const getPelangganById = async (req, res) => {
  try {
    const { id } = req.params;

    const pelanggan = await prisma.pelanggan.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            username: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        pembelianTiket: {
          select: {
            id: true,
            createdAt: true,
            jadwal: {
              select: {
                asalKeberangkatan: true,
                tujuanKeberangkatan: true,
                tanggalKeberangkatan: true,
                tanggalKedatangan: true,
                kereta: {
                  select: {
                    namaKereta: true,
                    kelas: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!pelanggan) {
      return responseError(res, 404, "Pelanggan tidak ditemukan");
    }

    return responseSuccess(res, 200, pelanggan, "Berhasil mendapatkan data pelanggan");
  } catch (error) {
    console.error("Error get pelanggan by ID:", error);
    return responseError(res, 500, "Gagal mendapatkan data pelanggan");
  }
};

// Mengupdate data pelanggan
const updatePelanggan = async (req, res) => {
  try {
    const { id } = req.params;
    const { namaPenumpang, alamat, telp } = req.body;

    // Cek jika pelanggan ada
    const pelangganExists = await prisma.pelanggan.findUnique({
      where: { id },
    });

    if (!pelangganExists) {
      return responseError(res, 404, "Pelanggan tidak ditemukan");
    }

    // Validasi input
    if (!namaPenumpang && !alamat && !telp) {
      return responseError(res, 400, "Tidak ada data yang diubah");
    }

    // Persiapkan data untuk update
    const updateData = {};

    if (namaPenumpang) updateData.namaPenumpang = namaPenumpang;
    if (alamat) updateData.alamat = alamat;
    if (telp) updateData.telp = telp;

    const pelanggan = await prisma.pelanggan.update({
      where: { id },
      data: updateData,
    });

    return responseSuccess(res, 200, pelanggan, "Data pelanggan berhasil diupdate");
  } catch (error) {
    console.error("Error update pelanggan:", error);
    return responseError(res, 500, "Gagal mengupdate data pelanggan");
  }
};

// Menghapus pelanggan
const deletePelanggan = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek jika pelanggan ada
    const pelangganExists = await prisma.pelanggan.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!pelangganExists) {
      return responseError(res, 404, "Pelanggan tidak ditemukan");
    }

    // Cek jika pelanggan memiliki tiket yang aktif
    const hasTiket = await prisma.pembelianTiket.findFirst({
      where: {
        pelangganId: id,
      },
    });

    if (hasTiket) {
      return responseError(res, 400, "Pelanggan memiliki tiket aktif dan tidak dapat dihapus");
    }

    // Hapus user dan pelanggan dalam satu transaksi
    await prisma.$transaction([
      prisma.pelanggan.delete({
        where: { id },
      }),
      prisma.user.delete({
        where: { id: pelangganExists.userId },
      }),
    ]);

    return responseSuccess(res, 200, null, "Pelanggan berhasil dihapus");
  } catch (error) {
    console.error("Error delete pelanggan:", error);
    return responseError(res, 500, "Gagal menghapus pelanggan");
  }
};

export { getAllPelanggan, getPelangganById, updatePelanggan, deletePelanggan };
