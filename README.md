# PT. Nippon Ace Indonesia

Website layanan konsultasi dan informasi lowongan kerja di Jepang untuk perorangan dan LPK mitra. Company profile statis dengan HTML5, Tailwind CSS 4, dan Alpine.js 3. Seluruh CSS, JavaScript, font, dan foto disajikan lokal. Tidak ada SSR, PHP, atau build yang harus berjalan di hosting.

## Langsung mencoba

Dengan Apache XAMPP aktif, buka **http://localhost/nipponace-website/**. Alternatif: buka `index.html` langsung di browser; untuk menghubungkan webhook kelak gunakan HTTP/HTTPS. Internet hanya diperlukan untuk peta Google Maps dan tautan eksternal.

Navigasi menuju bagian dalam satu halaman: Home, Tentang Kami, Bidang Kerja, Cerita Kandidat, Konsultasi Lowongan, dan Kontak. Ada 15 kartu statis yang dapat difilter, kartu yang mengisi otomatis bidang pada formulir, penghitung statistik saat terlihat, carousel manual yang mendukung keyboard, menu seluler, dan efek scroll yang mengikuti preferensi reduced motion.

## Hero HOME

Hero HOME memakai carousel Alpine.js dengan tiga background WebP lokal, autoplay 4,5 detik, transisi crossfade, zoom-in gambar selama 4,5 detik, animasi teks fade-up, navigasi titik, panah, dan tombol jeda. Headline memakai satu H1 dengan tiga variasi teks. Slide pertama tetap tampil tanpa JavaScript. Autoplay berhenti saat hover, fokus keyboard, tab tersembunyi, hero di luar layar, atau preferensi reduced motion aktif. Tombol CTA tersedia pada setiap slide. Konten hero berfokus pada konsultasi dan informasi lowongan kerja untuk perorangan dan LPK mitra.

## Formulir: kerangka saja

Sesuai arahan, **integrasi Excel/Google Drive belum dipasang**. URL pada `assets/js/config.js` masih placeholder. Isian divalidasi di browser dan tidak dikirim selama placeholder aktif. Tidak ada penyimpanan permanen atau data contoh yang dikirim ke pihak lain.

Kelak, ubah `webhookUrl` ke deployment Google Apps Script `/exec`. Kerangka `fetch` POST terdapat pada method `submit()` di `assets/js/site.js`.

- Body: `application/x-www-form-urlencoded`, dibuat dengan `URLSearchParams`.
- Kolom: `name`, `whatsapp`, `age`, `field`, `experience`, `consent`, `website` (honeypot), `requestId`, `source`.
- Respons keberhasilan yang diharapkan: `{"ok":true}`; hanya tampilkan sukses setelah respons tersebut diterima.
- Respons kegagalan: `{"ok":false,"error":"..."}`.
- Timeout 20 detik; input dipertahankan jika gagal. Tidak menggunakan `no-cors` karena hasil opaque tidak bisa membuktikan keberhasilan penyimpanan.
- Backend kelak harus memvalidasi semua kolom, membatasi spam, menolak honeypot, melakukan deduplikasi `requestId`, dan mencegah formula injection spreadsheet. Validasi browser bukan pengganti validasi backend.
- Akses Web App, redirect, dan CORS harus diuji pada deployment nyata. Backend belum dibuat atau diuji.
- Batas usia 18–60 merupakan aturan contoh formulir konsultasi, bukan ketentuan resmi seluruh program Jepang.

