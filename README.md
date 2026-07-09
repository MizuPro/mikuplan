# 🧠 PRD-Planner: Alat Pendamping Perencanaan Produk (Helper Tool)

PRD-Planner adalah platform perencanaan produk lokal, ultra-ringan, dan terisolasi yang dirancang untuk membantu para *developer* atau *vibe coder* merencanakan proyek perangkat lunak dari sekadar ide mentah menjadi dokumen PRD matang, diagram alur teknis, hingga daftar tugas (*task list*) siap eksekusi oleh AI Agent.

---

## 🎯 Filosofi & Cara Kerja

1. **100% Lokal & Terisolasi:** Aplikasi ini berjalan sepenuhnya di komputer lokal Anda. Berkas data pengguna (`state.json`) dan dependensi dimasukkan ke dalam `.gitignore` agar tidak ikut ter-commit ke dalam repositori utama proyek Anda.
2. **AI Agent Sebagai "Backend":** Aplikasi ini tidak memerlukan konfigurasi kunci API OpenAI/Gemini eksternal. Otak pemroses kecerdasan buatan diserahkan sepenuhnya ke AI Assistant bawaan IDE Anda (seperti Antigravity, Codex, Cursor, dll.) melalui pemanggilan **Skill**.
3. **Komunikasi Berbasis File (`state.json`):** Antarmuka visual (Frontend) berkomunikasi dengan AI Agent dengan menulis dan membaca berkas lokal `state.json` secara asinkronus dan aman (*file locking* + *atomic write*).

---

## 🛠️ Instalasi & Cara Menjalankan

### 1. Prasyarat
Pastikan Anda sudah menginstal **Node.js** (versi 18 ke atas direkomendasikan).

### 2. Setup Awal
Salin seluruh folder `PRD-Planner` ke dalam root folder proyek utama Anda. Masuk ke folder `PRD-Planner` dan jalankan:
```bash
npm install
```

### 3. Menjalankan Server
Jalankan server Node.js lokal dengan perintah:
```bash
npm start
```
Buka peramban (browser) Anda dan akses:  
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🤖 Panduan Menggunakan Skill AI Agent

Aplikasi ini dilengkapi dengan dua AI Agent **Skill** bawaan yang terletak di folder `.agents/skills/`:

### 1. Skill Perencanaan: `mikuplan`
Digunakan selama tahap perencanaan produk untuk memproses status di Frontend.

* **Cara Memanggil:**  
  Buka panel AI Assistant pada IDE Anda di root proyek ini, lalu berikan instruksi:  
  > *"Jalankan skill mikuplan"* atau *"eksekusi mikuplan"*
* **Fungsi Logika:**
  - **State 1 (Brainstorm):** Membaca ide awal Anda dan merancang 5 kuesioner pendalaman teknis.
  - **State 2 (Kuesioner):** Mengevaluasi tanggapan kuesioner Anda untuk merancang struktur/mindmap fitur produk.
  - **State 3 (Struktur):** Menyusun dokumen PRD lengkap (`docs/PRD.md`) dengan diagram Mermaid (Sequence & ER diagram) serta daftar tugas teknis (`docs/MAIN_PLAN.md`).
  - **State 4 (PRD & Revisi):** Mengelola revisi jika Anda mengetik masukan koreksi pada kolom revisi di Frontend.

---

### 2. Skill Eksekutor: `mikuwork`
Digunakan setelah dokumen PRD dikunci dan daftar tugas (`docs/MAIN_PLAN.md`) telah terbentuk.

* **Cara Memanggil:**  
  Buka panel AI Assistant dan instruksikan:  
  > *"Jalankan skill mikuwork"*
* **Fungsi Logika:**
  - Membaca daftar tugas di `docs/MAIN_PLAN.md`.
  - Mengambil tugas prioritas pertama yang belum dicentang `[ ]`.
  - Melakukan pengerjaan kode (*coding*), pengujian integrasi riil, melakukan *wiring* (integrasi ke sistem hulu), dan jika sukses, secara otomatis mencentang task tersebut menjadi `[x]`.

---

## 🧪 Menjalankan Tes Integrasi (Backend)
Untuk memverifikasi keamanan baca/tulis, penguncian file, penanganan konkurensi, dan pemulihan data corrupt, jalankan perintah tes bawaan Node.js:
```bash
npm test
```
