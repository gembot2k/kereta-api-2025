# API Kereta Api

API sistem pemesanan tiket kereta api untuk PT Kereta Api Citra Indonesia. Proyek ini menggunakan Node.js dengan Express, Prisma ORM, dan database MySQL.

## Kebutuhan Sistem

- Node.js (versi 16 atau lebih tinggi)
- MySQL
- PNPM (Package Manager)

## Langkah-langkah Setup Proyek

### 1. Clone Repositori

```bash
git clone https://github.com/gembot2k/kreta-api-2025.git
cd kereta-api-2025
```

### 2. Instalasi Dependensi

```bash
pnpm install
```

### 3. Setup Environment

Buat file `.env` pada root proyek:

```
# Database
DATABASE_URL="mysql://username:password@localhost:3306/db_kereta_api"

# JWT
JWT_SECRET=rahasia_jwt_kereta_api_citra
JWT_EXPIRES_IN=24h

# Server
PORT=3000
```

### 4. Setup Database

Pastikan MySQL sudah berjalan dan database `db_kereta_api` sudah dibuat.

```bash
# Generate Prisma Client
pnpm prisma generate

# Migrate database schema
pnpm prisma migrate dev --name init
```

### 5. Menjalankan Server

```bash
# Mode development
pnpm dev

# Mode production
pnpm start
```

Server akan berjalan di `http://localhost:3000`

## Struktur API

API ini terdiri dari beberapa modul utama:

### 1. Autentikasi
- `POST /api/auth/register` - Registrasi pengguna baru (pelanggan)
- `POST /api/auth/login` - Login pengguna
- `POST /api/auth/register/petugas` - Registrasi petugas (hanya dapat diakses oleh petugas)

### 2. User
- `GET /api/users/profile` - Mendapatkan profil pengguna
- `PUT /api/users/password` - Mengubah password

### 3. Kereta
- `GET /api/kereta` - Mendapatkan semua kereta
- `GET /api/kereta/:id` - Mendapatkan kereta berdasarkan ID
- `POST /api/kereta` - Membuat kereta baru (petugas)
- `PUT /api/kereta/:id` - Mengupdate kereta (petugas)
- `DELETE /api/kereta/:id` - Menghapus kereta (petugas)

### 4. Gerbong
- `GET /api/gerbong` - Mendapatkan semua gerbong
- `GET /api/gerbong/:id` - Mendapatkan gerbong berdasarkan ID
- `POST /api/gerbong` - Membuat gerbong baru (petugas)
- `PUT /api/gerbong/:id` - Mengupdate gerbong (petugas)
- `DELETE /api/gerbong/:id` - Menghapus gerbong (petugas)

### 5. Kursi
- `GET /api/kursi` - Mendapatkan semua kursi
- `GET /api/kursi/:id` - Mendapatkan kursi berdasarkan ID

### 6. Jadwal
- `GET /api/jadwal` - Mendapatkan semua jadwal keberangkatan
- `GET /api/jadwal/search` - Mencari jadwal berdasarkan filter
- `GET /api/jadwal/:id` - Mendapatkan jadwal berdasarkan ID
- `POST /api/jadwal` - Membuat jadwal baru (petugas)
- `PUT /api/jadwal/:id` - Mengupdate jadwal (petugas)
- `DELETE /api/jadwal/:id` - Menghapus jadwal (petugas)

### 7. Tiket
- `GET /api/tiket/mytickets` - Mendapatkan tiket pengguna (pelanggan)
- `GET /api/tiket/:id` - Mendapatkan detail tiket
- `POST /api/tiket` - Membuat pembelian tiket baru (pelanggan)
- `GET /api/tiket` - Mendapatkan semua pembelian tiket (petugas)

## Fitur

### Pelanggan
1. Pelanggan dapat register sebagai user pelanggan
2. Pelanggan dapat login ke halaman pemesanan tiket
3. Pelanggan dapat melihat jadwal keberangkatan, kelas, dan harga tiket kereta api
4. Pelanggan dapat memesan tiket untuk diri sendiri maupun orang lain lebih dari 1 penumpang dalam sekali transaksi berdasarkan kuota
5. Pelanggan dapat melihat histori pemesanan tiket pertanggal dan perbulan
6. Pelanggan dapat mencetak bukti/nota pemesanan tiket

### Petugas
1. Petugas dapat login ke halaman pengelolaan data pembelian tiket
2. Petugas dapat melakukan CRUD data kereta api
3. Petugas dapat melakukan CRUD data gerbong
4. Petugas dapat melakukan CRUD data kursi
5. Petugas dapat melakukan CRUD jadwal keberangkatan kereta api
6. Petugas dapat melakukan CRUD data petugas
7. Petugas dapat melakukan CRUD pelanggan
8. Petugas dapat melihat histori transaksi pembelian tiket berdasarkan tanggal dan bulan
9. Petugas dapat melihat rekap pemasukan perbulan
