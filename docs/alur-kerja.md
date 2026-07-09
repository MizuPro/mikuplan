# 📑 ALUR KERJA LENGKAP PLATFORM PERENCANAAN PRODUK

Dokumen ini menjelaskan alur interaksi pengguna dan proses sistem di dalam platform untuk mengubah ide mentah menjadi dokumen PRD matang, arsitektur teknis, hingga daftar tugas (*task list*) siap eksekusi.

---

## 1. Tahap Input Ide Awal (*Brainstorming*)

Ini adalah gerbang utama aplikasi di mana pengguna mendefinisikan konsep dasar dari proyek yang ingin mereka bangun.

* **Aktivitas Pengguna:** Pengguna memasukkan deskripsi singkat atau ide mentah mengenai aplikasi/website pada kolom utama *"Mau bikin apa?"*.
* **Fitur Pendukung:** * **Pilihan Bahasa:** Pengguna dapat menentukan bahasa output dokumen (contoh: Bahasa Indonesia).
  * **File Referensi:** Tersedia file contoh (`contoh_prd.md`) untuk memberikan gambaran format akhir kepada pengguna.
  * **Riwayat Proyek:** Opsi *"Lihat PRD sebelumnya"* untuk mengakses draf yang pernah dibuat.

---

## 2. Tahap Pendalaman Kebutuhan (*Interactive Questionnaire*)

Setelah ide awal dikirim, AI tidak langsung membuat dokumen, melainkan melakukan validasi kebutuhan melalui kuesioner interaktif.

* **Proses Validasi (0/5 Pertanyaan):** AI menyajikan beberapa pertanyaan krusial untuk memperjelas arah produk, seperti:
  1. **User Persona & Masalah:** Siapa yang butuh aplikasi ini dan bagaimana cara mereka menyelesaikan masalah tersebut saat ini?
  2. **First-Time User Experience:** Apa hal pertama yang harus dilakukan pengguna saat membuka aplikasi sebelum mereka menutupnya?
  3. **Prioritas Fitur Utama (MVP):** Memilih minimal 3 fitur yang wajib ada (diambil dari pilihan yang disediakan atau mengetik sendiri).
* **Kemudahan Input:** Pengguna bisa mengetik jawaban secara mendetail atau memilih rekomendasi berupa *chips/tags* siap klik untuk mempercepat proses. Pengguna juga diberikan opsi untuk melewati (*skip/lewati*) pertanyaan tertentu.

---

## 3. Tahap Visualisasi Peta Fitur (*Structure / Mindmap Phase*)

Setelah kuesioner dilengkapi, sistem beralih ke menu **Struktur** untuk memetakan arsitektur fitur secara visual sebelum masuk ke dokumen teks yang padat.

* **Visualisasi Node Tree:** AI memetakan ide dan jawaban kuesioner ke dalam bentuk *mindmap* interaktif.
* **Hierarki Produk:** Menampilkan modul utama (misal: *Layar Kasir, Manajemen Barang, Riwayat Transaksi*) yang dilengkapi label fase pengembangan (seperti *Fase 1*).
* **Sub-Fitur:** Setiap modul dapat diekspand untuk melihat daftar sub-fitur di bawahnya (misal: modul *Layar Kasir* memiliki sub-fitur *Daftar Barang Aktif, Keranjang Belanja, Hitung Total & Bayar*).

---

## 4. Tahap Pembuatan Dokumen PRD & Perencanaan Teknis (*PRD Generation*)

Setelah struktur disetujui dan pengguna mengklik tombol *"Lanjutkan"*, AI secara otomatis menyusun dokumen **PRD (Product Requirements Document)** super lengkap yang mencakup aspek bisnis dan teknis. Dokumen PRD ini disusun dengan prinsip **Scalable** (mudah diskalakan), memastikan arsitektur dan struktur proyek siap untuk penambahan fitur-fitur kompleks di masa depan tanpa harus merombak sistem dari nol.

### 📄 Komponen Output Dokumen PRD:
* **1. Overview:** Penjelasan latar belakang, rumusan masalah lama (proses manual), dan nilai solusi yang ditawarkan aplikasi.
* **2. Requirements:** Batasan fungsional dan non-fungsional proyek (misal: *Real-time access, Dual-Role System, Mobile-Friendly, Efisiensi Transaksi*, serta standar **Scalability** untuk menampung pertumbuhan pengguna dan fitur).
* **3. Core Features Berbasis Roadmap:** Pembagian kerja yang jelas dari Fase 1 hingga Fase 5 lengkap dengan tingkat prioritas (*High/Medium/Low*).
* **4. User Flow:** Alur langkah demi langkah yang logis untuk masing-masing pengguna (contoh: *Alur Pelanggan* vs *Alur Admin*).
* **5. Architecture & Sequence Diagram:** Penjelasan teknis mengenai pola aplikasi (seperti *Single-Page Application dengan Server-Side Rendering*) dilengkapi diagram urutan interaksi antara *Customer/Admin*, *Frontend App*, *Backend API*, dan *Database* yang direpresentasikan menggunakan **Sequence Diagram**.
  > 💡 **Cara AI Menulis Sequence Diagram:** AI membuat Sequence Diagram dengan menuliskan sintaks berbasis teks yang disebut **Mermaid JS**. Di dalam dokumen Markdown, AI menggunakan *code block* dengan identifier ````mermaid```` dan mendeklarasikan tipe grafiknya sebagai `sequenceDiagram`. Kode ini mendefinisikan aktor/partisipan (misal: Frontend, Backend) serta alur panah pesannya (misal: `Frontend->>Backend: Kirim Data`). Platform *Markdown viewer* (seperti GitHub) akan membaca kode ini dan secara otomatis merendernya menjadi grafis diagram visual.
