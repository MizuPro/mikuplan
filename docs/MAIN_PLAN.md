# 📋 MAIN_PLAN: KosNomad - Co-Living & Room Management System MVP

Dokumen ini memuat daftar fase pengembangan (Task List) untuk membangun aplikasi KosNomad. Pengerjaan harus dilakukan secara berurutan dan mengikuti prinsip **Anti Happy-Path**, **No Fake Mocks**, serta **Context-First Wiring**.

Setiap komponen yang berinteraksi dengan database atau I/O wajib menangani skenario kegagalan secara eksplisit dengan retry mechanism dan database transaction.

---

## 🚀 Fase 1: Setup Proyek, Database & Modul Kamar/Properti
Fokus: Setup base project (React + Node.js + PostgreSQL), migrasi database, dan modul properti/kamar.

- [ ] Inisialisasi Express backend dan React frontend (Vite) dalam satu monorepo lokal.
- [ ] Konfigurasi koneksi database PostgreSQL menggunakan client pool (`pg`) lengkap dengan retry mechanism (exponential backoff) saat koneksi pertama kali didirikan.
- [ ] Buat file migrasi database untuk skema tabel: `users`, `tenants`, `rooms`, `facilities`, `contracts`, `invoices`, dan `transactions` sesuai spesifikasi PRD.
- [ ] Buat API Endpoint CRUD untuk Manajemen Kamar (`GET`, `POST`, `PUT`, `DELETE` `/api/rooms`).
  - *Edge Case Check:* Tangani kegagalan jika nomor kamar duplikat, input data tidak valid, atau database terputus.
- [ ] Buat API Endpoint untuk Manajemen Fasilitas Kamar (`GET`, `POST`, `DELETE` `/api/facilities`).
- [ ] Buat halaman UI React untuk menampilkan katalog kamar, mengubah status kamar (`available`, `occupied`, `maintenance`), dan mengelola fasilitas.
- [ ] Tulis *Integration Test* riil menggunakan PostgreSQL test database untuk memvalidasi fungsi CRUD kamar (Dilarang menggunakan fake mocks).

---

## 👥 Fase 2: Autentikasi, Manajemen Penyewa & Kontrak Sewa
Fokus: Mengamankan API dengan autentikasi berbasis role serta mengelola data penyewa profesional & kontrak aktif.

- [ ] Implementasikan registrasi dan login menggunakan hashing password aman (bcrypt/argon2) dan autentikasi berbasis sesi/token JWT.
- [ ] Batasi hak akses API: Hanya role `owner` yang bisa memodifikasi data kamar dan menyetujui invoice; role `tenant` hanya bisa melihat invoice miliknya dan mengunggah bukti bayar.
- [ ] Buat API Endpoint CRUD untuk Manajemen Penyewa (`/api/tenants`).
  - *Edge Case Check:* Validasi format URL untuk link portfolio penyewa dan nomor kontak darurat wajib diisi.
- [ ] Buat API Endpoint untuk pembuatan Kontrak Sewa baru (`POST /api/contracts`).
  - *Edge Case Check:* Pastikan kamar yang dipilih statusnya `available` sebelum diikat kontrak. Gunakan DB Transaction agar pembuatan kontrak dan pembaruan status kamar menjadi `occupied` berjalan secara atomik.
- [ ] Buat halaman UI React untuk daftar penyewa, pembuatan kontrak baru, dan halaman login/register yang interaktif.

---

## 💸 Fase 3: Sistem Invoice & Konfirmasi Pembayaran
Fokus: Generator tagihan otomatis, pengunggahan bukti bayar oleh penyewa, dan jurnal keuangan dasar.

- [ ] Buat scheduler/cron job backend (atau skrip generator pemicu) untuk membuat data `invoices` baru secara otomatis bagi kontrak yang aktif setiap bulan.
  - *Edge Case Check:* Tangani skenario jika invoice untuk bulan berjalan sudah pernah dibuat (mencegah double-billing).
- [ ] Buat API Endpoint bagi penyewa untuk mengunggah bukti pembayaran (`POST /api/invoices/:id/pay`).
  - *Edge Case Check:* Validasi tipe file upload (hanya gambar png/jpg) dan batasi ukuran maksimum (misal: 2MB).
- [ ] Buat API Endpoint bagi pemilik untuk menyetujui pembayaran (`POST /api/invoices/:id/verify`).
  - *Edge Case Check:* Gunakan database transaction. Saat disetujui, update status invoice menjadi `paid`, buat record baru di tabel `transactions` sebagai tipe `income` secara otomatis, dan pastikan kamar tetap ter-update statusnya.
- [ ] Buat API Endpoint pencatatan transaksi pengeluaran operasional kost manual oleh pemilik (`POST /api/transactions`).
- [ ] Buat halaman UI React: Portal tagihan bagi penyewa untuk upload bukti bayar, dan halaman verifikasi pembayaran bagi pemilik.

---

## 📊 Fase 4: Dashboard Laporan & Analitik
Fokus: Menyajikan metrik finansial, tingkat hunian, dan pengeksporan laporan laba-rugi.

- [ ] Buat API Endpoint untuk agregasi data dasbor:
  - Total pendapatan sewa dan pengeluaran operasional per bulan.
  - Persentase tingkat keterisian kamar (occupancy rate).
  - Rata-rata durasi tinggal penyewa.
- [ ] Integrasikan pustaka grafik (seperti Chart.js atau Recharts) di frontend React untuk memvisualisasikan grafik arus kas bulanan.
- [ ] Buat fitur ekspor data laporan arus kas bulanan ke berkas PDF atau CSV melalui API `/api/reports/export`.
  - *Edge Case Check:* Tangani jika data transaksi kosong pada bulan yang dipilih dengan menampilkan empty state yang rapi di UI.
- [ ] Buat tampilan UI Dashboard utama pemilik kost yang premium, bersih, dan informatif.

---

## 🔒 Fase 5: Keamanan Ekstrem, Pengujian E2E & Validasi Edge-Cases
Fokus: Menguji ketahanan aplikasi terhadap kegagalan koneksi, race conditions, dan input invalid.

- [ ] Terapkan Rate Limiter pada endpoint sensitif (`/api/auth/login`, `/api/invoices/:id/pay`) untuk mencegah brute force dan spam upload.
- [ ] Simulasikan kegagalan jaringan database di test suite untuk memvalidasi bahwa retry mechanism berjalan lancar dan data transaksi di-rollback sepenuhnya jika operasi gagal di tengah jalan.
- [ ] Tulis End-to-End integration test dari alur: Registrasi Tenant -> Pembuatan Kontrak -> Generate Invoice -> Tenant Upload Bukti Bayar -> Owner Verifikasi -> Update Grafik Cash Flow.
- [ ] Implementasikan Graceful Shutdown di backend Express untuk menutup koneksi database pool dan server HTTP secara bersih tanpa memutus request yang sedang berjalan.

---

**Model Recommendation:**
Plan ini sangat direkomendasikan untuk dieksekusi menggunakan model **Gemini 3.5 Pro** atau model advanced setara. Hal ini dikarenakan pengerjaan melibatkan setup full-stack terintegrasi (React + Express + PostgreSQL), penulisan skema migrasi tabel relasional yang kompleks, penerapan Database Transaction atomik yang ketat untuk alur pembayaran, penanganan concurrency/locking, serta integrasi pustaka visualisasi grafik di frontend. Gemini 3.5 Flash bisa digunakan untuk tugas-tugas UI sederhana di frontend, tetapi logika backend transaksi dan pengujian integrasi memerlukan ketelitian tinggi dari model Pro.
