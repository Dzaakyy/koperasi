# Sistem Informasi Koperasi — Backend API

Sistem Informasi Koperasi merupakan aplikasi berbasis web yang digunakan untuk membantu pengelolaan barang, stok, transaksi penjualan, serta pembuatan laporan pada koperasi.

## Tech Stack

| Teknologi | Keterangan |
|-----------|------------|
| Node.js | Runtime |
| Express.js | Web Framework |
| Sequelize | ORM |
| MySQL | Database |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Zod | Request Validation |

## Fitur Utama

- **Authentication** — Login dengan JWT disimpan dalam HTTP-Only Cookie, role-based access (Admin & Kasir)
- **Manajemen Pengguna** — CRUD akun Kasir (Admin only)
- **Manajemen Kategori** — CRUD kategori barang
- **Manajemen Barang** — CRUD barang dengan barcode, harga modal, harga jual, diskon
- **Manajemen Stok** — Penambahan stok dengan riwayat
- **Transaksi Penjualan** — Scan barcode, keranjang, pembayaran, kembalian, pengurangan stok otomatis
- **Laporan** — Penjualan, penambahan stok, perkiraan laba (dengan filter tanggal)

## Prasyarat

- [Node.js](https://nodejs.org/) v18+
- [MySQL](https://www.mysql.com/) (via XAMPP, Laragon, atau standalone)

## Instalasi

### 1. Clone & Install Dependencies

```bash
cd backend
npm install
```

### 2. Konfigurasi Environment

Salin file `.env.example` menjadi `.env`, lalu sesuaikan:

```env
NODE_ENV=
PORT=

DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=

JWT_SECRET=
JWT_EXPIRES_IN=
```

### 3. Buat Database

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS koperasi_db;"
```

### 4. Jalankan Migration

```bash
npx sequelize-cli db:migrate
```

### 5. Jalankan Seeder

```bash
npx sequelize-cli db:seed:all
```

### 6. Jalankan Server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server berjalan di `http://localhost:3000`

## Default Account

| Username | Password | Role |
|----------|----------|------|
| superadmin | superadmin123 | Super Admin |
| admin | admin123 | Admin |

## Struktur Proyek

```
backend/
├── server.js                     # Entry point
├── .env                          # Environment variables
├── .sequelizerc                  # Sequelize CLI config
│
├── db/
│   ├── models/                   # Sequelize models
│   │   ├── index.js
│   │   ├── user.js
│   │   ├── category.js
│   │   ├── product.js
│   │   ├── stock_history.js
│   │   ├── sale.js
│   │   └── sale_item.js
│   ├── migrations/               # Database migrations
│   └── seeders/                  # Data seeders
│
└── src/
    ├── routes.js                 # Main router
    ├── config/config.json        # Database config
    ├── middleware/
    │   ├── auth.js               # JWT authentication
    │   ├── authorization.js      # Role-based access
    │   └── errorHandler.js       # Global error handler
    ├── utils/
    │   ├── api.js                # Response helpers
    │   ├── bcrypt.js             # Password hashing
    │   ├── jwt.js                # Token utilities
    │   └── validation.js         # Zod middleware
    └── modules/
        ├── auth/                 # Login
        ├── users/                # Manajemen pengguna
        ├── categories/           # Manajemen kategori
        ├── products/             # Manajemen barang
        ├── stocks/               # Manajemen stok
        ├── transactions/         # Transaksi penjualan
        └── reports/              # Laporan
```

## API Endpoints

Base URL: `http://localhost:3000/api`

### Authentication

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| POST | `/auth/login` | Public | Login (Mengatur HttpOnly Cookie) |
| POST | `/auth/logout` | Public | Logout (Menghapus Cookie) |

### Users

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/users` | Super Admin | Daftar pengguna |
| GET | `/users/:id` | Super Admin | Detail pengguna |
| POST | `/users` | Super Admin | Tambah pengguna |
| PUT | `/users/:id` | Super Admin | Update pengguna |
| PATCH | `/users/:id/password` | Super Admin | Ubah password |
| DELETE | `/users/:id` | Super Admin | Hapus pengguna |

### Categories

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/categories` | Admin | Daftar kategori |
| GET | `/categories/:id` | Admin | Detail kategori |
| POST | `/categories` | Admin | Tambah kategori |
| PUT | `/categories/:id` | Admin | Update kategori |
| DELETE | `/categories/:id` | Admin | Hapus kategori |

### Products

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/products` | Auth | Daftar barang |
| GET | `/products/barcode/:barcode` | Auth | Cari by barcode |
| GET | `/products/:id` | Auth | Detail barang |
| POST | `/products` | Admin | Tambah barang |
| PUT | `/products/:id` | Admin | Update barang |
| DELETE | `/products/:id` | Admin | Nonaktifkan barang |

**Query Parameters:** `?page=1&limit=10&search=keyword&category_id=1&status=true`

### Stocks

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| POST | `/stocks` | Admin | Tambah stok |
| GET | `/stocks/histories` | Admin | Riwayat penambahan stok |

**Query Parameters:** `?page=1&limit=10&product_id=1&start_date=2026-01-01&end_date=2026-12-31`

### Transactions

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| POST | `/transactions` | Kasir | Buat transaksi |
| GET | `/transactions` | Admin | Riwayat transaksi |
| GET | `/transactions/:id` | Auth | Detail transaksi |

**Query Parameters:** `?page=1&limit=10&start_date=2026-01-01&end_date=2026-12-31`

### Reports

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/reports/sales` | Admin | Laporan penjualan |
| GET | `/reports/stocks` | Admin | Laporan penambahan stok |
| GET | `/reports/profit` | Admin | Laporan perkiraan laba |

**Query Parameters:** `?start_date=2026-01-01&end_date=2026-12-31`

## Contoh Request & Response

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "user": {
      "id": 1,
      "name": "Administrator",
      "username": "admin",
      "role": "admin"
    }
  }
}
```
*(Token disimpan secara otomatis di browser via HTTP-Only Cookie)*

### Buat Transaksi

```bash
POST /api/transactions
Content-Type: application/json
Cookie: token=<token_jwt_anda>

