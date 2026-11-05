# 🌟 Happy Birthday Ms. Angela - Star Champs Therapy

Website perayaan interaktif dan penuh cinta untuk merayakan ulang tahun **Ms. Angela**, sosok pembimbing dan pemimpin di keluarga besar **Star Champs Speech Therapy**.

Proyek ini telah direfaktor menjadi arsitektur modular yang rapi, cepat, responsif, dan siap di-deploy ke GitHub Pages atau hosting web lainnya.

---

## 📁 Struktur Folder Proyek

```text
web hbd ms angela/
├── index.html                  # File HTML utama (semantik & responsif)
├── README.md                   # Dokumentasi proyek & panduan deployment
├── .gitignore                  # Berkas pengabaian git standar
├── css/
│   ├── style.css               # Styling dasar, tema warna, amplop 3D, lined paper, scrollbar
│   ├── animations.css          # Animasi snappy, bouncy (bebas delay lambat), flash kamera
│   └── photobooth.css          # Desain studio Photobooth 9:16 untuk Instagram Stories
├── js/
│   ├── data.js                 # Data 11 staf Star Champs, simbol AAC, stiker photobooth
│   ├── three-scene.js          # Three.js 3D Wonderland (balon, bintang emas, kado, confetti)
│   ├── audio.js                # Background music hbd.mp3 + Web Audio synthesizer fallback
│   ├── typewriter.js           # Mesin typewriter interaktif dengan efek ketik suara & skip
│   ├── photobooth.js           # Studio Photobooth 9:16 (webcam, filter, stiker, download, share IG)
│   └── main.js                 # Kontroler navigasi halaman, pembukaan amplop, tiup lilin
└── assets/
    ├── audio/
    │   ├── hbd.mp3             # Simpan file lagu ulang tahun Anda di sini
    │   └── README.txt          # Petunjuk audio
    ├── images/
    │   └── angela-default.svg  # Ilustrasi avatar default Ms. Angela (vektor tajam)
    └── stickers/               # Folder aset stiker tambahan
```

---

## ✨ Fitur-Fitur Utama

1. **3D Interactive Wonderland Background (Three.js)**:
   - Balon 3D dengan tali berayun lembut mengikuti gelombang sinus.
   - Bintang emas berkilau 3D (faceted octahedron) dengan pantulan cahaya.
   - Kotak kado 3D berpita cantik dan ring gelombang suara terapi wicara.
   - Awan konfeti 3D yang melayang di ruang tiga dimensi.
   - Pencahayaan dinamis multi-warna (Star Coral & Star Blue point lights).
   - Efek paralaks interaktif yang mengikuti kursor mouse di komputer atau sentuhan jari di HP.

2. **Amplop 3D Pembuka (Stage 0)**:
   - Amplop dengan segel lilin bintang interaktif.
   - Saat diklik: flap amplop terbuka dengan transisi snappy (*no sluggish easing!*), kertas ucapan meluncur keluar, dan transisi mulus ke halaman utama.

3. **Bingkai Polaroid & Notes Kertas Doa dengan Typewriter**:
   - Foto Ms. Angela dengan efek 3D tilt interaktif.
   - Tombol ganti foto langsung dari komputer / smartphone.
   - Kertas notes bergaris dengan washi tape dan paper clip.
   - **Efek Typewriter**: Teks doa tidak langsung muncul seketika, melainkan diketik huruf demi huruf secara dinamis dan hangat.

4. **Papan Komunikasi Visual AAC (Augmentative & Alternative Communication)**:
   - Terinspirasi dari terapi wicara anak-anak.
   - Papan strip gambar yang bisa diketuk untuk menyusun kalimat ucapan.
   - Bunyikan kalimat AAC dengan sintesis nada ceria atau bersihkan susunan gambar.

5. **Kolase 11 Surat Staf Star Champs dalam Amplop Mini**:
   - Masing-masing staf (*Miss Riska, Mr. Nathan, Miss Nabila, Mr. Regina, Miss Stella, Miss Tata, Aa Daus, Teyana, Teh Nabila, Mr. Kevin, Miss Lena*) dibungkus dalam bentuk amplop kecil yang menggemaskan dengan segel bintang.
   - Ketika diklik, amplop memicu **Pop-up Modal Surat Terbuka**.
   - Isi pesan diketik langsung menggunakan **Typewriter Animation** dengan tombol *⏩ Lewati Ngetik* serta tombol *Sebelumnya* dan *Doa Selanjutnya*.
   - Kartu ke-12: Fitur interaktif untuk menambahkan doa dan surat baru secara langsung.

