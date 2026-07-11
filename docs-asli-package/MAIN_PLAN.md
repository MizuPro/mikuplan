# 📋 MAIN_PLAN: PRD-Planner MVP

Dokumen ini memuat daftar fase pengembangan (Task List) untuk membangun aplikasi PRD-Planner. Pengerjaan harus dilakukan secara berurutan dan mengikuti prinsip **Anti Happy-Path**, **No Fake Mocks**, serta **Context-First Wiring**.

Every komponen yang berinteraksi dengan I/O (seperti penulisan file `state.json`) wajib menangani skenario kegagalan seperti file terkunci (*locked*), *concurrent access*, atau JSON yang tidak valid.

---

## 🚀 Fase 1: Setup Backend Ultra-Ringan (File I/O)
Fokus: Membuat server Node.js kecil sebagai perantara baca/tulis `state.json` dengan pengamanan I/O yang solid.

- [x] Inisialisasi proyek Node.js (`npm init -y`) dan instal framework ringan (misal: `express` atau cukup bawaan Node `http`).
- [x] Buat file `server.js` yang menyajikan file statis dari folder `public/`.
- [x] Buat API endpoint `GET /api/state` untuk membaca file `state.json`.
  - *Edge Case Check:* Tangani jika file tidak ada (buat default file), jika file *corrupted* (JSON tidak valid), atau tidak ada izin baca.
- [x] Buat API endpoint `POST /api/state` untuk menulis data ke `state.json`.
  - *Edge Case Check:* Terapkan *file locking* (menggunakan library seperti `proper-lockfile` atau asinkron I/O aman) untuk menghindari *race condition* jika frontend dan agen AI mencoba menulis bersamaan. Terapkan mekanisme *retry* jika gagal menyimpan.
- [x] Buat *Integration Test* sederhana untuk memvalidasi API `GET` dan `POST` dengan koneksi file riil (bukan mock).

---

## 🎨 Fase 2: Integrasi & Fungsionalitas Frontend
Fokus: Menghidupkan desain UI yang sudah ada dan menyambungkannya dengan Backend I/O.

- [x] Pindahkan file `references/design/design.html` (beserta asetnya) ke direktori `public/index.html`.
- [x] Modifikasi JavaScript di frontend untuk melakukan *fetch* awal ke `GET /api/state` saat halaman dimuat (untuk menentukan status *state* saat ini).
- [x] Implementasikan mekanisme *Auto-Refresh* (Polling). Frontend melakukan *fetching* setiap 3-5 detik ke `GET /api/state` untuk mendeteksi perubahan yang dilakukan oleh agen AI.
  - *Edge Case Check:* Tangani *Network Error* (jika server Node mati, tampilkan alert "Koneksi terputus, retrying...").
- [x] Integrasikan tombol/teks area pengguna untuk mengirimkan data kembali ke `POST /api/state` (saat pengguna Submit ide/tahap).
- [x] Pastikan *state* UI berganti (dari tahap 1, 2, dst) sesuai dengan nilai yang dikembalikan dari `state.json`.

---

## 🤖 Fase 3: Pembuatan Sistem Skill AI (mikuplan)
Fokus: Membuat otak logika agen AI (Skill mikuplan) untuk memandu proses PRD.

- [x] Definisikan skema final dari file `state.json` (berisi fase saat ini, data ide awal, data hasil kuesioner, struktur mindmap, dsb).
- [x] Buat folder skill `.agents/skills/mikuplan/`.
- [x] Tulis instruksi komprehensif di `mikuplan/SKILL.md`. Logikanya harus beroperasi seperti *State Machine*:
  - **Jika State = 1:** Baca input pengguna, generate 5 pertanyaan kuesioner, ubah state ke 2.
  - **Jika State = 2:** Evaluasi jawaban kuesioner, buat arsitektur fitur (mindmap), ubah state ke 3.
  - **Jika State = 3:** Konversi seluruh data menjadi dokumen PRD lengkap (`PRD.md`) dan *Task List*.
- [x] Lakukan uji coba pemanggilan `mikuplan` dari agen AI untuk membaca dan mengedit `state.json` yang riil.

---

## ⚙️ Fase 4: Pembuatan Sistem Skill AI Eksekusi (mikuwork)
Fokus: Membuat otak logika eksekutor untuk membaca Task List dan menulis kode.

- [x] Buat folder skill `.agents/skills/mikuwork/`.
- [x] Tulis instruksi komprehensif di `mikuwork/SKILL.md`.
- [x] Implementasikan logika agar skill ini mencari file *Task List* atau `MAIN_PLAN.md` yang digenerate oleh `mikuplan`.
- [x] Instruksikan agen (lewat `SKILL.md`) untuk selalu mengambil task prioritas pertama yang belum dicentang `[ ]`, mengeksekusinya, melakukan validasi/testing, lalu mengubah statusnya menjadi `[x]`.

---

## 📦 Fase 5: Finalisasi & Deployment Lokal
Fokus: Memastikan *developer experience* (DX) sempurna saat dijalankan oleh pengguna baru.

- [x] Tulis instruksi lengkap di `README.md` tentang cara *clone*, `npm install`, `npm run mikuplan` / `npm run mp`, dan cara memanggil skill di AI assistant pengguna.
- [x] Pastikan file `state.json` (data pengguna), `node_modules`, dan file sensitif lainnya berada di dalam `.gitignore`.
- [x] Lakukan *End-to-End Test* secara keseluruhan dengan skenario *real*:
  1. Jalankan `npm run mikuplan` atau `npm run mp`.
  2. Isi frontend dengan ide.
  3. Panggil `mikuplan`.
  4. Lihat UI auto-refresh.
  5. Selesaikan hingga PRD terbentuk.
  6. Panggil `mikuwork` untuk mengeksekusi task.

---
**Model Recommendation:** 
Plan ini lebih disarankan untuk dieksekusi menggunakan model **Gemini 3.1 Pro (High) / Advanced Model** karena melibatkan setup asinkronus (lockfile/I/O handling), pembuatan sistem instruksi agen AI (Skill) yang kompleks dan *context-heavy*, serta manipulasi *state machine*. Gemini 3 Flash mungkin kesulitan dalam merangkai instruksi AI untuk *state machine* tanpa mengalami halusinasi.
