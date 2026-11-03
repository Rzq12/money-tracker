import { Link } from 'react-router-dom';
import { Apple, BarChart3, Calendar, Camera, Check, FileText, Globe, Link2, Mic, MessageCircle, Play, Receipt, Target, UserPlus, Wallet } from 'lucide-react';
import PublicLayout, { StoreLink } from './PublicLayout.jsx';
import { Phone } from '../../components/PhoneMock.jsx';
import { letterIcon } from '../../components/Logo.jsx';
import { BRAND } from '../../lib/seed.js';

const cards = [
  ['03', 'Impor mutasi bank', 'Unggah mutasi rekening, transaksi lama masuk sekaligus.', '/fitur/impor-mutasi-bank', '#fffbeb', FileText, '#b45309'],
  ['04', 'Catat lewat chat', 'Ketik "kopi 18rb", jadi catatan.', '/fitur/catat-lewat-chat', '#e1f5fe', MessageCircle, '#01579b'],
  ['05', 'Catat pakai suara', 'Ceritakan pengeluaranmu, beberapa sekaligus.', '/fitur/catat-pakai-suara', '#fffbeb', Mic, '#b45309'],
  ['06', 'Foto struk', 'Toko, tanggal, dan total terisi sendiri.', '/fitur/foto-struk', '#fffbeb', Camera, '#b45309'],
  ['07', 'Split bill', 'Bagikan link, teman pilih menunya sendiri.', '/fitur/split-bill', '#e8f5e9', Receipt, '#1b5e20'],
  ['08', 'Hutang piutang', 'Catat siapa yang pinjam, tandai lunas.', '/fitur/hutang-piutang', '#e1f5fe', UserPlus, '#01579b'],
  ['09', 'Anggaran', 'Tahu sisa per hari dan kategori yang ngebut.', '/fitur/anggaran', '#e8f5e9', BarChart3, '#1b5e20'],
  ['10', 'Multi mata uang', 'Tiap dompet bisa punya mata uangnya sendiri.', '/fitur/multi-mata-uang', '#f9fafb', Globe, '#374151'],
];

const extras = [
  ['Laporan', 'Pengeluaran per kategori, dompet, dan tag, plus trend-nya.', BarChart3],
  ['Tujuan & tabungan', 'Target tabungan yang bisa diisi dari beberapa dompet.', Target],
  ['Tag', 'Kelompokkan transaksi, misalnya untuk satu liburan atau renovasi.', Link2],
  ['Aturan otomatis', 'Kategori terisi sendiri dari aturan yang kamu buat.', Check],
  ['Transaksi berulang', 'Tagihan rutin tercatat sendiri tiap periode. Termasuk Premium.', Calendar],
  ['Portofolio', 'Lihat nilai portofolio investasimu di satu tempat, hanya dibaca.', Wallet],
];

const pill = (color) => ({ alignSelf: 'flex-start', padding: '4px 12px', borderRadius: 9999, background: '#fff', fontSize: 13, fontWeight: 700, color, whiteSpace: 'nowrap' });
const bigTitle = { fontSize: 'clamp(26px, 3vw, 36px)', lineHeight: 1.15, letterSpacing: '-0.02em', fontWeight: 700, color: '#111827' };
const bigText = { fontSize: 16, lineHeight: 1.6, color: '#374151' };
const storeBtn = { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '12px 20px', borderRadius: 16, background: '#111827', color: '#fff', minHeight: 52 };
const ctaBtn = { padding: '14px 22px', borderRadius: 16, fontSize: 16, fontWeight: 700 };

const StoreText = ({ small, big }) => (
  <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1, textAlign: 'left' }}>
    <span style={{ fontSize: 11, opacity: 0.8 }}>{small}</span>
    <span style={{ fontSize: 17, fontWeight: 700 }}>{big}</span>
  </span>
);

