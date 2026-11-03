import { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Home, ListOrdered, PieChart, Plus, Target, UserRound } from 'lucide-react';
import Logo from './Logo.jsx';
import CatatDrawer from './CatatDrawer.jsx';
import PremiumModal from './PremiumModal.jsx';
import { useStore } from '../lib/store.jsx';
import { ADDRESS, BRAND } from '../lib/seed.js';

const desktopNav = [
  ['/dashboard', 'Beranda', Home],
  ['/transactions', 'Transaksi', ListOrdered],
  ['/laporan', 'Laporan', PieChart],
  ['/anggaran', 'Anggaran', Target],
];

const initial = (name) => (name || '?').trim().slice(0, 1).toUpperCase();

export default function AppShell({ children }) {
  const { user, features, openCatat, catat, toast, premiumOpen } = useStore();
  const { pathname } = useLocation();
  const nav = desktopNav.filter(([to]) => to !== '/anggaran' || features.anggaran);

  useEffect(() => {
    document.title = `${BRAND} · Catatan Keuangan`;
  }, []);

  const mobileLeft = [['/dashboard', 'Beranda', Home], ['/laporan', 'Laporan', PieChart]];
  const mobileRight = [...(features.anggaran ? [['/anggaran', 'Anggaran', Target]] : [['/transactions', 'Transaksi', ListOrdered]]), ['/akun', 'Akun', UserRound]];
  const MobileItem = ([to, label, Icon]) => (
    <NavLink key={to} to={to} className={({ isActive }) => `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
      {({ isActive }) => (
        <>
          <span className={`flex h-7 w-12 items-center justify-center rounded-full ${isActive ? 'bg-blue-50' : ''}`}><Icon className="h-5 w-5" /></span>
          {label}
        </>
      )}
    </NavLink>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-green-50 pb-16 md:pb-0">
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white py-[7px]">
        <div className="mx-auto grid h-[54px] max-w-7xl grid-cols-[1fr_auto] items-center gap-3 px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr] lg:px-8">
          <Link to="/dashboard" className="w-fit rounded-lg" aria-label={`Beranda ${BRAND}`}><Logo /></Link>
          <nav className="hidden items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-sm md:flex" aria-label="Utama">
            {nav.map(([to, label, Icon]) => (
              <NavLink key={to} to={to} className={({ isActive }) => `flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors ${isActive ? 'bg-blue-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                {({ isActive }) => (
                  <>
                    {isActive && label === 'Beranda' && <Icon className="h-4 w-4" />}
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center justify-end gap-3 md:flex">
            <button type="button" onClick={() => openCatat({})} className="flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800">
              <Plus className="h-5 w-5" /> Catat
            </button>
            <NavLink to="/akun" className={({ isActive }) => `flex min-h-[44px] items-center gap-2.5 rounded-full border py-1 pl-1.5 pr-4 text-sm font-semibold ${isActive || pathname.startsWith('/akun') ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">{initial(user.name)}</span>
              Akun
            </NavLink>
          </div>
        </div>
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-9 text-xs text-gray-500 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5"><Logo small /><span>© {new Date().getFullYear()} {BRAND}. Data tersimpan di perangkat ini.</span></div>
          <p className="mt-5 max-w-[580px] leading-4">{ADDRESS}</p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link to="/kebijakan-privasi" className="hover:text-gray-900">Kebijakan privasi</Link><span>·</span>
              <Link to="/syarat-ketentuan" className="hover:text-gray-900">Syarat &amp; ketentuan</Link><span>·</span>
              <Link to="/hapus-akun" className="hover:text-gray-900">Hapus data</Link><span>·</span>
              <Link to="/tools/kalkulator-kpr" className="hover:text-gray-900">Kalkulator KPR</Link><span>·</span>
              <Link to="/tools/kalkulator-pajak" className="hover:text-gray-900">Kalkulator pajak</Link>
            </div>
            <Link to="/backup" className="font-semibold text-blue-700 hover:text-blue-800">Backup data</Link>
          </div>
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Menu bawah">
        {mobileLeft.map(MobileItem)}
        <div className="flex flex-1 justify-center">
          <button type="button" aria-label="Catat transaksi" onClick={() => openCatat({})} className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-white shadow-lg">
            <Plus className="h-6 w-6" />
          </button>
        </div>
        {mobileRight.map(MobileItem)}
      </nav>

      {catat && <CatatDrawer />}
      {premiumOpen && <PremiumModal />}
      {toast && (
        <div role="status" className="fade-in fixed bottom-20 left-1/2 z-[80] w-max max-w-[90vw] -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-3 text-sm text-white shadow-xl md:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}
