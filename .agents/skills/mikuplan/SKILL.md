---
name: mikuplan
description: Sistem Perencanaan PRD (State Machine) untuk memproses ide, kuesioner, mindmap, dan menghasilkan dokumen PRD serta Task List.
---

# mikuplan - Sistem Perencanaan PRD (State Machine)

> [!IMPORTANT]
> **PENTING: LOKASI WORKSPACE & PENEMPATAN BERKAS**
> Seluruh berkas perencanaan (`state.json`, `docs/PRD.md`, `docs/MAIN_PLAN.md`) WAJIB dibaca, dibuat, dan ditulis di **root direktori workspace aktif host** tempat Anda beroperasi saat ini (misalnya jika workspace Anda adalah `my-cool-project`, maka berkas ditulis di `my-cool-project/state.json` dan `my-cool-project/docs/PRD.md`).
> DILARANG KERAS menempatkan atau memproses berkas-berkas ini di dalam folder `node_modules/mikuplan` atau folder internal paket pustaka lainnya.

Skill ini memandu AI Agent untuk mengelola proses perencanaan produk secara otomatis menggunakan file `state.json` sebagai jembatan komunikasi dengan antarmuka visual pengguna (Frontend).

## Alur Kerja State Machine

Setiap kali dipanggil, Anda harus membaca file `state.json` di root direktori proyek aktif Anda (workspace root), memeriksa nilai `state`, lalu menjalankan instruksi transisi berikut:

---

### 📥 TRANSISI STATE 1: Brainstorming -> Kuesioner

**Kondisi Pemicu:**
- `state == 1`
- `ideAwal` tidak kosong (`!== ""`)
- `kuesioner.pertanyaan` masih kosong

**Instruksi Kerja:**
1. Baca dan analisis `ideAwal` yang dimasukkan pengguna.
2. Buat **5 pertanyaan mendalam** yang spesifik untuk memperjelas kebutuhan MVP produk tersebut (misal: user persona, prioritas fitur utama, first-time experience, dll.).
3. Setiap pertanyaan **wajib** berupa objek terstruktur yang menyertakan rekomendasi jawaban berupa opsi/chips guna mempermudah input pengguna.
   Format yang harus Anda tulis ke JSON:
   ```json
   {
     "text": "Pertanyaan mendalam tentang fitur...",
     "options": ["Opsi Rekomendasi A", "Opsi Rekomendasi B", "Opsi Rekomendasi C"]
   }
   ```
4. Masukkan daftar pertanyaan tersebut ke `kuesioner.pertanyaan`.
5. Atur `kuesioner.currentIndex = 0` dan `kuesioner.totalPertanyaan = 5`.
6. Ubah nilai `state` menjadi `2`.
7. Simpan kembali data tersebut ke `state.json`.
8. **Output ke Pengguna:** Laporkan bahwa pertanyaan kuesioner telah berhasil dibuat, dan minta mereka membukanya di browser untuk menjawab.

---

### 📝 TRANSISI STATE 2: Kuesioner -> Struktur (Mindmap)

**Kondisi Pemicu:**
- `state == 2`
- `kuesioner.completed === true`
- `mindmap.nodes` masih kosong atau null

**Instruksi Kerja:**
1. Evaluasi ide awal (`ideAwal`) beserta seluruh jawaban kuesioner (`kuesioner.jawaban`).
2. Rancang struktur peta fitur MVP produk dalam bentuk hierarki pohon (Mindmap Tree).
3. Struktur mindmap harus memiliki format objek seperti berikut:
   ```json
   {
     "title": "Nama Aplikasi/Proyek MVP",
     "nodes": [
       {
         "id": "node1",
         "label": "Nama Modul Utama (Contoh: Manajemen Layanan)",
         "description": "Deskripsi singkat modul",
         "fase": "Fase 1",
         "expanded": true,
         "children": [
           { "id": "node1_1", "label": "Sub-fitur A", "description": "Deskripsi" },
           { "id": "node1_2", "label": "Sub-fitur B", "description": "Deskripsi" }
         ]
       }
     ]
   }
   ```
