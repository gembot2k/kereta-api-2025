// Controller untuk user
import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import { responseSuccess, responseError } from "../utils/response.js";

// Mendapatkan profil user
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return responseError(res, 404, "User tidak ditemukan");
    }

    // Ambil data tambahan berdasarkan role
    let profileData = null;
    if (user.role === "pelanggan") {
      profileData = await prisma.pelanggan.findUnique({
        where: { userId },
        select: {
          id: true,
          nik: true,
          namaPenumpang: true,
          alamat: true,
          telp: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else if (user.role === "petugas") {
      profileData = await prisma.petugas.findUnique({
        where: { userId },
        select: {
          id: true,
          namaPetugas: true,
          alamat: true,
          telp: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return responseSuccess(
      res,
      200,
      {
        user,
        [user.role]: profileData,
      },
      "Berhasil mendapatkan data profil",
    );
  } catch (error) {
    console.error("Error get profile:", error);
    return responseError(res, 500, "Gagal mendapatkan data profil");
  }
};

// Update password user
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Cek jika user ada
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return responseError(res, 404, "User tidak ditemukan");
    }

    // Verifikasi password lama
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return responseError(res, 401, "Password lama tidak sesuai");
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return responseSuccess(res, 200, null, "Password berhasil diubah");
  } catch (error) {
    console.error("Error update password:", error);
    return responseError(res, 500, "Gagal mengubah password");
  }
};

export { getProfile, updatePassword };
