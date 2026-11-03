import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import PublicLayout from './PublicLayout.jsx';
import { Phone } from '../../components/PhoneMock.jsx';
import { letterIcon } from '../../components/Logo.jsx';
import { BRAND } from '../../lib/seed.js';

const ways = [
  {
    bg: '#e8f5e9', tag: '01 · Notifikasi', title: 'Tempel notifikasi bank & e-wallet',
    text: 'Di versi web ini, notifikasi tidak dibaca otomatis. Salin teks notifikasi pembayaran, lalu tempel di menu Import. Satu baris menjadi satu transaksi.',
    ticks: ['Tanpa izin akses notifikasi', 'Nominal dan tanggal dikenali otomatis', 'Duplikat dicek saat impor'],
    link: 'Cara mencatat dari notifikasi', to: '/fitur/catat-otomatis-notifikasi',
  },
  {
    bg: '#e1f5fe', tag: '02 · Email', title: 'Tempel isi email bank',
    text: 'Salin teks email transaksi dari bank, tempel di Import, dan catatan langsung terbentuk. Aplikasi tidak membaca kotak masuk atau menyimpan kredensial email.',
    ticks: ['Tidak ada akses Gmail', 'Bisa banyak transaksi sekaligus', 'Isi email tidak disimpan'],
    link: 'Cara mencatat dari email', to: '/fitur/catat-dari-email-bank',
  },
  {
    bg: '#fffbeb', tag: '03 · E-statement', title: 'Impor mutasi bank di web',
    text: 'Unggah file CSV atau Excel mutasi rekening di menu Import, lalu cocokkan kolomnya. Format bank yang umum dikenali otomatis; format lain bisa dipetakan sendiri.',
    ticks: ['Transaksi yang sudah tercatat ditandai', 'Bisa dibatalkan dengan menghapus hasil impor', 'Cocok untuk rekening lama'],
    link: 'Cara impor mutasi', to: '/fitur/impor-mutasi-bank',
  },
];

const FULL = ['Impor CSV'];
const banks = [
  ['Bank Satu (contoh)', '#01478a', FULL], ['Bank Dua', '#0288d1', FULL], ['Bank Tiga', '#29b6f6', FULL], ['Bank Empat', '#f97316', FULL],
  ['Bank Lima', '#4caf50', FULL], ['Bank Enam', '#f59e0b', FULL], ['Bank Tujuh', '#0091ea', FULL], ['Bank Delapan', '#ef4444', FULL],
  ['Bank Sembilan', '#26c6da', FULL], ['Bank Sepuluh', '#81d4fa', FULL],
];
const eWallets = [
  ['Dompet A', '#26c6da', ['Impor CSV', 'Tempel teks']], ['Dompet B', '#5e35b1', ['Tempel teks']], ['Dompet C', '#0288d1', ['Tempel teks']], ['Dompet D', '#f4511e', ['Impor CSV']],
];
const shops = [
  ['Toko A', '#81d4fa', ['Tempel teks']], ['Toko B', '#81d4fa', ['Tempel teks']], ['Toko C', '#81d4fa', ['Tempel teks']],
];

const chip = { 'Impor CSV': ['#e8f5e9', '#1b5e20'], 'Tempel teks': ['#e1f5fe', '#01579b'], 'E-statement': ['#fffbeb', '#92400e'] };
const slug = (name) => name.toLowerCase().split(' (')[0].replace(/\s+/g, '-');
const secH2 = { marginTop: 14, maxWidth: 760 };
const ctaBtn = { padding: '14px 22px', borderRadius: 16, fontSize: 16, fontWeight: 700 };

const Provider = ({ name, color, methods }) => (
  <li>
    <Link to={`/catat-otomatis/${slug(name)}`} className="flex items-center hover:bg-gray-100" style={{ gap: 14, padding: 16, borderRadius: 20, background: '#f9fafb', border: '1px solid #f3f4f6', color: '#111827', minHeight: 84 }}>
      <img src={letterIcon(name, color)} alt="" width="44" height="44" className="block h-11 w-11 flex-none rounded-full" />
      <span className="min-w-0 flex-auto">
        <strong className="block text-base leading-[1.3]">{name}</strong>
        <span className="mt-1.5 flex flex-wrap gap-1.5">
          {methods.map((m) => <span key={m} style={{ padding: '2px 8px', borderRadius: 9999, fontSize: 12, fontWeight: 700, background: chip[m][0], color: chip[m][1] }}>{m}</span>)}
        </span>
      </span>
      <ChevronRight className="h-[18px] w-[18px] shrink-0 text-gray-400" />
    </Link>
  </li>
);

const Group = ({ title, items }) => (
  <div className="mt-10">
    <h3 style={{ fontSize: 22, lineHeight: 1.2, fontWeight: 700, color: '#111827' }}>{title}</h3>
    <ul className="mt-4 grid list-none gap-3 p-0" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
      {items.map(([name, color, methods]) => <Provider key={name} name={name} color={color} methods={methods} />)}
    </ul>
  </div>
);