6. **Harapan Tulus & Tiup Lilin Interaktif**:
   - Harapan dan doa tulus untuk kepemimpinan Ms. Angela di Star Champs.
   - Kue ulang tahun dengan lilin menyala yang bisa ditiup interaktif, memicu semburan confetti dan efek suara perayaan.

7. **Online Photobooth 9:16 (Instagram Story & WhatsApp Status)**:
   - Format portrait rasio **9:16** beresolusi tinggi (1080 x 1920 piksel).
   - Ambil foto langsung melalui **Kamera HP / Webcam** (bisa ganti kamera depan/belakang) lengkap dengan hitungan mundur 3..2..1 dan efek flash layar putih!
   - Alternatif: Upload foto langsung dari galeri HP atau komputer.
   - Pilihan 4 Template Frame cantik:
     - *Star Champs Pastel Party*
     - *Aesthetic Polaroid Strip*
     - *Speech Therapy Wonderland*
     - *Golden Celebration Gala*
   - Pilihan 6 Filter Foto (*Normal, Warm Glow, Pastel Dream, Rosy Blush, Vintage Film, B&W Classic*).
   - Nampan stiker pesta lucu (bisa digeser dan ditempel bebas pada foto).
   - Kotak custom ucapan / nama pengirim di bingkai foto.
   - **Tombol Download Foto (9:16 HQ)**: Menyimpan gambar PNG jernih siap posting.
   - **Tombol Share ke Instagram Stories**: Terintegrasi dengan Web Share API perangkat untuk langsung membuka dialog berbagi Instagram Story / WhatsApp, disertai panduan & template caption siap salin.

8. **Sistem Musik Cerdas (`hbd.mp3` + Fallback)**:
   - Cukup masukkan file musik Anda ke dalam `assets/audio/hbd.mp3`.
   - Jika file `hbd.mp3` belum dimasukkan, sistem audio secara cerdas mengaktifkan **Web Audio API Music Box Synthesizer** (memainkan melodi Happy Birthday dalam instrumen kotak musik yang merdu tanpa error).
   - Widget pemutar musik di pojok kanan atas dengan animasi piringan hitam (vinyl) yang berputar dan bilah spektrum suara.

---

## 🚀 Cara Menjalankan & Mengunggah ke GitHub

### 1. Menjalankan di Lokal (Komputer Anda)
Karena proyek ini menggunakan fitur kamera (Webcam) dan Web Audio API, disarankan menjalankannya melalui local server sederhana:

**Opsi A: Menggunakan VS Code Live Server**
- Buka folder proyek di VS Code.
- Klik kanan `index.html` lalu pilih **Open with Live Server**.

**Opsi B: Menggunakan Python**
Buka terminal di folder proyek dan jalankan:
```bash
python -m http.server 8000
```
Lalu buka browser di `http://localhost:8000`.

---

### 2. Memasukkan Lagu Ulang Tahun
Simpan file MP3 lagu pilihan Anda ke:
```
assets/audio/hbd.mp3
```
Website akan otomatis memutar file tersebut saat amplop dibuka!

---

### 3. Deploy ke GitHub Pages (Gratis & Online)
1. Buat repository baru di [GitHub](https://github.com/new) (misal: `hbd-ms-angela`).
2. Di folder komputer Anda, jalankan perintah Git berikut:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Upgrade HBD Ms Angela web with modular structure, 3D animations, and 9:16 photobooth"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/hbd-ms-angela.git
   git push -u origin main
   ```
3. Buka repository Anda di GitHub ➔ Masuk ke **Settings** ➔ **Pages**.
4. Pada bagian **Build and deployment**, pilih Branch `main` dan folder `/ (root)`, lalu klik **Save**.
5. Tunggu sekitar 1 menit, dan website Anda sudah aktif secara online di `https://USERNAME_ANDA.github.io/hbd-ms-angela/`!

---

Dibuat dengan segenap cinta dan kekompakan dari **Keluarga Besar Star Champs Therapy** untuk **Ms. Angela**! 🌟🎂🎉
