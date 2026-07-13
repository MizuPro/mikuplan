---
name: mikuplan
description: Sistem Perencanaan PRD (State Machine) untuk memproses ide, kuesioner, referensi design opsional, mindmap, dan menghasilkan dokumen PRD serta Task List.
---

# mikuplan - Sistem Perencanaan PRD (State Machine)

> [!IMPORTANT]
> **PENTING: LOKASI WORKSPACE & PENEMPATAN BERKAS**
> Seluruh berkas perencanaan (`state.json`, `docs/PRD.md`, `docs/MAIN_PLAN.md`) WAJIB dibaca, dibuat, dan ditulis di root direktori workspace aktif host tempat Anda beroperasi saat ini.
> DILARANG KERAS menempatkan atau memproses berkas-berkas ini di dalam folder `node_modules/mikuplan` atau folder internal paket pustaka lainnya.

Skill ini memandu AI Agent mengelola proses perencanaan produk menggunakan `state.json` sebagai jembatan komunikasi dengan antarmuka pengguna.

## Aturan Fokus Design

- Tahap 1 (Brainstorming) dan tahap 2 (Kuesioner) **tidak boleh menanyakan preferensi visual/design secara eksplisit**. Fokus kedua tahap tersebut adalah masalah, pengguna, kebutuhan produk, fitur, alur, prioritas, dan batasan MVP.
- Jika pengguna dengan inisiatif sendiri sudah menuliskan arah design di `ideAwal`, pertahankan informasi itu sebagai konteks. Jangan menanyakannya kembali.
- Penggalian dan pemrosesan design dilakukan khusus pada tahap 3 (Referensi Design).
- Tahap Referensi Design bersifat opsional. Jika dilewati atau datanya tidak cukup jelas, Agent wajib memilih/menginferensikan arah design paling masuk akal dari seluruh konteks tanpa menghentikan alur untuk meminta preferensi design tambahan.

## Alur Kerja State Machine

Setiap kali dipanggil, baca `state.json` di root workspace, periksa nilai `state`, lalu jalankan tepat satu transisi yang sesuai berikut ini.
Setiap kali menyimpan `state.json`, pastikan field `workflowVersion` bernilai `2` agar penomoran enam tahap tidak dianggap sebagai workflow lama.

---

### TRANSISI STATE 1: Brainstorming -> Kuesioner

**Kondisi Pemicu:**
- `state == 1`
- `ideAwal` tidak kosong
- `kuesioner.pertanyaan` masih kosong

**Instruksi Kerja:**
1. Baca dan analisis `ideAwal`.
2. Buat tepat **5 pertanyaan mendalam** untuk memperjelas kebutuhan MVP, misalnya persona pengguna, masalah utama, prioritas fitur, first-time experience, alur kerja, data, integrasi, atau batasan teknis.
3. Jangan membuat pertanyaan yang secara eksplisit meminta gaya visual, warna, layout, mood, tipografi, design system, atau referensi design. Jika informasi design sudah ada di `ideAwal`, cukup simpan sebagai konteks tahap 3.
4. Setiap pertanyaan wajib berupa objek terstruktur dengan opsi/chips:
   ```json
   {
     "text": "Pertanyaan mendalam tentang kebutuhan produk...",
     "options": ["Opsi Rekomendasi A", "Opsi Rekomendasi B", "Opsi Rekomendasi C"]
   }
   ```
5. Simpan daftar ke `kuesioner.pertanyaan`.
6. Atur `kuesioner.currentIndex = 0` dan `kuesioner.totalPertanyaan = 5`.
7. Ubah `state` menjadi `2`, lalu simpan `state.json`.
8. **Output ke Pengguna:** Laporkan bahwa kuesioner berhasil dibuat dan minta pengguna menjawabnya di browser.

---

### TRANSISI STATE 2: Kuesioner -> Referensi Design

**Kondisi Pemicu:**
- `state == 2`
- `kuesioner.completed === true`

**Instruksi Kerja:**
1. Pastikan jawaban kuesioner sudah tersimpan. Jangan menambahkan pertanyaan baru tentang design atau preferensi visual.
2. Inisialisasi `referensiDesign` jika belum tersedia:
   ```json
   {
     "deskripsi": "",
     "files": [],
     "completed": false,
     "skipped": false
   }
   ```
3. Ubah `state` menjadi `3`, lalu simpan `state.json`.
4. **Output ke Pengguna:** Laporkan bahwa tahap Referensi Design sudah dibuka. Jelaskan singkat bahwa tahap ini opsional dan dapat dilewati dari browser.

---

### TRANSISI STATE 3: Referensi Design -> Struktur (Mindmap)

**Kondisi Pemicu:**
- `state == 3`
- `referensiDesign.completed === true`
- `mindmap.nodes` masih kosong atau null

**Instruksi Kerja:**
1. Evaluasi `ideAwal`, seluruh `kuesioner.jawaban`, dan `referensiDesign`.
2. Jika `referensiDesign.skipped === false`:
   - Gunakan `referensiDesign.deskripsi` sebagai arahan design.
   - Baca atau inspeksi setiap berkas pada `referensiDesign.files[].path` yang dapat diakses. Tarik pola visual, komponen, navigasi, dan batasan yang relevan.
   - Gabungkan keinginan design yang sudah disebut di `ideAwal` tanpa menanyakannya kembali.