export default function CatatOtomatis() {
  return (
    <PublicLayout crumb="Bank & e-wallet" title={`Cara mencatat transaksi bank & e-wallet · ${BRAND}`} description="Cara memasukkan transaksi dari bank dan e-wallet lewat impor CSV atau tempel teks.">
      <section className="dots bg-white">
        <div className="mx-auto max-w-[1200px]" style={{ padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px) clamp(48px, 7vw, 88px)' }}>
          <p className="badge !mx-0">
            <span className="badge-tag">Panduan</span>Bank &amp; e-wallet
          </p>
          <h1 className="hero-h1 mt-6 max-w-[820px]">Cara mencatat transaksi dari bank &amp; e-wallet</h1>
          <p className="hero-p mt-6 max-w-[640px]">
            Aplikasi web ini tidak terhubung langsung ke rekening. Kamu memasukkan transaksi lewat impor CSV atau dengan menempel teks notifikasi dan email bank. Tidak perlu PIN atau password m-banking.
          </p>
          <ul className="mt-8 flex list-none flex-wrap gap-2.5 p-0">
            {[...banks, ...eWallets.slice(0, 3)].map(([name, color], i) => (
              <li key={name} className={i >= 8 ? 'max-md:hidden' : undefined}><img src={letterIcon(name, color)} alt="" width="48" height="48" className="block h-12 w-12 flex-none rounded-full" style={{ border: '3px solid #fff' }} /></li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ padding: 'clamp(48px, 7vw, 96px) 0 clamp(32px, 5vw, 64px)' }}>
        <div className="wrap">
          <p className="eyebrow">Tiga cara</p>
          <h2 className="sec-h2" style={secH2}>Tiga cara memasukkan transaksi</h2>
          <p className="sec-p mt-4 max-w-[680px]">Pakai satu, atau gabungkan. Kalau satu transaksi masuk dari dua jalan, duplikatnya dicek.</p>
          <div className="mt-10 grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            {ways.map((w) => (
              <article key={w.title} className="flex min-w-0 flex-col" style={{ borderRadius: 32, background: w.bg, padding: 'clamp(24px, 3vw, 32px)', gap: 14 }}>
                <span style={{ alignSelf: 'flex-start', padding: '4px 12px', borderRadius: 9999, background: '#fff', fontSize: 13, fontWeight: 700, color: '#374151' }}>{w.tag}</span>
                <h3 style={{ marginTop: 4, fontSize: 'clamp(24px, 2.6vw, 30px)', lineHeight: 1.15, letterSpacing: '-0.02em', fontWeight: 700, color: '#111827' }}>{w.title}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: '#374151' }}>{w.text}</p>
                <ul className="flex list-none flex-col gap-2 p-0" style={{ marginTop: 4, fontSize: 15, lineHeight: 1.5, color: '#111827' }}>
                  {w.ticks.map((t) => <li key={t} className="flex items-start gap-2"><Check className="mt-0.5 h-[18px] w-[18px] shrink-0 text-blue-800" /><span>{t}</span></li>)}
                </ul>
                <Link to={w.to} className="inline-flex items-center gap-1.5 self-start" style={{ marginTop: 'auto', paddingTop: 8, fontSize: 15, fontWeight: 700, color: '#0277bd' }}>{w.link} <ArrowRight className="h-4 w-4" /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(32px, 5vw, 64px) 0 clamp(64px, 9vw, 112px)' }}>
        <div className="wrap">
          <p className="eyebrow">Daftar</p>
          <h2 className="sec-h2" style={secH2}>Pilih bank atau e-wallet-mu</h2>
          <p className="sec-p mt-4 max-w-[680px]">Nama di bawah adalah contoh. Untuk semua penyedia, caranya sama: ekspor mutasi ke CSV atau tempel teks notifikasi/email.</p>
          <ul className="mt-5 flex list-none flex-wrap gap-2 p-0" style={{ fontSize: 13, fontWeight: 700 }}>
            {FULL.map((m) => <li key={m} style={{ padding: '4px 10px', borderRadius: 9999, background: chip[m][0], color: chip[m][1] }}>{m}</li>)}
            <li style={{ padding: '4px 10px', borderRadius: 9999, background: chip['Tempel teks'][0], color: chip['Tempel teks'][1] }}>Tempel teks</li>
          </ul>
          <Group title="Bank" items={banks} />
          <Group title="E-wallet" items={eWallets} />
          <Group title="Belanja & transportasi" items={shops} />
          <p className="mt-8 text-sm text-gray-600">Aplikasi ini tidak meminta PIN, kata sandi, atau kode OTP bank, dan tidak bisa memindahkan uangmu. Baca selengkapnya di <Link to="/keamanan" className="font-bold text-blue-700">Keamanan</Link>.</p>
        </div>
      </section>

      <section style={{ padding: '0 clamp(12px, 2vw, 24px) clamp(24px, 3vw, 32px)' }}>
        <div className="relative mx-auto flex max-w-[1360px] flex-wrap items-end gap-8 overflow-hidden text-[#111827]" style={{ borderRadius: 40, background: '#f9fafb', border: '1px solid #f3f4f6', padding: 'clamp(48px, 7vw, 88px) clamp(20px, 5vw, 72px) 0' }}>
          <div className="dots absolute inset-0" />
          <div className="relative min-w-0" style={{ flex: '1 1 420px', paddingBottom: 'clamp(48px, 7vw, 88px)' }}>
            <h2 className="sec-h2">Masukkan transaksimu sekali jalan.</h2>
            <p className="mt-4" style={{ fontSize: 'clamp(17px, 1.8vw, 20px)', color: '#4b5563' }}>Gratis, tanpa akun, dan berjalan di perangkatmu.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/masuk" style={{ ...ctaBtn, background: '#111827', color: '#fff' }}>Buka aplikasi</Link>
              <Link to="/panduan" style={{ ...ctaBtn, background: '#fff', border: '1px solid #e5e7eb', color: '#111827' }}>Baca panduan</Link>
            </div>
          </div>
          <div className="relative flex justify-center max-md:!hidden" style={{ flex: '0 1 300px', margin: '0 auto' }}>
            <Phone src="/phone-notif.svg" alt="Contoh notifikasi bank yang tercatat" frame={{ width: 280, height: 360 }} border={9} />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
