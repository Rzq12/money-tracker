import { useEffect } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
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
import Tujuan from './pages/app/Tujuan.jsx';
import Portofolio from './pages/app/Portofolio.jsx';
import Berulang from './pages/app/Berulang.jsx';
import Aturan from './pages/app/Aturan.jsx';
import SplitBill from './pages/app/SplitBill.jsx';
import Backup from './pages/app/Backup.jsx';
import Profil from './pages/app/Profil.jsx';
import KalkulatorPajak from './pages/public/KalkulatorPajak.jsx';
import { SlidersHorizontal } from 'lucide-react';

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

function FeatureOff({ name }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-600"><SlidersHorizontal className="h-7 w-7" /></span>
      <h1 className="mt-4 text-xl font-bold text-gray-900">Fitur {name} sedang dimatikan</h1>
      <p className="mt-2 text-sm text-gray-600">Datanya tetap aman. Nyalakan lagi kalau ingin memakainya.</p>
      <Link to="/akun/fitur" className="mt-6 inline-flex min-h-[40px] items-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white">Atur fitur</Link>
    </div>
  );
}

function Feature({ name, label, children }) {
  const { features } = useStore();
  if (name && features[name] === false) return <FeatureOff name={label || name} />;
  return children;
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
  ['/anggaran/buat', <BuatAnggaran key="ab" />],
  ['/anggaran/:budgetId/edit', <BuatAnggaran key="ae" />],
  ['/aset', <Aset key="as" />],
  ['/akun', <Akun key="ak" />],
  ['/akun/fitur', <AturFitur key="af" />],
  ['/akun/profil', <Profil key="pr" />],
  ['/pengaturan', <Pengaturan key="p" />],
  ['/integrasi', <Integrasi key="i" />],
  ['/import', <ImportData key="im" />],
  ['/referral', <Referral key="r" />],
  ['/chat', <Chat key="c" />],
  ['/debt', <Debt key="de" />],
  ['/onboarding', <Onboarding key="o" />],
  ['/backup', <Backup key="bk" />],
];

const gatedPages = [
  ['/anggaran', <Anggaran key="a" />, 'anggaran', 'Anggaran'],
  ['/tujuan', <Tujuan key="tu" />, 'tujuan', 'Tujuan keuangan'],
  ['/portofolio', <Portofolio key="po" />, 'portofolio', 'Portofolio'],
  ['/berulang', <Berulang key="be" />, 'berulang', 'Transaksi berulang'],
  ['/aturan', <Aturan key="at" />, 'aturan', 'Aturan otomatis'],
  ['/split', <SplitBill key="sp" />, 'split', 'Split bill'],
  ['/split/:id', <SplitBill key="spd" />, 'split', 'Split bill'],
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
        <Route path="/tools/kalkulator-pajak" element={<KalkulatorPajak />} />
        <Route path="/hapus-akun" element={<HapusAkun />} />
        {appPages.map(([path, element]) => (
          <Route key={path} path={path} element={<Private>{element}</Private>} />
        ))}
        {gatedPages.map(([path, element, feature, label]) => (
          <Route key={path} path={path} element={<Private><Feature name={feature} label={label}>{element}</Feature></Private>} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
