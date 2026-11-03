import { Link, useLocation, useParams } from 'react-router-dom';
import PublicLayout from './PublicLayout.jsx';
import { BRAND } from '../../lib/seed.js';

const pages = {
  harga: ['Harga', 'Aplikasi ini gratis dan berjalan di perangkatmu. Tidak ada langganan.', [
    ['Gratis selamanya', 'Semua fitur yang ada di aplikasi ini bisa dipakai tanpa biaya.'],
    ['Tanpa server', 'Tidak ada akun, tagihan, atau data yang dikirim ke luar perangkat.'],
    ['Datamu milikmu', 'Unduh backup JSON kapan saja dan pulihkan di perangkat lain.'],
  ]],
  panduan: ['Panduan', 'Langkah singkat memakai uangku dari nol.', [
    ['1. Isi dompet', 'Buka Akun → Dompet, tambahkan rekening dan saldo awalnya.'],
    ['2. Catat transaksi', 'Tekan Catat. Pilih kategori, isi nominal. Bisa juga lewat chat atau suara.'],
    ['3. Atur tujuan & anggaran', 'Tetapkan batas belanja bulanan dan target tabungan.'],
    ['4. Amankan data', 'Unduh backup di menu Backup setelah mencatat rutin.'],
  ]],
  keamanan: ['Keamanan', 'Semua data tersimpan di browser ini, bukan di server.', [
    ['Tidak ada kata sandi bank', 'Aplikasi tidak pernah meminta PIN, kata sandi, atau kode OTP.'],
    ['Tidak ada koneksi rekening', 'Tidak ada integrasi langsung ke bank. Data masuk lewat impor atau ketik manual.'],
    ['Salinan lokal', 'Menghapus data browser menghapus catatan. Unduh backup JSON secara berkala.'],
  ]],
  tentang: [`Tentang ${BRAND}`, 'Aplikasi catatan keuangan pribadi yang ringan dan lokal.', [
    ['Tujuannya', 'Membantu kamu tahu uangmu pergi ke mana tanpa langganan dan tanpa akun.'],
    ['Cara kerjanya', 'React + penyimpanan lokal browser. Bisa dipasang sebagai aplikasi (PWA).'],
  ]],
  tools: ['Tools', 'Alat hitung keuangan gratis.', [
    ['Simulasi KPR', 'Hitung cicilan rumah, total bunga, dan jadwal pelunasan.'],
    ['Kalkulator PPh 21', 'Perkirakan pajak penghasilan dari gaji bruto bulanan.'],
  ]],
  'e-statement': ['E-statement', 'Cara memasukkan mutasi rekening ke catatanmu.', [
    ['Ekspor dari bank', 'Unduh mutasi rekening sebagai CSV dari aplikasi atau internet banking bankmu.'],
    ['Impor di uangku', 'Buka Akun → Import data → Mutasi bank, lalu cocokkan kolom.'],
    ['Periksa duplikat', 'Impor berikutnya otomatis menandai baris yang sudah pernah masuk.'],
  ]],

  'catat-otomatis-notifikasi': ['Catat dari notifikasi', 'Di versi web ini notifikasi tidak dibaca otomatis. Kamu bisa menyalin teksnya dan menempelkannya sekaligus.', [
    ['Salin teks notifikasi', 'Tekan lama notifikasi pembayaran, pilih salin.'],
    ['Tempel di Import', 'Buka Akun → Import data → Tempel teks. Satu baris menjadi satu transaksi.'],
    ['Duplikat dicek', 'Baris yang sama dengan catatan lama ditandai supaya tidak dobel.'],
    ['Tanpa izin khusus', 'Aplikasi web tidak meminta akses notifikasi, kontak, atau SMS.'],
  ], '/import'],
  'catat-dari-email-bank': ['Catat dari email bank', 'Tempel isi email transaksi, bukan menghubungkan kotak masuk.', [
    ['Salin isi email', 'Pilih teks email transaksi dari bank lalu salin.'],
    ['Satu baris satu transaksi', 'Rapikan sehingga tiap transaksi berada di baris sendiri.'],
    ['Tempel di Import', 'Nomor, tanggal, dan nominal dikenali otomatis.'],
    ['Tidak ada akses Gmail', 'Aplikasi ini tidak membaca kotak masuk atau menyimpan kredensial email.'],
  ], '/import'],
  'impor-mutasi-bank': ['Impor mutasi bank', 'Unggah CSV atau Excel mutasi rekening dan petakan kolomnya.', [
    ['Format didukung', 'CSV dan XLSX. Ekspor mutasi dari aplikasi bankmu dulu.'],
    ['Pemetaan kolom', 'Pilih kolom tanggal, nominal, catatan, dan jenis transaksi.'],
    ['Deteksi duplikat', 'Transaksi yang sudah ada bisa dilewati otomatis.'],
    ['Bersihkan duplikat', 'Ada tombol untuk menghapus data ganda yang sudah terlanjur masuk.'],
  ], '/import'],
  'catat-lewat-chat': ['Catat lewat chat', 'Ketik transaksi dengan bahasa sehari-hari, lalu konfirmasi.', [
    ['Contoh', '“makan siang 25rb”, “gaji 7,5jt”, atau “saldo”.'],
    ['Konfirmasi dulu', 'Setiap catatan baru muncul sebagai usulan sebelum disimpan.'],
    ['Kategori otomatis', 'Kata kunci umum seperti kopi, bensin, dan listrik dikenali.'],
  ], '/chat'],
  'catat-pakai-suara': ['Catat pakai suara', 'Ucapkan pengeluaran, nominal dan catatan terisi.', [
    ['Didukung browser modern', 'Memakai Web Speech API bawaan Chrome/Edge/Safari.'],
    ['Satu kalimat', 'Contoh: “bensin 150 ribu”. Nominal dan kategori diisi otomatis.'],
    ['Selalu bisa dikoreksi', 'Periksa hasilnya sebelum menyimpan.'],
  ], '/dashboard'],
  'foto-struk': ['Foto struk', 'Simpan foto struk bersama transaksinya, tanpa mengunggah ke server.', [
    ['Lampirkan dari form Catat', 'Foto dikompres di perangkat agar hemat ruang penyimpanan.'],
    ['Tersimpan lokal', 'Foto ikut di backup JSON, tidak dikirim ke mana pun.'],
    ['Isi nominal manual', 'Foto membantu mengingat; nominal tetap kamu isi sendiri.'],
  ], '/dashboard'],
  'split-bill': ['Split bill', 'Bagi tagihan per orang, termasuk pajak dan service.', [
    ['Tambah item', 'Setiap item bisa dibagi ke semua atau sebagian peserta.'],
    ['Pajak & service', 'Dibagi proporsional sesuai porsi tiap orang.'],
    ['Tandai lunas', 'Lihat siapa yang sudah bayar.'],
    ['Catat bagianmu', 'Simpan bagianmu sebagai pengeluaran di dompet.'],
  ], '/split'],
  'hutang-piutang': ['Hutang piutang', 'Catat siapa berutang dan siapa yang kamu utangi.', [
    ['Dua arah', 'Pisahkan uang yang harus kamu terima dan yang harus kamu bayar.'],
    ['Jatuh tempo', 'Simpan tanggal dan tandai lunas saat selesai.'],
    ['Ringkasan aset', 'Saldo hutang piutang muncul di halaman Aset.'],
  ], '/debt'],
  anggaran: ['Anggaran', 'Tentukan batas belanja tiap kategori dan pantau sisanya.', [
    ['Template 50/30/20', 'Atau atur pembagian sendiri sesuai kebutuhan.'],
    ['Sisa per hari', 'Tahu berapa yang aman dibelanjakan sampai akhir periode.'],
    ['Periode fleksibel', 'Awal periode bisa diatur tanggal 1–31, aman untuk bulan pendek.'],
  ], '/anggaran'],
  'multi-mata-uang': ['Multi mata uang', 'Tiap dompet bisa punya mata uang sendiri.', [
    ['Dompet asing', 'Pilih USD, SGD, MYR, EUR, GBP, JPY, atau AUD saat membuat dompet.'],
    ['Kurs manual', 'Perbarui kurs di Pengaturan → Kurs.'],
    ['Laporan tetap rupiah', 'Nilai transaksi dikonversi ke rupiah saat dicatat.'],
  ], '/pengaturan?tab=mata-uang'],
  'tujuan-keuangan': ['Tujuan keuangan', 'Sisihkan dana untuk target tertentu.', [
    ['Target & tenggat', 'Tentukan nominal dan tanggal target.'],
    ['Pindah dompet nyata', 'Setiap tambahan dana dicatat sebagai transfer ke dompet penampung.'],
    ['Progres otomatis', 'Persentase dihitung dari setoran yang sudah dilakukan.'],
  ], '/tujuan'],
  'transaksi-berulang': ['Transaksi berulang', 'Tagihan dan pemasukan rutin dicatat sendiri.', [
    ['Harian, mingguan, bulanan', 'Pilih frekuensi sesuai tagihan.'],
    ['Otomatis saat dibuka', 'Transaksi yang jatuh tempo dicatat ketika aplikasi dibuka.'],
    ['Bisa dijeda', 'Matikan sementara tanpa menghapus pengaturannya.'],
    ['Catat sekarang', 'Kalau ingin langsung mencatat tanpa menunggu tanggal.'],
  ], '/berulang'],
  'aturan-otomatis': ['Aturan otomatis', 'Kategori terisi dari kata kunci di catatan.', [
    ['Buat kata kunci', 'Misalnya “kopi” → Makan dan Minum.'],
    ['Berlaku saat impor', 'Transaksi tanpa kategori langsung masuk ke kategori aturan.'],
    ['Uji dulu', 'Ada kotak coba aturan sebelum dipakai.'],
  ], '/aturan'],
  portofolio: ['Portofolio', 'Pantau nilai aset investasimu.', [
    ['Saham, reksadana, emas', 'Simpan jumlah unit dan harga beli.'],
    ['Harga manual', 'Perbarui harga sekarang kapan saja.'],
    ['Untung/rugi', 'Nilai dan persentase dihitung otomatis.'],
  ], '/portofolio'],
  'backup-data': ['Backup data', 'Unduh semua catatan sebagai satu file JSON.', [
    ['Ekspor penuh', 'Termasuk transaksi, foto struk, tujuan, aset, dan pengaturan.'],
    ['Pemulihan', 'Pilih file atau tempel JSON untuk mengganti data di perangkat ini.'],
    ['CSV transaksi', 'Untuk dibuka di spreadsheet.'],
  ], '/backup'],
  tag: ['Tag', 'Kelompokkan transaksi lintas kategori.', [
    ['Tag bebas', 'Misalnya “liburan”, “renovasi”, atau “kerja”.'],
    ['Beberapa tag per transaksi', 'Cari dan filter berdasarkan tag di halaman Transaksi.'],
    ['Ringkasan tag', 'Lihat tag yang paling sering dipakai di laporan.'],
  ], '/transactions'],
};

