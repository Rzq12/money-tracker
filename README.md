# uangku

Aplikasi catatan keuangan pribadi yang berjalan **sepenuhnya di browser**. Tidak ada server, tidak ada akun, dan tidak ada data yang dikirim ke luar perangkat. Cocok dipakai sendiri lewat `localhost` atau di-hosting sebagai situs statis.

## Fitur

| Fitur | Lokasi |
| --- | --- |
| Catat pemasukan, pengeluaran, transfer | `Catat` di header / menu bawah |
| Anggaran per kategori dengan periode fleksibel | `/anggaran` |
| Laporan bulanan dan tren | `/laporan` |
| Dompet dengan saldo awal dan warna | `/pengaturan?tab=dompet` |
| Multi mata uang per dompet + kurs manual | `/pengaturan?tab=mata-uang` |
| Tujuan keuangan dengan setoran nyata antar-dompet | `/tujuan` |
| Portofolio saham/reksadana/emas + untung-rugi | `/portofolio` |
| Transaksi berulang (harian/mingguan/bulanan) | `/berulang` |
| Aturan otomatis kategori dari kata kunci | `/aturan` |
| Split bill per item, pajak, service, status lunas | `/split` |
| Chat pencatat sederhana | `/chat` |
| Foto struk (dikompres, tersimpan lokal) | form Catat |
| Input suara (Web Speech API) | form Catat |
| Tag transaksi | form Catat |
| Impor CSV/XLSX + tempel teks notifikasi/email | `/import` |
| Deteksi & pembersihan transaksi ganda | `/import` |
| Backup/restore JSON + ekspor CSV | `/backup` |
| Hutang piutang | `/debt` |
| Kalkulator KPR & PPh 21 | `/tools/kalkulator-kpr`, `/tools/kalkulator-pajak` |
| PWA: bisa dipasang & dibuka offline setelah kunjungan pertama | otomatis |

Fitur bisa disembunyikan dari navigasi lewat **Akun → Atur fitur**. Halaman yang dimatikan tetap bisa diakses langsung, tetapi menampilkan pesan bahwa fitur sedang dimatikan.

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev        # http://localhost:5173
```

Perintah lain:

```bash
npm run build      # build produksi ke dist/ + folder per route
npm run preview    # cek hasil build
npm test           # test format, uang, aturan, importer (node:test)
npm run check      # verifikasi semua import relatif & tautan mati
```

## Data disimpan di mana?

Semua state berada di `localStorage` dengan key `uangku.state.v1`:

- transaksi, termasuk tag, foto struk, mata uang asli, dan ID tujuan/berulang;
- dompet, kategori, anggaran, tujuan, aset, transaksi berulang, aturan, split bill;
- pengaturan: awal periode, kurs, fitur yang aktif, profil.

Kuota `localStorage` biasanya sekitar 5 MB. Karena itu foto struk **dikompres** sebelum disimpan (maksimal ~180 KB per foto).

**Penting:** membersihkan data situs di browser akan menghapus catatan. Buka **Akun → Backup & pemulihan** dan unduh file JSON secara berkala. File itu juga satu-satunya cara memindahkan data ke perangkat lain.

## Struktur singkat

```
src/
  lib/            format tanggal/uang, money, rules, parser, importer, image, speech, store
  components/     AppShell, CatatDrawer, ui, ErrorBoundary
  pages/app/      halaman setelah login
  pages/public/   halaman publik & tools
scripts/
  make-images.mjs ikon PWA + gambar placeholder
  postbuild.mjs   menyalin index.html ke tiap route
  check.mjs       pemeriksaan import tanpa dependensi
tests/            node:test
public/           manifest, service worker, robots, sitemap, _redirects
```

## Deploy

Build menghasilkan situs statis di `dist/`. Konfigurasi siap pakai:

- **Netlify** — `netlify.toml` sudah mengatur build, publish, dan SPA redirect.
- **Vercel** — `vercel.json` sudah mengatur rewrite SPA.
- **Hosting statis lain** — `public/_redirects` (`/* /index.html 200`) plus `dist/404.html`.
- **Sub-path** (misalnya GitHub Pages) — bangun dengan `BASE_PATH=/nama-repo/ npm run build`.

Service worker hanya didaftarkan pada build produksi, jadi saat `npm run dev` tidak ada cache yang mengganggu.

## Batasan yang disengaja

Agar tidak ada klaim palsu:

- **Tidak ada koneksi langsung ke bank**, pembacaan notifikasi Android/iOS, atau akses Gmail. Transaksi masuk lewat impor CSV/Excel, tempel teks, chat, suara, atau ketik manual.
- **Foto struk tidak melakukan OCR.** Foto disimpan sebagai bukti; nominal diisi sendiri.
- **Input suara** bergantung pada dukungan `SpeechRecognition` di browser (umumnya Chrome/Edge/Safari). Bila tidak didukung, tombol menampilkan pesan.
- **Split bill** dihitung lokal; tidak ada tautan berbagi ke teman.
- **Integrasi WhatsApp/Telegram** hanya penanda preferensi, tidak mengirim pesan sungguhan.

## Aksesibilitas

Dialog memakai `role="dialog"`, menahan Tab di dalam panel, mengunci scroll, dan mengembalikan fokus saat ditutup. Tombol penting punya label ARIA, target sentuh minimal 44 px, dan animasi dimatikan saat `prefers-reduced-motion`.
