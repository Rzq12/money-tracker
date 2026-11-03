import { Link, useLocation, useParams } from 'react-router-dom';
import PublicLayout from './PublicLayout.jsx';
import { BRAND } from '../../lib/seed.js';

const pages = {
  harga: ['Harga', 'Mulai gratis, tambah Premium kalau perlu. Harga di sini hanya contoh.', [
    ['Gratis', 'Catat manual, dompet, kategori, anggaran, dan laporan dasar.'],
    ['Premium', 'Catat otomatis tanpa batas, ekspor data, dan laporan lengkap. Mulai Rp 12.500 per bulan.'],
  ]],
  panduan: ['Panduan', 'Tips singkat untuk mulai mencatat dan mengatur uang.', [
    ['Mulai dari dompet', 'Tambahkan dompet dan saldo awalmu, lalu catat transaksi pertama.'],
    ['Buat anggaran', 'Pilih template pembagian, isi pemasukan, lalu sesuaikan per kategori.'],
    ['Baca laporanmu', 'Lihat kategori terbesar dan bandingkan dengan bulan sebelumnya.'],
  ]],
  keamanan: ['Keamanan', 'Versi contoh ini menyimpan semua data hanya di browser kamu.', [
    ['Tidak ada kata sandi bank', 'Aplikasi ini tidak pernah meminta PIN, kata sandi, atau kode OTP bank.'],
    ['Datamu tetap di perangkat', 'Tidak ada data yang dikirim ke server. Menghapus data browser akan menghapus catatanmu.'],
  ]],
  tentang: [`Tentang ${BRAND}`, 'Contoh aplikasi catatan keuangan pribadi.', [
    ['Tujuannya', 'Membantu kamu tahu uangmu pergi ke mana, tanpa ribet.'],
  ]],
  tools: ['Tools', 'Alat hitung keuangan gratis.', [
    ['Simulasi KPR', 'Hitung cicilan rumah, total bunga, dan jadwal pelunasan.'],
  ]],
  'e-statement': ['E-statement', 'Cara memasukkan mutasi rekening ke catatanmu.', [
    ['Impor di web', 'Buka menu Import data, pilih Mutasi bank, lalu unggah file CSV.'],
  ]],
};

const titleFromSlug = (slug = '') => slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

export function InfoPage({ page }) {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const fallback = [titleFromSlug(slug), 'Halaman ini masih berupa contoh singkat di versi ini.', [
    ['Coba langsung', 'Masuk dengan akun contoh untuk mencoba fiturnya.'],
  ]];
  const [title, lead, items] = pages[page] || fallback;
  const parent = pathname.startsWith('/catat-otomatis/') ? ['/catat-otomatis', 'Bank & e-wallet'] : pathname.startsWith('/fitur/') ? ['/fitur', 'Fitur'] : null;
  return (
    <PublicLayout crumb={title} title={`${title} · ${BRAND}`} description={lead}>
      <section className="dots">
        <div className="wrap py-16">
          <h1 className="hero-h1 max-w-[820px]">{title}</h1>
          <p className="mt-6 max-w-[680px] text-xl leading-relaxed text-gray-600">{lead}</p>
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
          {page === 'tools' && <Link to="/tools/kalkulator-kpr" className="rounded-2xl bg-[#111827] px-6 py-3.5 font-bold text-white">Buka simulasi KPR</Link>}
          {parent && <Link to={parent[0]} className="rounded-2xl border border-gray-200 px-6 py-3.5 font-bold text-[#111827]">← {parent[1]}</Link>}
          <Link to="/masuk" className="rounded-2xl bg-blue-700 px-6 py-3.5 font-bold text-white">Pakai di web</Link>
        </div>
      </section>
    </PublicLayout>
  );
}

export function NotFound() {
  const suggestions = [
    ['/fitur', 'Fitur', 'Chat, foto struk, notifikasi, anggaran, dan lainnya.'],
    ['/panduan', 'Panduan', 'Tips mengatur uang dan cara pakai aplikasinya.'],
    ['/masuk', `Masuk ke ${BRAND}`, 'Buka catatanmu di web.'],
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