* **6. Database Schema:** Struktur tabel lengkap (tabel *Users, Courts, Bookings*) beserta kolom dan tipe datanya (UUID, String, Integer, Date, Time). Skema ini direpresentasikan secara spesifik *table-per-table*. Relasi antar tabel, termasuk *Primary Key* (PK) dan *Foreign Key* (FK), digambarkan secara visual menggunakan notasi **Crow's foot** (Entity Relationship Diagram). Serupa dengan Sequence Diagram, ER Diagram ini juga dibuat memanfaatkan sintaks **Mermaid** dengan mendeklarasikan `erDiagram`.
* **7. Tech Stack:** Rekomendasi teknologi modern yang ringan dan cepat untuk eksekusi (seperti *Next.js, Tailwind CSS, shadcn/ui, Drizzle ORM, SQLite,* dan *Better Auth*).

### 🔄 Evaluasi dan Revisi PRD
Setelah dokumen PRD dihasilkan secara otomatis, pengguna tidak langsung diwajibkan untuk masuk ke tahap eksekusi, melainkan memiliki opsi untuk:
* **Mengevaluasi Hasil:** Meninjau kembali kelengkapan komponen PRD dari Overview hingga Tech Stack.
* **Meminta Revisi:** Jika terdapat ketidaksesuaian (misal: fitur ada yang kurang, alur bisnis perlu disesuaikan, atau rekomendasi *tech stack* ingin diubah), pengguna dapat memberikan *feedback* kepada AI. Sistem akan menyesuaikan dan merevisi dokumen PRD secara interaktif hingga dokumen disetujui untuk dikunci (finalisasi).

---

## 5. Referensi Frontend (Opsional)

Bagian ini memuat acuan visual atau struktural yang disediakan oleh pengguna untuk menentukan arah desain antarmuka (*user interface*). Jika pengguna tidak memiliki referensi awal, bagian ini dapat dilewati (*skip*).

* **Status Referensi:** [Ada / Tidak Ada]  
* **Jenis Aset yang Dilampirkan:** * [ ] Gambar / Tangkapan Layar Mockup  
  * [ ] File HTML / CSS Mentah  
  * [ ] Dokumen Panduan Desain (`design.md`)  
* **Target Kemiripan Desain:** **[0 - 100%]** > 📌 **Catatan Teknis:** Skala persentase kemiripan (0-100%) ini menjadi tolok ukur bagi AI atau developer dalam mengadopsi elemen visual (seperti tata letak, palet warna, tipe font, dan komponen UI) dari referensi yang diberikan ke dalam produk akhir.

---

## 6. Pengerjaan Task & Checklist Task List

Daftar kerja (*task list*) terperinci yang disusun berdasarkan prioritas fitur untuk mempermudah pelacakan progres pengembangan aplikasi (*coding phase*):

### 🛠️ Tahap Awal: Setup Fondasi Proyek
* [ ] Initialize repositori proyek menggunakan Next.js (App Router) & React.js.
* [ ] Integrasi styling menggunakan Tailwind CSS dan instalasi komponen dasar dari shadcn/ui.
* [ ] Konfigurasi database engine menggunakan SQLite dan inisialisasi Drizzle ORM.
* [ ] Setup sistem autentikasi (Daftar, Login, Reset Password) dengan Better Auth.

### 📱 Tahap Pengembangan: Fitur Utama (Core Features)
#### [ ] Pengembangan Fase 1: Jelajah Slot (High)
* [ ] Desain dan migrasi tabel `Courts` pada database.
* [ ] Implementasi halaman daftar lapangan Padel beserta detail fasilitas dan harga.
* [ ] Pembuatan komponen kalender interaktif untuk menampilkan slot waktu kosong secara real-time.

#### [ ] Pengembangan Fase 2: Pesan & Bayar (High)
* [ ] Desain dan migrasi tabel `Bookings` (menghubungkan Foreign Key ke `Users` dan `Courts`).
* [ ] Pembuatan form pemesanan untuk input data pelanggan dan pemilihan slot waktu.
* [ ] Implementasi fitur unggah file untuk bukti transfer bank/e-wallet (`payment_proof_url`).

#### [ ] Pengembangan Fase 4: Masuk & Daftar (High)
* [ ] Pembuatan halaman registrasi pengguna baru dan halaman login.
* [ ] Implementasi middleware untuk proteksi rute halaman berdasarkan *role* (Customer vs Admin).

#### [ ] Pengembangan Fase 5: Dashboard Admin (High)
* [ ] Pembuatan halaman dashboard khusus dengan hak akses Admin.
* [ ] Implementasi fitur verifikasi pembayaran (fitur ganti status booking menjadi *Approved* atau *Cancelled*).
* [ ] Pembuatan halaman ringkasan laporan pemesanan harian.

#### [ ] Pengembangan Fase 3: Riwayat Booking (Medium)
* [ ] Pembuatan halaman riwayat transaksi untuk akun *Customer*.
* [ ] Implementasi fitur pembatalan pesanan sesuai dengan kebijakan batas waktu yang ditentukan.

### 🚀 Tahap Akhir: Finetuning & Deployment
* [ ] Pengujian menyeluruh (*end-to-end testing*) alur pemesanan dari sisi Customer hingga verifikasi Admin.
* [ ] Validasi performa Server-Side Rendering (SSR) untuk memastikan optimasi SEO berjalan maksimal.
* [ ] Deployment aplikasi ke platform hosting (seperti Vercel atau Railway) agar bisa diakses publik.
