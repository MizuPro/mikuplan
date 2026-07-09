# 🧠 Konsep & Arsitektur Aplikasi PRD-Planner

Dokumen ini menjelaskan konsep dasar, prinsip arsitektur, dan mekanisme kerja dari aplikasi perencanaan produk (PRD-Planner). Aplikasi ini dirancang secara spesifik sebagai **alat pendamping (helper tool)** bagi para *vibe coder* atau *developer* untuk merencanakan proyek mereka dari ide hingga siap dieksekusi.

---

## 🎯 1. Filosofi & Karakteristik Utama

*   **100% Lokal & Terisolasi:** Aplikasi ini dirancang untuk dijalankan murni di komputer lokal pengguna. Pengguna melakukan *clone* proyek ini langsung ke *root folder* proyek utama mereka. Folder aplikasi ini akan dimasukkan ke dalam `.gitignore` sehingga tidak akan ikut ter-commit ke repositori proyek utama pengguna.
*   **Sangat Ringan (Ultra-Lightweight):** Karena fokusnya adalah kecepatan dan kesederhanaan, aplikasi ini **tidak** menggunakan *framework* berat (seperti React, Next.js, atau Angular). Antarmuka dibangun sesederhana mungkin (menggunakan Vanilla HTML/CSS/JS) agar dapat dibuka dengan sangat cepat (misalnya cukup dengan *double-click* file HTML atau menggunakan satu baris *command server* bawaan).
*   **AI Agent Sebagai "Backend":** Aplikasi ini tidak memiliki backend server yang terhubung ke API OpenAI/Gemini secara langsung. Sebagai gantinya, **AI Agent bawaan IDE pengguna** (seperti Antigravity, Codex, Cursor, dll.) bertindak sebagai mesin pemroses (*processing engine*) melalui mekanisme pemanggilan **Skill**.

---

## ⚙️ 2. Mekanisme Kerja (Alur MVP)

Alih-alih menggunakan komunikasi HTTP API tradisional, aplikasi ini menggunakan **File JSON Lokal (`state.json`)** sebagai jembatan komunikasi antara Antarmuka Pengguna (Frontend) dan AI Agent (Backend).

Berikut adalah alur kerjanya:

### Langkah 1: Input Pengguna via Frontend
Pengguna membuka antarmuka visual (Frontend) yang sangat ringan. Sistem akan memuat data dari file `state.json` untuk mengetahui pengguna sedang berada di tahap mana (mengacu pada tahap di `alur-kerja.md`). 
*   **Contoh:** Di Tahap 1, pengguna mengetikkan ide awal proyek mereka di kolom yang disediakan.
*   Setelah selesai, Frontend akan menyimpan input tersebut kembali ke dalam file `state.json`.

### Langkah 2: Pemanggilan Skill AI (*Triggering the Agent*)
Pengguna beralih ke panel *AI Assistant* di IDE mereka dan memanggil sebuah **Skill** khusus (sebagai contoh, kita sebut skill ini: `mikuplan`).
*   *Prompt user:* `"Jalankan skill mikuplan"`

### Langkah 3: Pemrosesan oleh AI Agent
AI Agent akan merespons pemanggilan skill tersebut. Berdasarkan instruksi di dalam skill `mikuplan`, Agent akan:
1.  Membaca file `state.json` di direktori lokal.
2.  Mendeteksi status saat ini (misal: "Tahap 1 selesai diinput").
3.  Memproses ide pengguna tersebut dan menghasilkan output untuk tahap selanjutnya (misal: menyusun kuesioner pendalaman).
4.  Menulis/mengedit ulang file `state.json` dengan hasil pemrosesan tersebut dan mengubah status fase menjadi "Tahap 2".

### Langkah 4: Sinkronisasi UI (Auto-Refresh)
Antarmuka Frontend mendeteksi adanya perubahan pada file `state.json` (dapat menggunakan teknik *polling* sederhana atau sekadar pengguna melakukan *refresh* halaman).
*   UI kini memuat data baru, menampilkan tahap 2 (Kuesioner Interaktif) berdasarkan hasil pemikiran AI.

### Langkah 5: Iterasi (Fase Perencanaan)
Pengguna mengisi tahap 2, menyimpannya ke JSON, memanggil lagi skill `mikuplan`, dan AI kembali memprosesnya untuk masuk ke tahap 3 (Struktur/Mindmap). Siklus ini terus berulang hingga dokumen PRD dan *Task List* final berhasil digenerate di akhir tahap.

### Langkah 6: Eksekusi Tugas (*Execution Phase*)
Setelah tahap perencanaan (PRD) selesai dan *Task List* (daftar tugas) sudah terbentuk, alur berlanjut ke fase pengerjaan (*coding*). 
Pengguna akan memanggil skill baru (sebagai contoh, kita sebut: `mikuwork`).
*   **Mendeteksi Tugas:** Skill `mikuwork` akan membaca *Task List*. Jika ada tugas yang belum dikerjakan, ia akan langsung mengambil tugas yang belum selesai secara berurutan.
*   **Eksekusi:** Agent AI akan mengeksekusi tugas tersebut (menulis kode, membuat komponen, dsb.) sampai tuntas sesuai dengan spesifikasi dan batasan yang telah ditulis di PRD.
*   **Pengujian (Testing) & Validasi:** Setelah selesai menulis kode, Agent akan secara otomatis menjalankan *automated testing* (jika setup tersedia), atau memberikan instruksi pengujian manual yang sangat jelas kepada pengguna untuk memvalidasi fitur tersebut.
*   **Checklist Status:** Setelah tugas berhasil diselesaikan dan divalidasi, Agent akan memberikan tanda centang/checklist pada *Task List* tersebut, sehingga proses bisa berlanjut ke tugas berikutnya pada pemanggilan `mikuwork` selanjutnya.

---

## 💡 Kelebihan Konsep Ini

1.  **Zero Setup Backend:** Pengguna tidak perlu mengatur API Key LLM, menginstal dependensi backend yang kompleks, atau menjalankan server Node/Python yang berat. Semua pemrosesan kecerdasan buatan diserahkan kepada agen AI yang sudah terintegrasi di IDE pengguna.
2.  **Context-Aware:** Karena AI Agent berjalan di dalam IDE pengguna, ia memiliki konteks penuh atas *workspace* dan proyek pengguna, membuat hasil PRD atau *task list* jauh lebih akurat dan relevan dengan lingkungan kerja pengguna.
3.  **Fleksibilitas Tinggi:** Logika pemrosesan dapat diperbarui dengan mudah hanya dengan mengedit instruksi di dalam file Markdown/Skill (`mikuplan`), tanpa perlu me-recompile atau me-redeploy aplikasi.
