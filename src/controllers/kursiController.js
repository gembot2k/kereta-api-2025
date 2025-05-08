// Controller untuk kursi
import prisma from "../config/db.js";
import { responseSuccess, responseError } from "../utils/response.js";

// Mendapatkan semua kursi (dengan filter gerbong opsional)
const getAllKursi = async (req, res) => {
  try {
    const { gerbongId } = req.query;

    // Buat filter jika gerbongId disediakan
    const where = gerbongId ? { gerbongId } : {};

    const kursi = await prisma.kursi.findMany({
      where,
      include: {
        gerbong: {
          include: {
            kereta: true,
          },
        },
        detailPembelianTiket: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        noKursi: "asc",
      },
    });

    // Map untuk menambahkan status kursi (tersedia/terpesan)
    const kursiWithStatus = kursi.map((k) => ({
      ...k,
      status: k.detailPembelianTiket ? "terpesan" : "tersedia",
    }));

    return responseSuccess(res, 200, kursiWithStatus, "Berhasil mendapatkan data kursi");
  } catch (error) {
    console.error("Error get all kursi:", error);
    return responseError(res, 500, "Gagal mendapatkan data kursi");
  }
};

// Mendapatkan kursi berdasarkan ID
const getKursiById = async (req, res) => {
  try {
    const { id } = req.params;

    const kursi = await prisma.kursi.findUnique({
      where: { id },
      include: {
        gerbong: {
          include: {
            kereta: true,
          },
        },
        detailPembelianTiket: true,
      },
    });

    if (!kursi) {
      return responseError(res, 404, "Kursi tidak ditemukan");
    }

    // Tambahkan status kursi
    const kursiWithStatus = {
      ...kursi,
      status: kursi.detailPembelianTiket ? "terpesan" : "tersedia",
    };

    return responseSuccess(res, 200, kursiWithStatus, "Berhasil mendapatkan data kursi");
  } catch (error) {
    console.error("Error get kursi by ID:", error);
    return responseError(res, 500, "Gagal mendapatkan data kursi");
  }
};

// Mendapatkan kursi tersedia berdasarkan jadwal
const getAvailableKursi = async (req, res) => {
  try {
    const { jadwalId } = req.params;

    // Cek jika jadwal ada
    const jadwal = await prisma.jadwal.findUnique({
      where: { id: jadwalId },
      include: {
        kereta: true,
      },
    });

    if (!jadwal) {
      return responseError(res, 404, "Jadwal tidak ditemukan");
    }

    // Dapatkan semua kursi yang tersedia di kereta ini
    const allKursi = await prisma.kursi.findMany({
      where: {
        gerbong: {
          keretaId: jadwal.keretaId,
        },
      },
      include: {
        gerbong: true,
        detailPembelianTiket: {
          include: {
            pembelianTiket: {
              where: {
                jadwalId,
              },
            },
          },
        },
      },
    });

    // Filter kursi yang tersedia (tidak terpesan di jadwal ini)
    const availableKursi = allKursi.filter((kursi) => {
      if (!kursi.detailPembelianTiket) return true;
      return !kursi.detailPembelianTiket.pembelianTiket;
    });

    // Map untuk menambahkan status kursi
    const kursiWithStatus = availableKursi.map((k) => ({
      ...k,
      status: "tersedia",
    }));

    return responseSuccess(res, 200, kursiWithStatus, "Berhasil mendapatkan data kursi tersedia");
  } catch (error) {
    console.error("Error get available kursi:", error);
    return responseError(res, 500, "Gagal mendapatkan data kursi tersedia");
  }
};

export { getAllKursi, getKursiById, getAvailableKursi };