export default function Fitur() {
  return (
    <PublicLayout crumb="Fitur" title={`Fitur ${BRAND}: catat otomatis, chat, struk & anggaran`} description="Semua fitur: catat otomatis, impor mutasi, chat, foto struk, split bill, hutang piutang, dan anggaran.">
      <section className="dots bg-white">
        <div className="mx-auto max-w-[1200px] text-center" style={{ padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px) clamp(48px, 7vw, 88px)' }}>
          <p className="badge">
            <span className="badge-tag">Fitur</span>10 cara mencatat &amp; mengatur uang
          </p>
          <h1 className="hero-h1 mx-auto mt-6 max-w-[980px]">Fitur {BRAND}</h1>
          <p className="hero-p mx-auto mt-6 max-w-[680px]">
            Catatanmu bisa masuk sendiri dari notifikasi dan email bank. Mau catat sendiri? Cukup ketik, ngomong, atau foto struk. Lalu atur anggaran, hutang piutang, dan split bill di tempat yang sama.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <StoreLink style={storeBtn}><Apple className="h-[22px] w-[22px]" /><StoreText small="Unduh di" big="App Store" /></StoreLink>
            <StoreLink style={storeBtn}><Play className="h-5 w-5" /><StoreText small="Dapatkan di" big="Google Play" /></StoreLink>
            <Link to="/masuk" className="inline-flex items-center border border-gray-200 bg-white text-[#111827]" style={{ padding: '12px 22px', borderRadius: 16, fontSize: 16, fontWeight: 700, minHeight: 52 }}>Pakai di web</Link>
          </div>
        </div>
      </section>

      <section className="sec-pad">
        <div className="wrap">
          <p className="eyebrow">Catat otomatis</p>
          <h2 className="sec-h2 mt-3 max-w-[820px]">Bayar seperti biasa. Catatannya masuk sendiri.</h2>
          <p className="sec-p mt-4 max-w-[680px]">Notifikasi dan email transaksi dari bank dan aplikasi yang kamu pilih dibaca, lalu dicatat lengkap dengan kategori dan dompetnya secara otomatis.</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link to="/fitur/catat-otomatis-notifikasi" className="max-md:!min-h-0" style={{ flex: '1 1 480px', minWidth: 0, overflow: 'hidden', borderRadius: 32, background: '#e8f5e9', padding: 'clamp(24px, 3vw, 36px) clamp(24px, 3vw, 36px) 0', display: 'flex', flexWrap: 'wrap', gap: 24, minHeight: 520 }}>
              <span style={{ flex: '1 1 240px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>
                <span style={pill('#1b5e20')}>01 · Notifikasi</span>
                <span style={bigTitle}>Catat dari notifikasi</span>
                <span style={bigText}>QRIS, transfer, atau bayar tagihan: begitu notifikasi dari bank masuk, transaksinya langsung tercatat.</span>
                <span className="flex flex-col gap-2" style={{ fontSize: 15, color: '#1f2937' }}>
                  {['Hanya dari aplikasi yang kamu pilih', 'Chat, OTP, dan promo diabaikan', 'Android dan iPhone'].map((item) => (
                    <span key={item} className="flex items-center gap-2"><Check className="h-[18px] w-[18px] shrink-0" stroke="#2e7d32" strokeWidth={2.4} />{item}</span>
                  ))}
                </span>
                <span style={{ marginTop: 'auto', fontSize: 15, fontWeight: 700, color: '#1b5e20' }}>Cara kerjanya →</span>
              </span>
              <span className="flex max-md:!hidden" style={{ flex: '1 1 200px', alignSelf: 'flex-end', justifyContent: 'center' }}>
                <Phone src="/phone-notif.svg" alt="Contoh notifikasi bank yang langsung tercatat" frame={{ width: 240, height: 400 }} radius={38} />
              </span>
            </Link>
            <Link to="/fitur/catat-dari-email-bank" className="max-md:!min-h-0" style={{ flex: '1 1 480px', minWidth: 0, overflow: 'hidden', borderRadius: 32, background: '#e1f5fe', padding: 'clamp(24px, 3vw, 36px)', display: 'flex', flexDirection: 'column', gap: 14, minHeight: 520 }}>
              <span style={pill('#01579b')}>02 · Email bank</span>
              <span style={bigTitle}>Catat dari email bank</span>
              <span style={bigText}>Sambungkan email sekali. Email transaksi dari bank dan aplikasi pilihanmu tercatat sendiri tanpa perlu kamu ketik. Gratis 14 hari pertama.</span>
              <span className="flex flex-col gap-2.5" style={{ marginTop: 'auto' }}>
                <span className="flex items-center gap-3" style={{ padding: '14px 16px', borderRadius: 18, background: '#fff' }}>
                  <img src={letterIcon('Bank Satu', '#01478a')} alt="" width="36" height="36" className="h-9 w-9 flex-none rounded-full" />
                  <span className="min-w-0 flex-auto text-sm text-gray-600"><strong className="text-[#111827]">Transaksi QRIS berhasil</strong><br />Email bank · 08.21</span>
                </span>
                <span aria-hidden="true" style={{ alignSelf: 'center', color: '#0277bd', fontSize: 18 }}>↓</span>
                <span className="flex items-center gap-3 text-[#111827]" style={{ padding: '14px 16px', borderRadius: 18, background: '#fff', border: '1px solid #e5e7eb' }}>
                  <img src={letterIcon('Makan', '#f59e0b')} alt="" width="36" height="36" className="h-9 w-9 flex-none" />
                  <span className="flex-auto text-sm"><strong>Warung nasi</strong><br /><span className="text-gray-600">Makan · Bank Satu</span></span>
                  <span style={{ fontWeight: 700, color: '#c2410c' }}>Rp45.000</span>
                </span>
              </span>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#01579b' }}>Cara kerjanya →</span>
            </Link>
          </div>
          <p className="mt-5 text-base leading-[1.6] text-gray-600">Bank kamu ada di daftar? <Link to="/catat-otomatis" className="font-bold">Lihat bank &amp; e-wallet yang didukung →</Link></p>
        </div>
      </section>

      <section className="sec-pad">
        <div className="wrap">
          <p className="eyebrow">Catat sendiri &amp; atur uang</p>
          <h2 className="sec-h2 mt-3 max-w-[820px]">Semua yang kamu butuhkan, di satu aplikasi.</h2>
          <ul className="mt-9 grid list-none gap-4 p-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
            {cards.map(([num, title, text, to, bg, Icon, tone]) => (
              <li key={num}>
                <Link to={to} className="max-md:!min-h-0" style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%', minHeight: 220, padding: 28, borderRadius: 28, background: bg }}>
                  <span className="flex items-center justify-between gap-3">
                    <span className="flex items-center justify-center bg-white" style={{ width: 52, height: 52, borderRadius: 16, color: tone }}><Icon className="h-[26px] w-[26px]" /></span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: tone }}>{num}</span>
                  </span>
                  <span style={{ marginTop: 'auto' }}>
                    <span style={{ display: 'block', fontSize: 20, lineHeight: 1.2, letterSpacing: '-0.01em', fontWeight: 700, color: '#111827' }}>{title}</span>
                    <span style={{ display: 'block', marginTop: 6, fontSize: 15, lineHeight: 1.5, color: '#374151' }}>{text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ padding: '0 clamp(12px, 2vw, 24px) clamp(48px, 7vw, 96px)' }}>
        <div className="mx-auto max-w-[1360px] border border-gray-100 bg-gray-50 px-[clamp(20px,4.2vw,80px)] py-[clamp(32px,5.45vw,80px)] lg:py-20" style={{ borderRadius: 40 }}>
          <div className="mx-auto max-w-[1200px]">
            <h2 className="sec-h2">Juga ada di {BRAND}</h2>
            <ul className="mt-[33px] grid list-none gap-4 p-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
              {extras.map(([title, text, Icon]) => (
                <li key={title} className="flex gap-4 border border-gray-100 bg-white" style={{ padding: 20, borderRadius: 20 }}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><Icon className="h-[22px] w-[22px]" /></span>
                  <span><b className="block text-base text-[#111827]">{title}</b><span className="mt-1 block text-sm leading-[1.6] text-ink-soft">{text}</span></span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-base leading-[1.6] text-gray-600">Mau tahu yang gratis dan yang termasuk Premium? <Link to="/harga" className="font-bold">Lihat harga →</Link></p>
          </div>
        </div>
      </section>

      <section style={{ padding: '0 clamp(12px, 2vw, 24px) clamp(24px, 3vw, 32px)' }}>
        <div className="relative mx-auto flex max-w-[1360px] flex-wrap items-end gap-8 overflow-hidden text-white" style={{ borderRadius: 40, background: '#0091ea', padding: 'clamp(48px, 7vw, 88px) clamp(20px, 5vw, 72px) 0' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.16) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
          <div className="relative min-w-0" style={{ flex: '1 1 420px', paddingBottom: 'clamp(48px, 7vw, 88px)' }}>
            <h2 className="sec-h2 !text-white">Mulai catat hari ini.</h2>
            <p className="mt-4" style={{ fontSize: 'clamp(17px, 1.8vw, 20px)', color: '#e1f5fe' }}>Gratis di iPhone, Android, dan web.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <StoreLink style={{ ...ctaBtn, background: '#111827', color: '#fff' }}>App Store</StoreLink>
              <StoreLink style={{ ...ctaBtn, background: '#111827', color: '#fff' }}>Google Play</StoreLink>
              <Link to="/masuk" style={{ ...ctaBtn, background: '#fff', color: '#01579b' }}>Pakai di web</Link>
            </div>
          </div>
          <div className="relative flex justify-center max-md:!hidden" style={{ flex: '0 1 300px', margin: '0 auto' }}>
            <Phone src="/phone-dashboard.svg" alt="Contoh tampilan beranda" frame={{ width: 280, height: 360 }} border={9} lazy />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
