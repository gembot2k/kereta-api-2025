// Controller untuk pembelian tiket
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/db.js";
import { responseSuccess, responseError } from "../utils/response.js";

// Mendapatkan semua pembelian tiket berdasarkan user (untuk pelanggan)
const getMyTickets = async (req, res) => {
  try {
    const userId = req.user.id;

    // Dapatkan ID pelanggan
    const pelanggan = await prisma.pelanggan.findUnique({
      where: { userId },
    });

    if (!pelanggan) {
      return responseError(res, 404, "Pelanggan tidak ditemukan");
    }

    // Dapatkan pembelian tiket
    const tikets = await prisma.pembelianTiket.findMany({
      where: {
        pelangganId: pelanggan.id,
      },
      include: {
        jadwal: {
          include: {
            kereta: true,
          },
        },
        detailPembelianTiket: {
          include: {
            kursi: {
              include: {
                gerbong: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return responseSuccess(res, 200, tikets, "Berhasil mendapatkan riwayat pembelian tiket");
  } catch (error) {
    console.error("Error get my tickets:", error);
    return responseError(res, 500, "Gagal mendapatkan riwayat pembelian tiket");
  }
};

// Mendapatkan detail pembelian tiket berdasarkan ID
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Cek role user
    const isPelangganUser = req.user.role === "pelanggan";

    // Dapatkan pembelian tiket
    const tiket = await prisma.pembelianTiket.findUnique({
      where: { id },
      include: {
        pelanggan: true,
        jadwal: {
          include: {
            kereta: true,
          },
        },
        detailPembelianTiket: {
          include: {
            kursi: {
              include: {
                gerbong: true,
              },
            },
          },
        },
      },
    });

    if (!tiket) {
      return responseError(res, 404, "Tiket tidak ditemukan");
    }

    // Jika user adalah pelanggan, validasi kepemilikan tiket
    if (isPelangganUser) {
      const pelanggan = await prisma.pelanggan.findUnique({
        where: { userId },
      });

      if (!pelanggan || tiket.pelangganId !== pelanggan.id) {
        return responseError(res, 403, "Anda tidak memiliki akses ke tiket ini");
      }
    }

    return responseSuccess(res, 200, tiket, "Berhasil mendapatkan detail tiket");
  } catch (error) {
    console.error("Error get ticket by ID:", error);
    return responseError(res, 500, "Gagal mendapatkan detail tiket");
  }
};

// Membuat pembelian tiket baru
const createTicket = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jadwalId, penumpang } = req.body;

    // Cek apakah jadwal exists
    const jadwal = await prisma.jadwal.findUnique({
      where: { id: jadwalId },
      include: {
        kereta: {
          include: {
            gerbong: {
              include: {
                kursi: true,
              },
            },
          },
        },
      },
    });

    if (!jadwal) {
      return responseError(res, 404, "Jadwal tidak ditemukan");
    }

    // Dapatkan data pelanggan
    const pelanggan = await prisma.pelanggan.findUnique({
      where: { userId },
    });

    if (!pelanggan) {
      return responseError(res, 404, "Pelanggan tidak ditemukan");
    }

    // Validasi array penumpang
    if (!Array.isArray(penumpang) || penumpang.length === 0) {
      return responseError(res, 400, "Data penumpang tidak valid");
    }

    // Cek ketersediaan kursi
    // Dapatkan semua kursi yang sudah dipesan di jadwal ini
    const bookedSeats = await prisma.detailPembelianTiket.findMany({
      where: {
        pembelianTiket: {
          jadwalId,
        },
      },
      select: {
        kursiId: true,
      },
    });

    const bookedSeatIds = bookedSeats.map((seat) => seat.kursiId);

    // Daftar semua kursi yang tersedia
    const availableSeats = [];
    for (const gerbong of jadwal.kereta.gerbong) {
      for (const kursi of gerbong.kursi) {
        if (!bookedSeatIds.includes(kursi.id)) {
          availableSeats.push({
            id: kursi.id,
            noKursi: kursi.noKursi,
            gerbongId: gerbong.id,
            namaGerbong: gerbong.namaGerbong,
          });
        }
      }
    }

    // Cek apakah kursi yang tersedia cukup
    if (availableSeats.length < penumpang.length) {
      return responseError(
        res,
        400,
        `Kursi yang tersedia tidak cukup. Hanya tersedia ${availableSeats.length} kursi.`,
      );
    }

    // Buat ID pembelian tiket
    const pembelianTiketId = uuidv4();

    // Membuat array untuk detail pembelian tiket
    const detailPembelianTiket = [];

    for (let i = 0; i < penumpang.length; i++) {
      // Gunakan kursi yang tersedia sesuai urutan
      const kursiId = availableSeats[i].id;

      detailPembelianTiket.push({
        id: uuidv4(),
        nik: penumpang[i].nik,
        namaPenumpang: penumpang[i].nama,
        pembelianTiketId,
        kursiId,
      });
    }

    // Buat pembelian tiket dalam satu transaksi
    const result = await prisma.$transaction([
      prisma.pembelianTiket.create({
        data: {
          id: pembelianTiketId,
          pelangganId: pelanggan.id,
          jadwalId,
        },
      }),
      ...detailPembelianTiket.map((detail) =>
        prisma.detailPembelianTiket.create({
          data: detail,
        }),
      ),
    ]);

    // Dapatkan detail pembelian tiket yang baru saja dibuat
    const newTicket = await prisma.pembelianTiket.findUnique({
      where: { id: pembelianTiketId },
      include: {
        jadwal: {
          include: {
            kereta: true,
          },
        },
        detailPembelianTiket: {
          include: {
            kursi: {
              include: {
                gerbong: true,
              },
            },
          },
        },
      },
    });

    return responseSuccess(res, 201, newTicket, "Tiket berhasil dibuat");
  } catch (error) {
    console.error("Error create ticket:", error);
    return responseError(res, 500, "Gagal membuat tiket");
  }
};

// Mendapatkan semua pembelian tiket (untuk petugas)
const getAllTickets = async (req, res) => {
  try {
    const { date, month } = req.query;

    // Buat filter berdasarkan tanggal atau bulan jika disediakan
    const where = {};
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    } else if (month) {
      // Format month expected: YYYY-MM
      const [year, monthNum] = month.split("-");
      const startDate = new Date(Number.parseInt(year), Number.parseInt(monthNum) - 1, 1);

      let endDate;
      if (Number.parseInt(monthNum) === 12) {
        endDate = new Date(Number.parseInt(year) + 1, 0, 0);
      } else {
        endDate = new Date(Number.parseInt(year), Number.parseInt(monthNum), 0);
      }
      endDate.setHours(23, 59, 59, 999);

      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const tickets = await prisma.pembelianTiket.findMany({
      where,
      include: {
        pelanggan: true,
        jadwal: {
          include: {
            kereta: true,
          },
        },
        detailPembelianTiket: {
          include: {
            kursi: {
              include: {
                gerbong: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Hitung total pendapatan dari tiket-tiket yang ditampilkan
    const totalIncome = tickets.reduce((sum, ticket) => {
      return sum + ticket.jadwal.harga * ticket.detailPembelianTiket.length;
    }, 0);

    return responseSuccess(
      res,
      200,
      { tickets, totalIncome },
      "Berhasil mendapatkan data pembelian tiket",
    );
  } catch (error) {
    console.error("Error get all tickets:", error);
    return responseError(res, 500, "Gagal mendapatkan data pembelian tiket");
  }
};

export { getMyTickets, getTicketById, createTicket, getAllTickets };