{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 3, "quantity": 1 }
  ],
  "paid": 50000
}
```

```json
{
  "success": true,
  "message": "Transaksi berhasil",
  "data": {
    "id": 1,
    "invoice_number": "INV-20260812-0001",
    "total": 45000,
    "paid": 50000,
    "change": 5000,
    "items": [...]
  }
}
```

## Format Response API

### Success

```json
{
  "success": true,
  "message": "Pesan berhasil",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Pesan error"
}
```

### Validation Error

```json
{
  "success": false,
  "message": "Validasi gagal",
  "errors": {}
}
```

### Pagination

```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

## Database

### ERD

```
users
  │
  ├───────────────┐
  │               │
  ▼               ▼
sales       stock_histories
  │               │
  ▼               ▼
sale_items      products
                  │
                  ▼
              categories
```

### Tabel

| Tabel | Deskripsi |
|-------|-----------|
| `users` | Data pengguna (Admin & Kasir) |
| `categories` | Kategori barang |
| `products` | Data barang |
| `stock_histories` | Riwayat penambahan stok |
| `sales` | Data transaksi penjualan |
| `sale_items` | Detail item per transaksi |

## Scripts

```bash
npm run dev          # Development server (nodemon)
npm start            # Production server
npm run db:migrate   # Jalankan migration
npm run db:seed      # Jalankan seeder
npm run db:reset     # Reset database (undo + migrate + seed)
```

## Business Rules

- Barcode barang harus unik
- Harga modal & harga jual tidak boleh negatif
- Stok tidak boleh negatif
- Barang nonaktif tidak dapat dijual
- Transaksi hanya dilakukan oleh Kasir
- Stok berkurang otomatis setelah transaksi berhasil
- Pembayaran harus ≥ total transaksi
- Admin utama tidak dapat dihapus jika satu-satunya Admin
- Kategori tidak dapat dihapus jika masih digunakan barang

## Lisensi

Private — Sistem Informasi Koperasi
