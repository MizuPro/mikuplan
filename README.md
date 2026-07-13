# 🧠 PRD-Planner: Alat Pendamping Perencanaan Produk (Helper Tool)

PRD-Planner adalah platform perencanaan produk lokal, ultra-ringan, dan terisolasi yang dirancang untuk membantu para *developer* atau *vibe coder* merencanakan proyek perangkat lunak dari sekadar ide mentah menjadi dokumen PRD matang, diagram alur teknis, hingga daftar tugas (*task list*) siap eksekusi oleh AI Agent.

---

## 🎯 Filosofi & Cara Kerja

1. **100% Lokal & Terisolasi:** Aplikasi ini berjalan sepenuhnya di komputer lokal Anda. Berkas data pengguna (`state.json`) dan dependensi dimasukkan ke dalam `.gitignore` agar tidak ikut ter-commit ke dalam repositori utama proyek Anda.
2. **AI Agent Sebagai "Backend":** Aplikasi ini tidak memerlukan konfigurasi kunci API OpenAI/Gemini eksternal. Otak pemroses kecerdasan buatan diserahkan sepenuhnya ke AI Assistant bawaan IDE Anda (seperti Antigravity, Codex, Cursor, dll.) melalui pemanggilan **Skill**.
3. **Komunikasi Berbasis File (`state.json`):** Antarmuka visual (Frontend) berkomunikasi dengan AI Agent dengan menulis dan membaca berkas lokal `state.json` secara asinkronus dan aman (*file locking* + *atomic write*).

---

## 🛠️ Instalasi & Cara Menjalankan

### 1. Instalasi Global
Pasang `mikuplan` secara global ke sistem Anda menggunakan npm:
```bash
npm install -g mikuplan
```

### 2. Jalankan di Project Anda
Cukup buka terminal di direktori project aktif Anda (tempat Anda ingin membuat perencanaan), lalu jalankan:
```bash
mikuplan
```
*Atau gunakan alias singkat:*
```bash
mp
```

Perintah di atas akan:
1. Menyalakan server lokal pada peramban (browser):  
   👉 **[http://localhost:6767](http://localhost:6767)**
2. Membuat berkas `state.json` secara otomatis di direktori aktif Anda (sangat aman, dan disarankan untuk dimasukkan ke `.gitignore` project Anda).

---

## 🤖 Panduan Menggunakan Skill AI Agent

Aplikasi ini dilengkapi dengan dua AI Agent **Skill** bawaan yang terletak di folder `.agents/skills/`:

### 1. Skill Perencanaan: `mikuplan`
Digunakan selama tahap perencanaan produk untuk memproses status di Frontend.

* **Cara Memanggil:**  
  Buka panel AI Assistant pada IDE Anda di root proyek ini, lalu berikan instruksi:  
  > *"Jalankan skill mikuplan"* atau *"eksekusi mikuplan"*
* **Fungsi Logika:**
  - **State 1 (Brainstorm):** Membaca ide awal dan merancang 5 kuesioner pendalaman produk tanpa meminta preferensi design secara eksplisit.
  - **State 2 (Kuesioner):** Mengevaluasi jawaban kebutuhan produk lalu membuka tahap referensi design.
  - **State 3 (Referensi Design, opsional):** Menerima deskripsi dan/atau file referensi. Jika dilewati, AI Agent menentukan arah design dari konteks yang tersedia.
  - **State 4 (Struktur):** Merancang struktur/mindmap fitur produk beserta ringkasan arah design.
  - **State 5 (PRD & Revisi):** Menyusun dan merevisi `docs/PRD.md` beserta daftar tugas teknis `docs/MAIN_PLAN.md`.
  - **State 6 (Eksekusi):** Menampilkan progres implementasi dari Task List untuk dikerjakan melalui `mikuwork`.

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