4. Simpan objek mindmap tersebut ke field `mindmap` di `state.json`.
5. Ubah nilai `state` menjadi `3`.
6. Simpan kembali data tersebut ke `state.json`.
7. **Output ke Pengguna:** Laporkan bahwa peta struktur fitur telah dirancang, dan minta mereka meninjaunya di browser.

---

### 🌳 TRANSISI STATE 3: Struktur -> PRD & Task List

**Kondisi Pemicu:**
- `state == 3`
- `mindmap.approved === true`
- `prd.markdown` masih kosong atau null

**Instruksi Kerja:**
1. Ambil seluruh data perencanaan sebelumnya (`ideAwal`, `kuesioner.jawaban`, dan struktur `mindmap`).
2. Generasikan dokumen **PRD (Product Requirements Document)** super lengkap dan terperinci. Dokumen ini wajib ditulis dalam format Markdown dan berisi bab berikut:
   - **1. Overview**: Latar belakang, rumusan masalah, nilai solusi.
   - **2. Requirements**: Batasan fungsional dan non-fungsional, serta standar *scalability*.
   - **3. Core Features Berbasis Roadmap**: Pembagian fase pengembangan (Fase 1 hingga Fase 5) dengan skala prioritas (*High/Medium/Low*).
   - **4. User Flow**: Alur langkah per-role pengguna (misal: *Alur Admin* vs *Alur Pelanggan*).
   - **5. Architecture & Sequence Diagram**: Deskripsi pola teknis dilengkapi diagram sequence menggunakan format Mermaid (`sequenceDiagram`).
   - **6. Database Schema**: Skema tabel relasional per-tabel lengkap dengan tipe data kolom, digambarkan dengan ER diagram menggunakan Mermaid (`erDiagram` dengan notasi *Crow's foot*).
   - **7. Tech Stack**: Rekomendasi teknologi (misalnya Next.js, Tailwind, SQLite, Drizzle ORM, Better Auth).
3. Simpan teks Markdown PRD tersebut ke dalam field `prd.markdown` di `state.json`.
4. **Wiring & Sinkronisasi File Fisik:**
   - Tulis isi dokumen PRD tersebut ke file baru bernama `docs/PRD.md` di direktori lokal agar tersimpan permanen.
   - Perbarui atau buat file `docs/MAIN_PLAN.md` dengan menyertakan checklist tugas teknis pengembangan yang ditarik dari rincian PRD tersebut (dari Fase 1 hingga Fase 5).
5. Ubah nilai `state` menjadi `4`.
6. Simpan kembali data tersebut ke `state.json`.
7. **Output ke Pengguna:** Laporkan bahwa PRD dan Task List telah berhasil dibuat, serta siap untuk ditinjau dan dikunci.

---

### 🔄 STATE 4: Penanganan Revisi / Finalisasi PRD

**Kondisi Pemicu:**
- `state == 4`

**Skenario A: Ada Feedback Revisi (`prd.revisiFeedback` tidak kosong)**
1. Baca input koreksi dari `prd.revisiFeedback`.
2. Lakukan revisi pada dokumen PRD sesuai instruksi koreksi tersebut. Pastikan komponen diagram Mermaid dan skema database ikut disesuaikan bila terdampak.
3. Simpan hasil revisi terbaru ke `prd.markdown` di `state.json` serta timpa file `docs/PRD.md`.
4. Jika ada perubahan fungsionalitas utama, perbarui juga daftar tugas di `docs/MAIN_PLAN.md`.
5. Kosongkan kembali field `prd.revisiFeedback` menjadi `""`.
6. Pastikan `prd.finalized` tetap `false` dan `state` tetap di `4`.
7. Simpan kembali data ke `state.json`.
8. **Output ke Pengguna:** Laporkan bahwa revisi PRD telah diterapkan, dan silakan meninjau kembali perubahannya.

**Skenario B: Finalisasi (`prd.finalized === true`)**
1. Lakukan penguncian final terhadap file perencanaan.
2. Pastikan file `docs/PRD.md` dan `docs/MAIN_PLAN.md` sudah dalam versi ter-update.
3. **Output ke Pengguna:** Berikan ucapan selamat 🎉 bahwa seluruh tahap perencanaan produk telah selesai dan terkunci. Informasikan bahwa mereka siap menjalankan skill `mikuwork` untuk mulai mengeksekusi kode tugas.
