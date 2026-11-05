# Happy Birthday, Ms. Angela — Star Champs ★ Air

Website ucapan dan doa ulang tahun untuk **Ms. Angela** dari seluruh rekan staf dan manajemen **Star Champs**.  
Dirancang dengan identitas visual **Star Champs ★ Air** (*boarding pass*, biru navy `#013375`, biru langit `#b2d4ff`, kertas buku catatan, serta stiker die-cut asli dari frame cetak).

---

## Struktur Folder

```text
.
├── index.html                  # Halaman utama (Cover + 4 halaman: Ucapan, Doa Staf, Harapan, Photobooth)
├── css/
│   ├── base.css                # Variabel warna, tipografi, reset, tombol, kertas bergaris
│   ├── animations.css          # Keyframe animasi ringan (hanya transform & opacity)
│   ├── cover.css               # Cover boarding pass + latar cahaya memancar (radiant rays & ripples)
│   ├── pages.css               # Navigasi, Halaman Ucapan, Kolase 2 Kolom Doa Staf, Harapan & Kue
│   └── photobooth.css          # Studio Photobooth 3 pose sesuai frame PDF Star Champs Air
├── js/
│   ├── core.js                 # Utilitas DOM, deteksi performa perangkat, toast
│   ├── data.js                 # Data ucapan pembuka, 11 surat staf, dan harapan bersama
│   ├── frame-config.js         # Koordinat presisi 6 slot foto pada frame Star Champs Air (1080×1620)
│   ├── fx.js                   # Mesin partikel confetti 2D ringan (on-demand loop)
│   ├── typewriter.js           # Efek mesin ketik (typewriter) dengan tombol lewati ketik
│   ├── audio.js                # Pemutar musik assets/audio/hbd.mp3 + fallback kotak musik Web Audio
│   ├── scene.js                # Latar 3D Three.js ringan (bintang, pesawat kertas, awan)
│   ├── booth.js                # Mesin Photobooth 3 pose + filter + ekspor Frame 2:3 & Story 9:16
│   └── app.js                  # Kontroler navigasi, foto Ms. Angela, kolase 2 kolom, modal surat
└── assets/
    ├── audio/
    │   └── hbd.mp3             # Musik latar ulang tahun
    ├── frames/
    │   ├── star-champs-air.pdf # File PDF frame photobooth asli
    │   └── star-champs-air.png # Frame hasil ekstraksi dengan 6 jendela foto transparan (1080×1620)
    ├── stickers/               # Aset stiker asli dari PDF (asterisk, starburst, bolt, camera, cloud, plane, dll.)
    └── vendor/
        └── three.min.js        # Three.js r128 lokal (tanpa ketergantungan CDN eksternal)
```

---

## Fitur Utama

1. **Cover Boarding Pass & Animasi Cahaya Memancar (*Radiant Background*)**
   - Animasi sinar memancar berlapis (`conic-gradient` berputar lembut), cahaya *breathing glow*, gelombang cincin (*expanding rings*), bintang berkelip, dan elemen 3D ringan.
   - Seluruh animasi menggunakan properti ramah GPU (`transform` & `opacity`) dan otomatis menyesuaikan performa perangkat agar berjalan mulus di berbagai HP maupun laptop.

2. **Halaman 1 — Ucapan & Catatan Doa (Mobile-Friendly & Tanpa SVG untuk Foto)**
   - Header bergaya tiket *boarding pass* **Star Champs ★ Air** (`ALSUT ✈ KARAWACI` / `ALST ✈ KRWC`).
   - Bingkai foto Ms. Angela menggunakan aset raster dan tombol **Pasang Foto** yang langsung menyimpan foto di browser.
   - Catatan doa di atas kertas bergaris dengan efek **Typewriter** dan tombol *Lewati Ketik*.
   - Navigasi langkah di bagian bawah disembunyikan di awal agar alur cerita berurutan, dan otomatis terbuka setelah pengguna mencapai bagian akhir (*Photobooth*).

3. **Halaman 2 — Kolase 2 Kolom Menurun Amplop Doa 11 Staf**
   - 11 surat staf (*Miss Riska, Mr. Nathan, Miss Nabila, Mr. Regina, Miss Stella, Miss Tata, Aa Daus, Teh Yana, Teh Nabila, Evit, Miss Lena*) disusun dalam **kolase 2 baris kolom menurun ke bawah**.
   - Setiap surat dibungkus rapat dalam bentuk amplop bersegel bintang tanpa menampilkan bocoran isi pesan di luar.
   - Saat amplop diklik, muncul pop-up modal surat dengan efek **Typewriter** dan navigasi *Sebelumnya / Berikutnya*.

4. **Halaman 3 — Panggung Harapan Bersama & Tiup Lilin Interaktif**
   - Tampilan panggung malam berbintang (*Starlight Navy Stage*) yang dramatis namun hangat dengan sorot cahaya lembut dan kutipan doa utama.
   - Kue ulang tahun interaktif dengan pendar cahaya lilin yang bisa ditiup untuk memicu confetti dan membuka langkah menuju Photobooth.

5. **Halaman 4 — Photobooth "Star Champs ★ Air" (Live Preview di Dalam Frame)**
   - Menggunakan frame asli yang telah diperbarui (`assets/frames/star-champs-air.png`) dengan 2 strip kembar × 3 pose (`ALST ✈ KRWC · FLIGHT KRWC001 · 03 NOV`) dan ilustrasi kamera biru khas Star Champs Air.
   - **Live Camera Preview langsung di dalam slot frame**, sehingga pengguna langsung melihat posenya di dalam bingkai tiket sebelum memotret.
   - **Sesi 3 Foto Otomatis** dengan hitung mundur `3..2..1`, lampu kilat layar, atau unggah foto per slot dari galeri perangkat.
   - **5 Filter Warna** (*Normal, Warm, Sky Cool, Film, B&W*) yang diproses langsung pada piksel kanvas agar konsisten di iOS Safari, Android Chrome, dan desktop.
   - **Simpan Frame (2:3)** sesuai ukuran cetak PDF (1080×1620), **Simpan Story (9:16)** (1080×1920), atau **Bagikan langsung ke Instagram Story / WhatsApp** melalui Web Share API.
