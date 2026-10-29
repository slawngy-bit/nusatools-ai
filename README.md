# NusaTools AI

Website tools online mobile-first berbahasa Indonesia. Dibuat supaya mudah diedit dari Android.

## Fitur yang sudah tersedia
- Caption generator, bio generator, username generator, prompt builder, hashtag ideas.
- Text rewriter sederhana di browser (bukan AI generatif).
- Kompres gambar langsung di browser.
- Gabungkan beberapa gambar menjadi PDF (menggunakan jsPDF dari CDN; perlu internet).
- Chat interface dengan mode demo lokal.
- Endpoint backend Cloudflare Worker untuk menghubungkan Gemini API secara aman.
- Search tools, filter kategori, salin/unduh hasil, tombol bagikan, desain responsif.

## Penting tentang fitur AI
Tools yang membuat teks tanpa API menggunakan template/aturan lokal; hasilnya bukan keluaran model AI. Chat AI sungguhan baru aktif setelah Cloudflare Worker dipasang dan `GEMINI_API_KEY` diatur. API gratis memiliki kuota dan syarat yang dapat berubah. Jangan pernah taruh API key di `app.js`, `index.html`, atau repository publik.

## Cara publish frontend lewat Android (GitHub + Cloudflare Pages)
1. Unduh ZIP dan ekstrak di HP.
2. Buat repository baru di GitHub, misalnya `nusatools-ai`.
3. Upload semua file frontend ke root repository: `index.html`, `style.css`, `app.js`, `_headers`, `README.md`. Folder `worker` juga boleh ikut di repository.
4. Buka Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git.
5. Pilih repository `nusatools-ai`.
6. Framework preset: `None`; Build command: kosong; Build output directory: `/` atau `.` (ikuti pilihan yang disediakan dashboard).
7. Deploy. Cloudflare akan memberi alamat `*.pages.dev`.

## Aktifkan AI sungguhan (opsional, butuh konfigurasi API)
Frontend yang dipublish ke Pages saja tidak otomatis membuat `/api/chat` berjalan. Untuk AI, deploy Worker dari folder `worker` dan sambungkan endpoint-nya, atau gunakan Pages Functions. Cara paling sederhana untuk pemula adalah mengubah `app.js` agar `fetch('/api/chat'...)` menunjuk ke URL Worker yang sudah dideploy, lalu atur CORS di Worker hanya untuk domain Pages milikmu.

### Deploy Worker
1. Buat API key dari Google AI Studio: https://aistudio.google.com/app/apikey
2. Dari komputer/terminal dengan Wrangler, masuk folder `worker`, lalu deploy Worker. Ini langkah opsional; bisa juga dilakukan dari editor online yang mendukung Cloudflare Workers.
3. Atur secret, jangan masukkan ke file:
   `wrangler secret put GEMINI_API_KEY`
   lalu tempel API key saat diminta.
4. Deploy Worker dan catat URL-nya.
5. Pada `worker/index.js`, CORS sudah mengizinkan origin yang sama dengan URL Worker. Jika frontend Pages menggunakan domain berbeda, ubah `Access-Control-Allow-Origin` menjadi domain Pages milikmu yang persis, lalu deploy ulang.
6. Di `app.js`, ubah URL fetch dari `'/api/chat'` menjadi URL Worker lengkap, misalnya `https://nama-worker.nama-akun.workers.dev/api/chat`.
7. Tes chat. Jika gagal, cek kuota API, nama model, dan log Worker.

## Batasan dan keamanan
- Proyek ini adalah fondasi MVP yang berfungsi, bukan bisnis yang sudah menghasilkan uang.
- Tidak ada sistem login, pembayaran, paket premium, analytics, atau moderasi lanjutan di versi awal.
- Jangan menjanjikan hasil AI selalu benar; cek hasil sebelum dipakai.
- Sebelum menerima trafik besar, tambahkan rate limiting, proteksi penyalahgunaan, batas biaya, dan kebijakan privasi.
- Penghasilan dari iklan atau premium tidak dijamin; persetujuan monetisasi tergantung penyedia.
- Periksa syarat layanan dan kuota semua layanan pihak ketiga sebelum digunakan.

## Struktur
- `index.html` — struktur halaman.
- `style.css` — tampilan responsif.
- `app.js` — interaksi frontend dan tools lokal.
- `worker/index.js` — backend AI opsional.
- `worker/wrangler.toml` — konfigurasi Worker.
