import { useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Download, Menu } from 'lucide-react';
import Logo from '../../components/Logo.jsx';
import { ADDRESS, BRAND, COMPANY, CONTACT_EMAIL } from '../../lib/seed.js';

const nav = [
  ['/fitur', 'Fitur'],
  ['/catat-otomatis', 'Bank & e-wallet'],
  ['/harga', 'Harga'],
  ['/panduan', 'Panduan'],
  ['/keamanan', 'Keamanan'],
];

const footer = [
  ['Fitur', [
    ['/fitur/catat-otomatis-notifikasi', 'Catat dari notifikasi'],
    ['/fitur/catat-dari-email-bank', 'Catat dari email bank'],
    ['/fitur/impor-mutasi-bank', 'Impor mutasi bank'],
    ['/fitur/catat-lewat-chat', 'Catat lewat chat'],
    ['/fitur/foto-struk', 'Foto struk'],
    ['/fitur/split-bill', 'Split bill'],
    ['/fitur/hutang-piutang', 'Hutang piutang'],
    ['/fitur/anggaran', 'Anggaran'],
  ]],
  ['Catat otomatis', [
    ['/catat-otomatis/bank-satu', 'Bank Satu'],
    ['/catat-otomatis/bank-dua', 'Bank Dua'],
    ['/catat-otomatis/bank-tiga', 'Bank Tiga'],
    ['/catat-otomatis/bank-empat', 'Bank Empat'],
    ['/catat-otomatis/bank-enam', 'Bank Enam'],
    ['/catat-otomatis/dompet-a', 'Dompet A'],
    ['/catat-otomatis', 'Semua bank'],
  ]],
  ['Sumber', [
    ['/panduan', 'Panduan'],
    ['/e-statement', 'E-statement'],
    ['/tools', 'Tools'],
    ['/harga', 'Harga'],
    ['/keamanan', 'Keamanan'],
    ['/tentang', `Tentang ${BRAND}`],
    ['/kebijakan-privasi', 'Kebijakan privasi'],
    ['/syarat-ketentuan', 'Syarat & ketentuan'],
    ['/hapus-akun', 'Hapus akun'],
  ]],
];

export const StoreLink = ({ className, style, children }) => (
  <Link to="/masuk" className={className} style={style}>{children}</Link>
);

function Header() {
  const menu = useRef(null);
  return (
    <header className="sticky top-0 z-20 border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-[clamp(16px,4vw,40px)] py-3.5">
        <Link to="/fitur" className="flex" aria-label={`${BRAND}, ke beranda`}><Logo /></Link>
        <nav className="hidden flex-wrap items-center gap-1 md:flex" aria-label="Utama">
          {nav.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `px-3 py-2.5 text-[15px] ${isActive ? 'font-bold text-gray-900' : 'font-medium text-ink-soft hover:text-gray-900'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/masuk" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white">Masuk</Link>
          <details ref={menu} className="relative md:hidden">
            <summary aria-label="Menu" className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg text-gray-800 [&::-webkit-details-marker]:hidden"><Menu className="h-5 w-5" /></summary>
            <nav className="absolute right-0 mt-2 flex w-56 flex-col rounded-2xl border border-gray-200 bg-white p-2 shadow-lg" aria-label="Menu ponsel">
              {nav.map(([to, label]) => (
                <NavLink key={to} to={to} onClick={() => menu.current?.removeAttribute('open')} className="flex min-h-[55.8px] items-center rounded-lg px-3 text-[15px] font-medium text-ink-soft hover:bg-gray-50">{label}</NavLink>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pb-8 pt-12">
        <div className="flex flex-wrap gap-10">
          <div className="min-w-0 flex-[2_1_260px]">
            <Logo />
            <p className="mt-3.5 max-w-80 text-sm leading-relaxed text-ink-soft">Aplikasi catatan keuangan pribadi. {ADDRESS}</p>
            <p className="mt-2.5 text-sm"><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StoreLink className="rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white">Buka aplikasi</StoreLink>
            </div>
          </div>
          {footer.map(([title, links]) => (
            <nav key={title} aria-label={title} className="flex-[1_1_150px]">
              <h2 className="m-0 text-sm font-bold text-ink">{title}</h2>
              <ul className="mt-3 flex list-none flex-col gap-2 p-0 text-sm">
                {links.map(([to, label]) => (
                  <li key={to}><Link to={to} className="text-ink-soft hover:text-gray-900">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
          <p className="m-0 text-[13px] text-ink-mute">© {new Date().getFullYear()} {BRAND} · {COMPANY}</p>
          <nav className="flex items-center gap-1 text-[13px]" aria-label="Bahasa"><span className="rounded-lg px-2 py-1.5 font-semibold text-ink">Indonesia</span></nav>
        </div>
      </div>
    </footer>
  );
}

export default function PublicLayout({ crumb, title, description, children }) {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name=description]')?.setAttribute('content', description || '');
  }, [title, description]);
  return (
    <div className="min-h-screen bg-white text-ink max-md:pb-24">
      <Header />
      {crumb && (
        <nav className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,40px)] pt-6 text-sm text-ink-mute" aria-label="Lokasi halaman">
          <Link to="/fitur" className="text-ink-soft">Beranda</Link> › <span>{crumb}</span>
        </nav>
      )}
      <main>{children}</main>
      <Footer />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-100 bg-white/95 px-4 pb-4 pt-3 md:hidden">
        <Link to="/masuk" className="flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-blue-700 text-base font-semibold text-white"><Download className="h-5 w-5" /> Coba {BRAND} gratis</Link>
      </div>
    </div>
  );
}
