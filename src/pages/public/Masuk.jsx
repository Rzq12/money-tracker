import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import Logo from '../../components/Logo.jsx';
import { useStore } from '../../lib/store.jsx';
import { BRAND } from '../../lib/seed.js';

export default function Masuk() {
  const { login, onboarded, loggedIn, user, saveProfile } = useStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name && user.name !== 'Pengguna' ? user.name : '');

  useEffect(() => {
    document.title = `${BRAND} · Catatan Keuangan`;
  }, []);

  useEffect(() => {
    if (loggedIn) navigate(onboarded ? '/dashboard' : '/onboarding', { replace: true });
  }, [loggedIn, onboarded, navigate]);

  const open = () => {
    if (name.trim()) saveProfile({ name: name.trim() });
    login();
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#111827]">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-3 px-[clamp(16px,4vw,40px)] py-3.5">
          <Link to="/fitur" className="flex" aria-label={`${BRAND}, ke beranda`}><Logo /></Link>
          <Link to="/fitur" className="px-1 py-2.5 text-[15px] font-medium text-gray-600 hover:text-gray-900">Kembali ke {BRAND}</Link>
        </div>
      </header>
      <main className="flex flex-1">
        <div className="mx-auto flex w-full max-w-[1200px] flex-row-reverse flex-wrap items-center justify-between gap-12 px-[clamp(16px,4vw,40px)] py-[clamp(32px,6vw,72px)]">
          <div className="min-w-0 max-w-[440px] flex-[1_1_380px]">
            <h1 className="m-0 text-[clamp(34px,4vw,48px)] font-extrabold leading-[1.1] tracking-[-0.025em]">Buka catatanmu</h1>
            <p className="mt-3.5 text-[17px] leading-relaxed text-gray-600">
              {BRAND} berjalan sepenuhnya di browser ini. Tidak ada akun server, tidak ada data yang dikirim ke mana pun.
            </p>
            <label htmlFor="login-name" className="mt-7 block text-sm font-semibold text-gray-700">Nama kamu <span className="font-normal text-gray-500">(opsional)</span></label>
            <input
              id="login-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') open(); }}
              placeholder="Misalnya: Riezq"
              autoComplete="name"
              className="mt-1.5 min-h-[50px] w-full rounded-xl border border-gray-300 px-4 text-base focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            <button
              type="button"
              onClick={open}
              className="mt-4 flex min-h-[56px] w-full items-center justify-center gap-3 rounded-xl bg-blue-700 px-5 py-3.5 text-base font-semibold text-white hover:bg-blue-800"
            >
              <UserRound className="h-5 w-5" />
              Mulai pakai {BRAND}
            </button>
            <p className="mt-5 text-sm leading-relaxed text-gray-600">
              Catatan lama di browser ini langsung terbuka. Untuk memindahkan data ke perangkat lain, gunakan menu <strong className="text-gray-900">Backup</strong>.
            </p>
            <p className="mt-8 border-t border-gray-100 pt-5 text-[13px] leading-relaxed text-gray-500">
              Dengan masuk, kamu setuju dengan <Link className="text-blue-700" to="/syarat-ketentuan">Syarat &amp; ketentuan</Link> dan{' '}
              <Link className="text-blue-700" to="/kebijakan-privasi">Kebijakan privasi</Link> {BRAND}.
            </p>
            <p className="mt-3 text-sm text-gray-600">
              Belum pakai {BRAND}? <Link className="font-semibold text-blue-700" to="/fitur">Lihat fitur</Link>
            </p>
          </div>
          <div className="flex min-w-0 flex-[1_1_380px] flex-col items-center gap-7 overflow-hidden rounded-[32px] bg-blue-50 px-8 pt-10">
            <p className="m-0 max-w-[360px] text-center text-lg font-semibold leading-normal text-blue-800">Catatanmu ada di perangkatmu sendiri.</p>
            <span className="block h-[420px] w-[260px] max-w-full overflow-hidden rounded-t-[40px] border-[8px] border-b-0 border-gray-900 bg-gray-900">
              <img src="/phone-dashboard.svg" alt="Contoh tampilan beranda: pengeluaran bulan ini, saldo, dan sisa anggaran" width="244" height="531" className="block w-full" />
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