Dokumentasi: [Apps Script Web Apps](https://developers.google.com/apps-script/guides/web), [Content Service](https://developers.google.com/apps-script/guides/content).

## Berkas

```text
index.html                 Halaman lengkap dengan seluruh konten statis
assets/css/site.min.css    Tailwind hasil build; langsung dipakai browser
assets/js/config.js        Placeholder URL integrasi
assets/js/site.js          Interaksi Alpine, validasi, Fetch POST, animasi
assets/js/alpine.min.js    Alpine lokal
assets/images/            Foto WebP, gambar OG, favicon SVG
assets/fonts/             Font lokal WOFF2
src/input.css              Sumber Tailwind dan aturan desain
.htaccess                  Kompresi dan cache Apache/LiteSpeed
robots.txt / sitemap.xml  Kerangka crawling
tests/site.test.cjs        Pemeriksaan browser lokal
```

## Sebelum publikasi

1. Ganti semua `https://example.com/` di `index.html`, `robots.txt`, dan `sitemap.xml` dengan domain HTTPS sebenarnya, termasuk subfolder jika ada. Canonical, Open Graph, Twitter, dan JSON-LD harus konsisten.
2. Ganti nama perusahaan, profil tim, statistik, testimoni, alamat, akun sosial, jam layanan, dan identitas legalitas dengan data terverifikasi.
3. Bagian Layanan & Kemitraan menjelaskan layanan untuk LPK dan perorangan. Nippon Ace diposisikan sebagai konsultan dan penyedia informasi lowongan kerja, sedangkan pelatihan merupakan ranah LPK. Kontak dummy sengaja tidak ditautkan ke nomor atau akun yang belum dikonfirmasi.
4. Kelima belas bidang adalah pilihan konsultasi sesuai brief, bukan seluruh sektor resmi SSW atau lowongan aktif. Beberapa merupakan spesialisasi manufaktur. Periksa [situs resmi Immigration Services Agency of Japan](https://www.ssw.go.jp/en/about/visa/) untuk ketersediaan dan klasifikasi terbaru.
5. Sesuaikan kebijakan privasi, kontak pengelola, dan aturan retensi sebelum mengaktifkan pengiriman data. Hapus label demo hanya setelah layanan sebenarnya siap.
6. Unggah hanya `index.html`, `assets/`, `.htaccess`, `robots.txt`, dan `sitemap.xml` ke `public_html`. Jangan unggah `.tools`, `node_modules`, atau berkas pengujian.

## Pengembangan opsional

Dengan Node.js terpasang:

```sh
npm ci
npm run build
```

Build ulang CSS setelah mengubah kelas Tailwind. `npm run dev` untuk watch. Tailwind tidak dijalankan lewat CDN di browser. Untuk memperbarui Alpine, salin distribusi `node_modules/alpinejs/dist/cdn.min.js` ke `assets/js/alpine.min.js` bersama lisensinya.

Untuk pengujian browser:

```sh
npx playwright install chromium
npm test
```

Pengujian lokal telah lulus untuk filter bidang, pilihan otomatis, validasi, demo tanpa pengiriman, respons Fetch tiruan (sukses/gagal), carousel, menu seluler, konten tanpa JavaScript, dan lebar layar 320/390/768/1024/1440 piksel. Semua foto lokal berhasil didekode, animasi reveal diperiksa, dan halaman XAMPP merespons HTTP 200. Isi peta eksternal digantikan placeholder saat pengujian otomatis; integrasi Google Drive dan CWV produksi belum diuji.

## Performa dan SEO

- Satu H1, heading berjenjang, elemen semantik, title 50–60 karakter, meta description, OG/Twitter Cards, canonical, dan schema Organization tanpa rating/izin palsu.
- Semua `img` memakai WebP, `alt`, dimensi eksplisit, dan `decoding="async"`. Background hero pertama memakai `loading="eager"`, preload, dan prioritas tinggi untuk LCP; gambar lainnya memakai lazy loading. Background hero bersifat dekoratif, dengan informasi slide pada teks HTML.
- Font lokal variable dengan `font-display: swap`; ikon SVG inline tanpa library tambahan.
- Script `defer`, CSS produksi, cache dan kompresi LiteSpeed, iframe peta lazy. Animasi angka tidak mengubah lebar layout kontainer.
- Core Web Vitals dipengaruhi hosting, jaringan, perangkat, dan data pengguna nyata. Belum ada klaim lulus CWV lapangan; ukur setelah deployment dengan PageSpeed Insights/Search Console.

## Aset dan lisensi

Foto stok dari Unsplash; digunakan sebagai ilustrasi, bukan kandidat/tim nyata:

- Kyoto/hero dan OG: `https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e`
- Jepang/tentang: `https://images.unsplash.com/photo-1528164344705-47542687000d`
- Hero Fuji: sumber yang sama dengan foto Jepang/tentang, versi WebP resolusi 1920 piksel.
- Hero pelabuhan: [Shinagawa Container Terminal, taro ohtani / Unsplash](https://unsplash.com/photos/a-crane-is-on-top-of-a-large-stack-of-containers-5T5zmIqs0AM), WebP lokal `assets/images/hero-port.webp`.
- Hero Tokyo malam: [Shinjuku, Stefan Lehner / Unsplash](https://unsplash.com/photos/shinjuku-tokyo-at-night-8Tlrh8aPFw0), WebP lokal `assets/images/hero-tokyo.webp`.
- Potret: `photo-1500648767791-00dcc994a43e`, `photo-1580489944761-15a19d654956`, `photo-1506794778202-cad84cf45f1d` pada `images.unsplash.com`.
- Plus Jakarta Sans: Google Fonts, SIL Open Font License; berkas lisensi disertakan dalam `assets/fonts`.
- Alpine.js: MIT, lisensi disertakan dalam `assets/js`. Tailwind CSS: MIT.
- Identitas merek dan ikon SVG merupakan elemen vektor dalam kode.
