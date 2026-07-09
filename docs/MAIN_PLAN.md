# MAIN PLAN: Traffic Jam Simulator 2D MVP

Berikut adalah rencana eksekusi dan checklist tugas teknis pengembangan (Task List) untuk MVP, berdasarkan PRD.

> **Catatan Penting**: Sesuai dengan _user rules_, setiap implementasi harus mengedepankan kualitas. Komponen yang berhubungan dengan I/O/State wajib menangani _failure scenarios_ secara eksplisit. Selalu lakukan integrasi penuh (Context-First Wiring) ke upstream yang ada. Jika perlu komponen baru, cari dependencies yang bisa digunakan sebelum buat manual dari awal. Dilarang memalsukan testing. Tidak menggunakan data mockup (kecuali disuruh).

---

## Fase 1: Core Simulation Engine
- [x] Inisialisasi struktur file HTML, CSS (Vanilla), dan JS.
- [x] Implementasi Canvas 2D dan Grid System (Sistem Koordinat).
- [x] Implementasi fungsi Game Loop (`requestAnimationFrame`), Manajemen Waktu (Play, Pause, Tick rate).
- [x] Integrasi sistem render (Canvas) untuk menggambar _tile_ jalan dan map kosong.
- [x] **Validasi Edge-Cases**: Buktikan apa yang terjadi jika game loop dipause di tengah update state, dan jika user meresize browser window.

## Fase 2: Sandbox & Map Editor
- [x] Membuat antarmuka UI Toolbar sederhana (mode gambar, mode hapus).
- [x] Fitur *Road Builder*: Fungsi menambahkan tile jalan ke atas grid (dan memperbarui `StateManager`).
- [x] Fitur *Traffic Light Editor*: Fungsi menambahkan lampu ke grid persimpangan, serta timer siklus warnanya.
- [x] Fitur *Vehicle Spawner*: Fungsi meng-instantiate object mobil pada tile jalan tertentu.
- [x] **Validasi Edge-Cases**: Buktikan apa yang terjadi jika user mencoba meletakkan mobil di luar jalan atau di atas mobil lain (input invalid).

## Fase 3: Advanced Vehicle AI
- [x] Implementasi pergerakan dasar kendaraan (jalan lurus mengikuti tile jalan).
- [x] Sistem *Smart Pathfinding* (Kendaraan mengenali rute jalan dan bisa berbelok di persimpangan).
- [x] *Collision Avoidance*: Deteksi tabrakan depan, otomatis melakukan pengereman dan menjaga jarak.
- [x] Interaksi dengan *Traffic Light*: Kendaraan berhenti otomatis saat lampu merah dan jalan saat hijau.
- [x] (Opsional/Medium) *Lane Management*: (Dilewati untuk versi MVP demi menjaga stabilitas grid 1-lajur).
- [x] **Validasi Edge-Cases**: Buktikan penanganan _race condition_ atau tabrakan saat dua mobil memasuki persimpangan sekaligus dari arah berbeda.

## Fase 4: UI/UX & Analytics Dashboard
- [x] Panel kontrol bawah untuk mengatur kecepatan simulasi (1x, 2x, 5x).
- [x] Panel informasi (Dashboard sederhana) menampilkan "Jumlah Mobil Aktif" dan FPS (kinerja canvas).
- [x] Fitur observasi *Heatmap* atau sekadar detektor bottleneck: Misalnya mewarnai jalan merah jika banyak mobil berhenti lama.
- [x] Finalisasi estetika UI dan memastikan responsivitas layar dasar.
- [x] **Validasi Edge-Cases**: Buktikan apa yang terjadi saat data visualisasi heatmap overload karena render mobil terlalu banyak. (Penyelesaian: Menggunakan O(N) agregasi dictionary dan 1 kali O(M) `fillRect` per tile untuk mencegah overdraw).

---

**Evaluasi Model**:
Plan ini bisa dieksekusi dengan aman menggunakan Gemini 3.5 Pro atau lebih *advance*. Logika perhitungan _pathfinding_ di koordinat 2D Canvas serta interaksi antar-mobil (Collision & AI) membutuhkan presisi tinggi dari model LLM, sehingga disarankan untuk tidak menggunakan model basic (seperti Gemini Flash) untuk implementasi logika intinya agar hasil (_physics/AI_) stabil dan akurat.