const titleFromSlug = (slug = '') => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

const providerPage = (slug) => {
  const title = titleFromSlug(slug);
  return [`Catat transaksi ${title}`, `Cara memasukkan transaksi ${title} ke uangku tanpa menghubungkan rekening.`, [
    ['Lewat impor mutasi', `Ekspor mutasi ${title} sebagai CSV, lalu buka Akun → Import data → Mutasi bank.`],
    ['Lewat tempel teks', `Salin notifikasi atau email transaksi ${title}, lalu pilih Import data → Tempel teks.`],
    ['Tanpa akses rekening', 'Aplikasi tidak meminta PIN, OTP, atau kata sandi bank dan tidak bisa memindahkan uang.'],
    ['Periksa duplikat', 'Transaksi yang sudah pernah masuk ditandai supaya tidak tercatat dua kali.'],
  ], '/import'];
};

export function InfoPage({ page }) {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const fallback = [titleFromSlug(slug), 'Halaman ini belum punya penjelasan khusus.', [
    ['Coba langsung', 'Buka aplikasi di perangkat ini untuk memakai fiturnya.'],
  ]];
  const data = pages[page] || (page ? fallback : pages[slug]) || (pathname.startsWith('/catat-otomatis/') ? providerPage(slug) : fallback);
  const [title, lead, items, appPath] = data;
  const parent = pathname.startsWith('/catat-otomatis/') ? ['/catat-otomatis', 'Bank & e-wallet'] : pathname.startsWith('/fitur/') ? ['/fitur', 'Fitur'] : null;
  return (
    <PublicLayout crumb={title} title={`${title} · ${BRAND}`} description={lead}>
      <section className="dots">
        <div className="wrap py-16">
          {parent && <p className="eyebrow">{parent[1]}</p>}
          <h1 className="hero-h1 max-w-[860px]">{title}</h1>
          <p className="mt-6 max-w-[700px] text-xl leading-relaxed text-gray-600">{lead}</p>
        </div>
      </section>
      <section className="wrap pb-20 pt-4">
        <ul className="grid list-none gap-4 p-0 md:grid-cols-2">
          {items.map(([name, text]) => (
            <li key={name} className="rounded-[22px] bg-gray-50 p-7">
              <h2 className="text-xl font-bold text-[#111827]">{name}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-gray-600">{text}</p>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          {page === 'tools' && <Link to="/tools/kalkulator-kpr" className="rounded-2xl bg-[#111827] px-6 py-3.5 font-bold text-white">Simulasi KPR</Link>}
          {page === 'tools' && <Link to="/tools/kalkulator-pajak" className="rounded-2xl bg-[#111827] px-6 py-3.5 font-bold text-white">Kalkulator PPh 21</Link>}
          {appPath && <Link to={appPath} className="rounded-2xl bg-blue-700 px-6 py-3.5 font-bold text-white">Buka fitur ini</Link>}
          {parent && <Link to={parent[0]} className="rounded-2xl border border-gray-200 px-6 py-3.5 font-bold text-[#111827]">← {parent[1]}</Link>}
          <Link to="/masuk" className="rounded-2xl border border-gray-200 px-6 py-3.5 font-bold text-[#111827]">Buka {BRAND}</Link>
        </div>
      </section>
    </PublicLayout>
  );
}

export function NotFound() {
  const suggestions = [
    ['/fitur', 'Fitur', 'Chat, foto struk, impor, anggaran, dan lainnya.'],
    ['/panduan', 'Panduan', 'Tips mengatur uang dan cara pakai aplikasinya.'],
    ['/masuk', `Buka ${BRAND}`, 'Lanjut ke catatanmu di perangkat ini.'],
  ];
  return (
    <PublicLayout title={`Halaman tidak ditemukan · ${BRAND}`} description="Halaman tidak ditemukan.">
      <section className="wrap py-20 text-center">
        <p className="text-[96px] font-extrabold leading-none text-blue-700">404</p>
        <h1 className="mt-4 text-3xl font-bold text-[#111827]">Halaman tidak ditemukan</h1>
        <p className="mx-auto mt-3 max-w-[520px] text-gray-600">Mungkin alamatnya salah ketik, atau halamannya sudah dipindah. Coba buka salah satu halaman ini.</p>
        <ul className="mx-auto mt-10 grid max-w-[900px] list-none gap-4 p-0 text-left md:grid-cols-3">
          {suggestions.map(([to, name, text]) => (
            <li key={to}><Link to={to} className="block h-full rounded-2xl bg-gray-50 p-6 hover:bg-gray-100"><b className="text-[#111827]">{name}</b><span className="mt-1 block text-sm text-gray-600">{text}</span></Link></li>
          ))}
        </ul>
      </section>
    </PublicLayout>
  );
}
