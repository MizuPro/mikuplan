---
name: mikuwork
description: Sistem Eksekusi Tugas AI untuk membaca Task List/MAIN_PLAN.md, menulis kode, memvalidasi fitur, dan mencentang task yang selesai.
---

# mikuwork - Sistem Eksekusi Tugas AI

Skill ini memandu AI Agent untuk bertindak sebagai developer handal yang bertugas mengeksekusi daftar tugas teknis pada file `docs/MAIN_PLAN.md` secara teratur dan berurutan sesuai dengan opsi eksekusi yang diminta oleh pengguna.

## Alur Kerja Eksekusi Tugas

Setiap kali dipanggil, Anda harus mengikuti prosedur berikut secara disiplin:

---

### 🔍 LANGKAH 1: Analisis Task List & Pemilihan Mode Eksekusi

1. Buka dan baca file `docs/MAIN_PLAN.md` di proyek Anda.
2. Periksa instruksi/kata kunci yang dikirim oleh pengguna pada perintah pemanggilan untuk menentukan cakupan tugas yang akan dieksekusi:

   * **KONDISI A: Tanpa Keyword Khusus (Mode Default)**
     * Identifikasi **1 tugas teratas** yang berstatus belum selesai (ditandai dengan `- [ ]`).
     * Ini adalah **Tugas Prioritas Utama** Anda. Jangan melompat ke tugas lain sebelum tugas ini diselesaikan.

   * **KONDISI B: Keyword "per fase" (Mode Per Fase)**
     * Cari fase aktif pertama yang masih memiliki tugas berstatus belum selesai (`- [ ]`) (misalnya, *Fase 1: Peta & Visualisasi Utama*).
     * Ambil **seluruh tugas yang belum selesai** di dalam fase aktif tersebut. Anda akan mengeksekusi semuanya satu per satu secara berurutan dalam satu giliran pengerjaan.

   * **KONDISI C: Keyword "sekaligus" (Mode Dinamis Sekaligus)**
     * Lakukan analisis terhadap tugas-tugas berikutnya yang belum selesai di list.
     * Kalkulasikan secara mandiri berapa banyak tugas berurutan yang aman untuk dikerjakan secara sekaligus (biasanya 2 hingga 4 tugas) dengan mempertimbangkan batasan kapasitas token, kompleksitas logika, dan kesalingtergantungan file.
     * Laporkan jumlah tugas yang akan dikerjakan kepada pengguna, lalu jalankan semuanya dalam satu giliran.

---

### 💻 LANGKAH 2: Implementasi Kode (Production-Grade)

Saat menulis kode untuk menyelesaikan tugas (baik satu tugas maupun beberapa tugas sekaligus), Anda **wajib** mengikuti aturan ketat berikut:

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

1. Jika tugas-tugas telah selesai diimplementasikan dan divalidasi dengan sukses, buka kembali file `docs/MAIN_PLAN.md`.
2. Ubah tanda centang tugas-tugas yang berhasil diselesaikan tersebut dari `- [ ]` menjadi `- [x]`.
3. Tulis laporan singkat kepada pengguna:
   - **Mode Eksekusi Yang Digunakan:** [Default / Per Fase / Sekaligus (Kalkulasi AI)]
   - **Tugas-tugas yang Selesai:** [Daftar nama/detail task yang diselesaikan]
   - **File yang Diubah/Dibuat:** [Daftar file yang terdampak]
   - **Metode Validasi:** [Hasil test run atau bukti verifikasi]
   - **Tugas Berikutnya:** [Detail task berikutnya yang belum dicentang]
