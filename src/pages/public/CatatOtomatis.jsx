import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronRight } from 'lucide-react';
import PublicLayout, { StoreLink } from './PublicLayout.jsx';
import { Phone } from '../../components/PhoneMock.jsx';
import { letterIcon } from '../../components/Logo.jsx';
import { BRAND } from '../../lib/seed.js';

const ways = [
  {
    bg: '#e8f5e9', tag: '01 · Notifikasi', title: 'Notifikasi bank & e-wallet',
    text: 'Aplikasi ini membaca notifikasi pembayaran dari bank dan e-wallet yang kamu pilih. Aplikasi apa pun bisa, tidak hanya yang ada di daftar ini. Chat, kode OTP, dan promo diabaikan.',
    ticks: ['Android: izin akses notifikasi', 'iPhone: lewat pintasan yang sudah disiapkan', 'Gratis 30 catatan per bulan'],
    link: 'Cara kerja catat dari notifikasi', to: '/fitur/catat-otomatis-notifikasi',
  },
  {
    bg: '#e1f5fe', tag: '02 · Email', title: 'Email bank lewat Gmail',
    text: 'Sambungkan Gmail sekali. Aplikasi hanya membaca email transaksi dari pengirim yang didukung, dan isi email dihapus setelah dibaca.',
    ticks: ['Tiap pengirim diarahkan ke dompet pilihanmu', 'Saat mulai, transaksi 2 minggu terakhir ikut ditarik', 'Gratis 14 hari, lalu Premium'],
    link: 'Cara kerja catat dari email', to: '/fitur/catat-dari-email-bank',
  },
  {
    bg: '#fffbeb', tag: '03 · E-statement', title: 'Impor mutasi bank di web',
    text: 'Unggah e-statement atau file CSV di menu Import, lalu pilih Mutasi bank. Format bank yang umum dikenali otomatis; format lain bisa kamu petakan sendiri kolom demi kolom di layar.',
    ticks: ['Transaksi yang sudah tercatat ditandai', 'Impor bisa dibatalkan', 'Gratis 10 halaman per bulan'],
    link: 'Cara kerja impor mutasi', to: '/fitur/impor-mutasi-bank',
  },
];

const FULL = ['Notifikasi', 'Email', 'E-statement'];
const banks = [
  ['Bank Satu (Nama Contoh)', '#01478a', FULL], ['Bank Dua', '#0288d1', FULL], ['Bank Tiga (Nama Panjang)', '#29b6f6', FULL], ['Bank Empat (Nama Panjang)', '#f97316', FULL],
  ['Bank Lima (Nama Panjang)', '#4caf50', FULL], ['Bank Enam', '#f59e0b', FULL], ['Bank Tujuh', '#0091ea', FULL], ['Bank Delapan', '#ef4444', FULL],
  ['Bank Sembilan', '#26c6da', FULL], ['Bank Sepuluh', '#81d4fa', FULL],
];
const wallets = [
  ['Dompet A', '#26c6da', ['Notifikasi', 'Email']], ['Dompet B', '#5e35b1', ['Notifikasi']], ['Dompet C', '#0288d1', ['Notifikasi']], ['Dompet D', '#f4511e', ['Notifikasi', 'Email']],
];
const shops = [
  ['Toko A', '#81d4fa', ['Notifikasi', 'Email']], ['Toko B', '#81d4fa', ['Notifikasi', 'Email']], ['Toko C', '#81d4fa', ['Notifikasi', 'Email']],
];