3. Jika tahap dilewati atau referensinya tidak cukup jelas, tentukan sendiri arah design paling masuk akal berdasarkan jenis produk, persona, kebutuhan, dan jawaban kuesioner. Jangan meminta pertanyaan design tambahan.
4. Rancang struktur peta fitur MVP dalam hierarki pohon dengan format:
   ```json
   {
     "title": "Nama Aplikasi/Proyek MVP",
     "designDirection": "Ringkasan arah design yang diberikan atau diinferensikan",
     "nodes": [
       {
         "id": "node1",
         "label": "Nama Modul Utama",
         "description": "Deskripsi singkat modul",
         "fase": "Fase 1",
         "expanded": true,
         "children": [
           { "id": "node1_1", "label": "Sub-fitur A", "description": "Deskripsi" }
         ]
       }
     ]
   }
   ```
5. Simpan objek tersebut ke `mindmap`. `mindmap.designDirection` wajib berisi ringkasan keputusan design agar dapat digunakan pada PRD.
6. Ubah `state` menjadi `4`, lalu simpan `state.json`.
7. **Output ke Pengguna:** Laporkan bahwa referensi sudah diproses, atau bahwa arah design telah diinferensikan jika tahap dilewati, lalu minta pengguna meninjau Struktur di browser.

---

### TRANSISI STATE 4: Struktur -> PRD & Task List

**Kondisi Pemicu:**
- `state == 4`
- `mindmap.approved === true`
- `prd.markdown` masih kosong atau null

**Instruksi Kerja:**
1. Ambil seluruh data perencanaan: `ideAwal`, `kuesioner.jawaban`, `referensiDesign`, serta `mindmap` termasuk `mindmap.designDirection`.
2. Generasikan dokumen **PRD (Product Requirements Document)** yang lengkap dalam Markdown dan berisi:
   - **1. Overview**: Latar belakang, rumusan masalah, dan nilai solusi.
   - **2. Requirements**: Batasan fungsional, non-fungsional, dan standar scalability.
   - **3. Design Direction**: Arah visual, prinsip UX, komponen/pola penting, serta sumber keputusan (referensi user atau inferensi Agent). Jangan mengarang bahwa referensi berasal dari user jika tahap 3 dilewati.
   - **4. Core Features Berbasis Roadmap**: Fase 1 sampai Fase 5 dengan prioritas High/Medium/Low.
   - **5. User Flow**: Alur langkah per role.
   - **6. Architecture & Sequence Diagram**: Deskripsi teknis dan Mermaid `sequenceDiagram`.
   - **7. Database Schema**: Tabel, kolom, tipe data, dan Mermaid `erDiagram` dengan notasi Crow's foot.
   - **8. Tech Stack**: Rekomendasi teknologi yang relevan.
3. Simpan Markdown ke `prd.markdown`.
4. Tulis konten yang sama ke `docs/PRD.md` dan buat/perbarui `docs/MAIN_PLAN.md` dengan checklist teknis Fase 1 sampai Fase 5. Pastikan tugas UI/UX selaras dengan Design Direction.
5. Ubah `state` menjadi `5`, lalu simpan `state.json`.
6. **Output ke Pengguna:** Laporkan bahwa PRD dan Task List berhasil dibuat dan siap ditinjau.

---

### STATE 5: Penanganan Revisi / Finalisasi PRD

**Kondisi Pemicu:**
- `state == 5`

**Skenario A: Ada Feedback Revisi (`prd.revisiFeedback` tidak kosong)**
1. Baca `prd.revisiFeedback`.
2. Revisi PRD sesuai koreksi. Sesuaikan diagram, schema, Design Direction, dan tugas teknis bila terdampak.
3. Simpan hasil ke `prd.markdown` dan timpa `docs/PRD.md`.
4. Perbarui `docs/MAIN_PLAN.md` jika ada perubahan fitur atau implementasi utama.
5. Kosongkan `prd.revisiFeedback` menjadi `""`.
6. Pastikan `prd.finalized` tetap `false` dan `state` tetap `5`.
7. Simpan `state.json`.
8. **Output ke Pengguna:** Laporkan bahwa revisi sudah diterapkan dan minta pengguna meninjau kembali.

**Skenario B: Finalisasi (`prd.finalized === true`)**
1. Pastikan `docs/PRD.md` dan `docs/MAIN_PLAN.md` berada pada versi terbaru.
2. Pastikan `state` bernilai `6` sebagai tahap Eksekusi. Jika UI belum mengubahnya, ubah ke `6` dan simpan.
3. **Output ke Pengguna:** Laporkan bahwa perencanaan selesai dan pengguna siap menjalankan skill `mikuwork`.

---

### STATE 6: Eksekusi

Pada `state == 6`, tahap perencanaan sudah selesai. Jangan membuat ulang PRD. Arahkan pengguna menjalankan skill `mikuwork` agar checklist pada `docs/MAIN_PLAN.md` dieksekusi.
