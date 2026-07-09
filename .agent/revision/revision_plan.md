# Revision Plan

> Dibuat: 2026-07-09 11:25:00
> Permintaan user: Perkecil area header/footer luar agar area mindmap lebih besar, serta implementasikan fitur seret (pan/drag-to-scroll) dan zoom (in/out/reset) interaktif pada mindmap.

---

## Daftar Revisi

### 1. Pengecilan Dimensi Layout Luar (Sidebar, Header, & Footer)

**File:** `public/index.html`
**Bagian:** Sidebar layout, Header Screen 3, Footer Screen 3
**Jenis perubahan:** Refactor CSS Classes & HTML Layout

**Yang harus direvisi:**
- Kurangi lebar sidebar kiri dari kelas Tailwind `w-64` (256px) menjadi `w-52` (208px) untuk memperluas ruang horizontal konten utama.
- Desain ulang header di dalam `#screen-mindmap` (Screen 3) agar sangat tipis:
  - Ganti kelas padding `p-lg md:p-xl` menjadi `py-2 px-4`.
  - Perkecil font judul `03 / PETA STRUKTUR FITUR` menjadi `text-sm font-mono tracking-widest font-bold`.
  - Perkecil font deskripsi menjadi `text-[11px] text-neutral-500` dan letakkan secara kompak di bawah judul tanpa margin berlebih.
- Desain ulang footer di bawah `#screen-mindmap` (Screen 3):
  - Ubah padding dari `p-lg` menjadi `py-2 px-4`.
  - Perkecil font tips teks petunjuk geser menjadi `text-[10px]`.
  - Rampingkan ukuran tombol `btn-approve-mindmap` dengan mengurangi padding horizontal & vertikal (gunakan padding setara `px-4 py-1.5` atau sejenisnya) dan set ukuran font menjadi `text-[11px]`.

---

### 2. Fitur Drag-to-Scroll (Pan) & Zoom Interaktif

**File:** `public/index.html`
**Bagian:** Mindmap Viewport, CSS Styles, & JavaScript Logics
**Jenis perubahan:** Implementasi Fitur Interaksi (JS + CSS)

**Yang harus direvisi:**
- **CSS Styles:**
  - Tambahkan definisi CSS variable `--mindmap-zoom: 1;` di root `#screen-mindmap` atau `.mindmap-viewport`.
  - Refactor seluruh styling `.mindmap-node`, gap horizontal/vertikal, padding, dan font-size elemen mindmap agar dikalikan dengan variabel CSS `--mindmap-zoom` (misalnya: `min-width: calc(220px * var(--mindmap-zoom))`).
- **Drag-to-Scroll (Pan):**
  - Pasang event listener pada `#mindmap-viewport` (`mousedown`, `mousemove`, `mouseup`, `mouseleave`) untuk mendeteksi penekanan klik kiri pada area kosong (bukan node/tombol) dan menggeser scroll position (`scrollLeft`/`scrollTop`) secara alami.
  - Atur kursor mouse menjadi `cursor-grab` (default) dan `cursor-grabbing` (saat menyeret).
- **Zoom Controls & Mouse Wheel Zoom:**
  - Buat **floating zoom controls panel** terapung minimalis di sudut kanan bawah area gelap mindmap dengan tombol `[+]` (Zoom In), `[-]` (Zoom Out), dan `[Reset]` (Reset Zoom).
  - Tulis logika JavaScript untuk membatasi nilai zoom dari `0.6` hingga `1.5` dengan kenaikan/penurunan sebesar `0.1`.
  - Pasang listener event `wheel` pada viewport dengan pengecekan `e.ctrlKey` agar user bisa men-zoom menggunakan scroll wheel mouse secara mulus.
  - Panggil `drawMindmapConnections()` setiap kali level zoom berubah untuk menggambar ulang garis bezier pada posisi koordinat baru node yang disesuaikan secara fisik.

---

## Catatan Tambahan
- Perubahan ini tidak mempengaruhi API backend, sehingga tidak merusak fungsionalitas server maupun unit test integrasi yang ada.
- Verifikasi layout harus dilakukan secara manual di browser untuk memastikan kelancaran interaksi drag dan visualisasi zoom yang mulus tanpa pecah.
