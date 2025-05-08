// Controller untuk jadwal keberangkatan
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/db.js";
import { responseSuccess, responseError } from "../utils/response.js";

// Mendapatkan semua jadwal keberangkatan
const getAllJadwal = async (req, res) => {
  try {
    const jadwal = await prisma.jadwal.findMany({
      include: {
        kereta: true,
      },
    });

    return responseSuccess(res, 200, jadwal, "Berhasil mendapatkan data jadwal");
  } catch (error) {
    console.error("Error get all jadwal:", error);
    return responseError(res, 500, "Gagal mendapatkan data jadwal");
  }
};

// Mendapatkan jadwal keberangkatan berdasarkan ID
const getJadwalById = async (req, res) => {
  try {
    const { id } = req.params;

    const jadwal = await prisma.jadwal.findUnique({
      where: { id },
      include: {
        kereta: true,
      },
    });

    if (!jadwal) {
      return responseError(res, 404, "Jadwal tidak ditemukan");
    }

    return responseSuccess(res, 200, jadwal, "Berhasil mendapatkan data jadwal");
  } catch (error) {
    console.error("Error get jadwal by ID:", error);
    return responseError(res, 500, "Gagal mendapatkan data jadwal");
  }
};

// Mencari jadwal keberangkatan berdasarkan filter
const searchJadwal = async (req, res) => {
  try {
    const { asalKeberangkatan, tujuanKeberangkatan, tanggal, kelas } = req.query;

    // Buat filter pencarian
    const where = {};

    if (asalKeberangkatan) {
      where.asalKeberangkatan = {
        contains: asalKeberangkatan,
      };
    }

    if (tujuanKeberangkatan) {
      where.tujuanKeberangkatan = {
        contains: tujuanKeberangkatan,
      };
    }

    if (tanggal) {
      // Konversi tanggal ke format yang benar untuk pencarian
      const startDate = new Date(tanggal);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(tanggal);
      endDate.setHours(23, 59, 59, 999);

      where.tanggalKeberangkatan = {
        gte: startDate,
        lte: endDate,
      };
    }

    // Jika filter kelas disediakan, gunakan include untuk filter kereta dengan kelas tertentu
    let include = {
      kereta: true,
    };

    if (kelas) {
      include = {
        kereta: {
          where: {
            kelas: kelas,
          },
        },
      };
    }

    const jadwal = await prisma.jadwal.findMany({
      where,
      include,
      orderBy: {
        tanggalKeberangkatan: "asc",
      },
    });

    // Filter hasil jika kelas disediakan
    let result = jadwal;
    if (kelas) {
      result = jadwal.filter((j) => j.kereta !== null);
    }

    return responseSuccess(res, 200, result, "Berhasil mendapatkan data jadwal");
  } catch (error) {
    console.error("Error search jadwal:", error);
    return responseError(res, 500, "Gagal mencari jadwal");
  }
};

// Membuat jadwal keberangkatan baru
const createJadwal = async (req, res) => {
  try {
    const {
      asalKeberangkatan,
      tujuanKeberangkatan,
      tanggalKeberangkatan,
      tanggalKedatangan,
      harga,
      keretaId,
    } = req.body;

    // Cek jika kereta ada
    const kereta = await prisma.kereta.findUnique({
      where: { id: keretaId },
    });

    if (!kereta) {
      return responseError(res, 404, "Kereta tidak ditemukan");
    }

    // Validasi tanggal
    const tglBerangkat = new Date(tanggalKeberangkatan);
    const tglKedatangan = new Date(tanggalKedatangan);

    if (tglBerangkat >= tglKedatangan) {
      return responseError(res, 400, "Tanggal kedatangan harus setelah tanggal keberangkatan");
    }

    const jadwal = await prisma.jadwal.create({
      data: {
        id: uuidv4(),
        asalKeberangkatan,
        tujuanKeberangkatan,
        tanggalKeberangkatan: tglBerangkat,
        tanggalKedatangan: tglKedatangan,
        harga,
        keretaId,
      },
    });

    return responseSuccess(res, 201, jadwal, "Jadwal berhasil dibuat");
  } catch (error) {
    console.error("Error create jadwal:", error);
    return responseError(res, 500, "Gagal membuat jadwal");
  }
};

// Mengupdate jadwal keberangkatan
const updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      asalKeberangkatan,
      tujuanKeberangkatan,
      tanggalKeberangkatan,
      tanggalKedatangan,
      harga,
      keretaId,
    } = req.body;

    // Cek jika jadwal ada
    const jadwalExists = await prisma.jadwal.findUnique({
      where: { id },
    });

    if (!jadwalExists) {
      return responseError(res, 404, "Jadwal tidak ditemukan");
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

    // Validasi tanggal jika keduanya disediakan
    if (tanggalKeberangkatan && tanggalKedatangan) {
      const tglBerangkat = new Date(tanggalKeberangkatan);
      const tglKedatangan = new Date(tanggalKedatangan);

      if (tglBerangkat >= tglKedatangan) {
        return responseError(res, 400, "Tanggal kedatangan harus setelah tanggal keberangkatan");
      }
    }

    // Persiapkan data untuk update
    const updateData = {};

    if (asalKeberangkatan) updateData.asalKeberangkatan = asalKeberangkatan;
    if (tujuanKeberangkatan) updateData.tujuanKeberangkatan = tujuanKeberangkatan;
    if (tanggalKeberangkatan) updateData.tanggalKeberangkatan = new Date(tanggalKeberangkatan);
    if (tanggalKedatangan) updateData.tanggalKedatangan = new Date(tanggalKedatangan);
    if (harga !== undefined) updateData.harga = harga;
    if (keretaId) updateData.keretaId = keretaId;

    const jadwal = await prisma.jadwal.update({
      where: { id },
      data: updateData,
    });

    return responseSuccess(res, 200, jadwal, "Jadwal berhasil diupdate");
  } catch (error) {
    console.error("Error update jadwal:", error);
    return responseError(res, 500, "Gagal mengupdate jadwal");
  }
};

// Menghapus jadwal keberangkatan
const deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek jika jadwal ada
    const jadwalExists = await prisma.jadwal.findUnique({
      where: { id },
    });

    if (!jadwalExists) {
      return responseError(res, 404, "Jadwal tidak ditemukan");
    }

    await prisma.jadwal.delete({
      where: { id },
    });

    return responseSuccess(res, 200, null, "Jadwal berhasil dihapus");
  } catch (error) {
    console.error("Error delete jadwal:", error);
    return responseError(res, 500, "Gagal menghapus jadwal");
  }
};

export { getAllJadwal, getJadwalById, searchJadwal, createJadwal, updateJadwal, deleteJadwal };
