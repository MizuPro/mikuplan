---
name: mikuwork
description: Sistem Eksekusi Tugas AI untuk membaca Task List/MAIN_PLAN.md, menulis kode, memvalidasi fitur, dan mencentang task yang selesai.
---

# mikuwork - Sistem Eksekusi Tugas AI

Skill ini memandu AI Agent untuk bertindak sebagai developer handal yang bertugas mengeksekusi daftar tugas teknis pada file `docs/MAIN_PLAN.md` secara teratur dan berurutan.

## Alur Kerja Eksekusi Tugas

Setiap kali dipanggil, Anda harus mengikuti prosedur berikut secara disiplin:

---

### 🔍 LANGKAH 1: Analisis Task List

1. Buka dan baca file `docs/MAIN_PLAN.md` di proyek Anda.
2. Identifikasi task pertama yang berstatus belum selesai (ditandai dengan `- [ ]`).
3. Ini adalah **Task Prioritas Utama** Anda. Jangan melompat ke tugas lain sebelum tugas ini diselesaikan.

---

### 💻 LANGKAH 2: Implementasi Kode (Production-Grade)

Saat menulis kode untuk menyelesaikan task, Anda **wajib** mengikuti aturan ketat berikut:

1. **Anti Happy-Path (Graceful Error Handling):**
   - Setiap operasi yang melibatkan I/O, database, API calls, atau concurrency wajib menangani skenario kegagalan secara eksplisit.
   - Gunakan mekanisme *retry* dengan backoff jika terjadi kegagalan jaringan/file locked.
   - Terapkan *backpressure* (jangan pernah mendrop data begitu saja tanpa penanganan).

2. **No Fake Mocks (Real Testing):**
   - Dilarang keras menggunakan bypass logika (seperti `if db == nil { return }`) pada pengujian Anda.
   - Jika menulis unit test atau integration test, lakukan verifikasi terhadap database/file fisik yang riil.

3. **Context-First Wiring (Integrasi Penuh):**
   - Jangan biarkan komponen baru mengambang. Segera daftarkan, panggil, atau hubungkan (*wiring*) komponen baru tersebut ke komponen hulu (*upstream*) yang sudah berjalan di codebase.

---

### 🧪 LANGKAH 3: Validasi & Pengujian

Sebelum menandai tugas selesai:
1. Jalankan tes otomatis (`npm test` atau runner test bahasa pemrograman yang digunakan) untuk memastikan perubahan tidak merusak fitur lain.
2. Lakukan pembuktian terhadap *edge-cases* (misal: input tidak valid, koneksi putus, race condition).

---

### 📝 LANGKAH 4: Update Progress & Output

1. Jika tugas telah selesai diimplementasikan dan divalidasi dengan sukses, buka kembali file `docs/MAIN_PLAN.md`.
2. Ubah tanda centang tugas tersebut dari `- [ ]` menjadi `- [x]`.
3. Tulis laporan singkat kepada pengguna:
   - **Tugas yang Selesai:** [Nama/Detail Task]
   - **File yang Diubah/Dibuat:** [Daftar file]
   - **Metode Validasi:** [Hasil test run atau bukti verifikasi]
   - **Tugas Berikutnya:** [Detail task berikutnya yang belum dicentang]