const chip = { Notifikasi: ['#e8f5e9', '#1b5e20'], Email: ['#e1f5fe', '#01579b'], 'E-statement': ['#fffbeb', '#92400e'] };
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
    <PublicLayout crumb="Bank & e-wallet" title={`Bank & e-wallet yang bisa dicatat otomatis · ${BRAND}`} description="Bank dan e-wallet yang bisa dicatat otomatis lewat notifikasi, email, atau e-statement.">
      <section className="dots bg-white">
        <div className="mx-auto max-w-[1200px]" style={{ padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px) clamp(48px, 7vw, 88px)' }}>
          <p className="badge !mx-0">
            <span className="badge-tag">Otomatis</span>Bank &amp; e-wallet
          </p>
          <h1 className="hero-h1 mt-6 max-w-[820px]">Bank &amp; e-wallet yang didukung</h1>
          <p className="hero-p mt-6 max-w-[640px]">
            Bayar seperti biasa, catatannya masuk sendiri. Transaksi dicatat dari notifikasi aplikasi bank dan e-wallet, dari email bank, atau dari e-statement. Tanpa PIN atau password m-banking.
          </p>
          <ul className="mt-8 flex list-none flex-wrap gap-2.5 p-0">
            {[...banks, ...wallets.slice(0, 3)].map(([name, color], i) => (
              <li key={name} className={i >= 8 ? 'max-md:hidden' : undefined}><img src={letterIcon(name, color)} alt="" width="48" height="48" className="block h-12 w-12 flex-none rounded-full" style={{ border: '3px solid #fff' }} /></li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ padding: 'clamp(48px, 7vw, 96px) 0 clamp(32px, 5vw, 64px)' }}>
        <div className="wrap">
          <p className="eyebrow">Tiga cara</p>
          <h2 className="sec-h2" style={secH2}>Transaksi masuk sendiri dari tiga jalan</h2>
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
          <p className="sec-p mt-4 max-w-[680px]">Tiap halaman menjelaskan cara yang berlaku dan langkah menyambungkannya. Nama di bawah adalah contoh; ganti dengan penyedia yang benar-benar kamu dukung di aplikasimu.</p>
          <ul className="mt-5 flex list-none flex-wrap gap-2 p-0" style={{ fontSize: 13, fontWeight: 700 }}>
            {FULL.map((m) => <li key={m} style={{ padding: '4px 10px', borderRadius: 9999, background: chip[m][0], color: chip[m][1] }}>{m}</li>)}
          </ul>
          <Group title="Bank" items={banks} />
          <Group title="E-wallet" items={wallets} />
          <Group title="Belanja & transportasi" items={shops} />
          <p className="mt-8 text-sm text-gray-600">Aplikasi ini tidak meminta PIN, kata sandi, atau kode OTP bank, dan tidak bisa memindahkan uangmu. Baca selengkapnya di <Link to="/keamanan" className="font-bold text-blue-700">Keamanan</Link>.</p>
        </div>
      </section>

      <section style={{ padding: '0 clamp(12px, 2vw, 24px) clamp(24px, 3vw, 32px)' }}>
        <div className="relative mx-auto flex max-w-[1360px] flex-wrap items-end gap-8 overflow-hidden text-[#111827]" style={{ borderRadius: 40, background: '#f9fafb', border: '1px solid #f3f4f6', padding: 'clamp(48px, 7vw, 88px) clamp(20px, 5vw, 72px) 0' }}>
          <div className="dots absolute inset-0" />
          <div className="relative min-w-0" style={{ flex: '1 1 420px', paddingBottom: 'clamp(48px, 7vw, 88px)' }}>
            <h2 className="sec-h2">Biar transaksimu tercatat sendiri.</h2>
            <p className="mt-4" style={{ fontSize: 'clamp(17px, 1.8vw, 20px)', color: '#4b5563' }}>Gratis di iPhone, Android, dan web.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <StoreLink style={{ ...ctaBtn, background: '#111827', color: '#fff' }}>App Store</StoreLink>
              <StoreLink style={{ ...ctaBtn, background: '#111827', color: '#fff' }}>Google Play</StoreLink>
              <Link to="/masuk" style={{ ...ctaBtn, background: '#fff', border: '1px solid #e5e7eb', color: '#111827' }}>Pakai di web</Link>
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
