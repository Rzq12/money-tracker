import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useStore } from './lib/store.jsx';
import AppShell from './components/AppShell.jsx';
import Masuk from './pages/public/Masuk.jsx';
import Fitur from './pages/public/Fitur.jsx';
import CatatOtomatis from './pages/public/CatatOtomatis.jsx';
import { Privasi, Syarat } from './pages/public/Legal.jsx';
import { InfoPage, NotFound } from './pages/public/InfoPage.jsx';
import Dashboard from './pages/app/Dashboard.jsx';
import Transactions from './pages/app/Transactions.jsx';
import Laporan from './pages/app/Laporan.jsx';
import Anggaran from './pages/app/Anggaran.jsx';
import BuatAnggaran from './pages/app/BuatAnggaran.jsx';
import Aset from './pages/app/Aset.jsx';
import Akun from './pages/app/Akun.jsx';
import AturFitur from './pages/app/AturFitur.jsx';
import Pengaturan from './pages/app/Pengaturan.jsx';
import Integrasi from './pages/app/Integrasi.jsx';
import ImportData from './pages/app/ImportData.jsx';
import Referral from './pages/app/Referral.jsx';
import Chat from './pages/app/Chat.jsx';
import Debt from './pages/app/Debt.jsx';
import Onboarding from './pages/app/Onboarding.jsx';
import HapusAkun from './pages/app/HapusAkun.jsx';
import KalkulatorKPR from './pages/app/KalkulatorKPR.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Signed-out visitors land on the sign-in page, as on the original. */
function Private({ children, shell = true }) {
  const { loggedIn } = useStore();
  if (!loggedIn) return <Navigate to="/masuk" replace />;
  return shell ? <AppShell>{children}</AppShell> : children;
}

function Start() {
  const { loggedIn } = useStore();
  return loggedIn ? <Navigate to="/dashboard" replace /> : <Masuk />;
}

const infoPaths = ['harga', 'panduan', 'keamanan', 'tentang', 'tools', 'e-statement'];
const appPages = [
  ['/dashboard', <Dashboard key="d" />],
  ['/transactions', <Transactions key="t" />],
  ['/laporan', <Laporan key="l" />],
  ['/anggaran', <Anggaran key="a" />],
  ['/anggaran/buat', <BuatAnggaran key="ab" />],
  ['/anggaran/:budgetId/edit', <BuatAnggaran key="ae" />],
  ['/aset', <Aset key="as" />],
  ['/akun', <Akun key="ak" />],
  ['/akun/fitur', <AturFitur key="af" />],
  ['/pengaturan', <Pengaturan key="p" />],
  ['/integrasi', <Integrasi key="i" />],
  ['/import', <ImportData key="im" />],
  ['/referral', <Referral key="r" />],
  ['/chat', <Chat key="c" />],
  ['/debt', <Debt key="de" />],
  ['/onboarding', <Onboarding key="o" />],
];

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/masuk" element={<Masuk />} />
        <Route path="/fitur" element={<Fitur />} />
        <Route path="/catat-otomatis" element={<CatatOtomatis />} />
        <Route path="/syarat-ketentuan" element={<Syarat />} />
        <Route path="/kebijakan-privasi" element={<Privasi />} />
        <Route path="/fitur/:slug" element={<InfoPage />} />
        <Route path="/catat-otomatis/:slug" element={<InfoPage />} />
        {infoPaths.map((p) => (
          <Route key={p} path={`/${p}`} element={<InfoPage page={p} />} />
        ))}
        <Route path="/tools/kalkulator-kpr" element={<KalkulatorKPR />} />
        <Route path="/hapus-akun" element={<HapusAkun />} />
        {appPages.map(([path, element]) => (
          <Route key={path} path={path} element={<Private>{element}</Private>} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
