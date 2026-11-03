import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import Logo from '../../components/Logo.jsx';
import { useStore } from '../../lib/store.jsx';
import { BRAND } from '../../lib/seed.js';

export default function Masuk() {
  const { login, onboarded, loggedIn } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Aplikasi Catatan Keuangan';
  }, []);

  useEffect(() => {
    if (loggedIn) navigate(onboarded ? '/dashboard' : '/onboarding', { replace: true });
  }, [loggedIn, onboarded, navigate]);

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
            <h1 className="m-0 text-[clamp(34px,4vw,48px)] font-extrabold leading-[1.1] tracking-[-0.025em]">Masuk ke {BRAND}</h1>
            <p className="mt-3.5 text-[17px] leading-relaxed text-gray-600">
              Pakai akun contoh yang sama di web dan HP-mu. Belum punya akun? Akun dibuat otomatis saat pertama kali masuk.
            </p>
            <button
              type="button"
              onClick={login}
              className="mt-8 flex min-h-[56px] w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-base font-semibold text-gray-900 hover:bg-gray-50"
            >
              <UserRound className="h-5 w-5 text-blue-700" />
              Masuk dengan akun contoh
            </button>
            <p className="mt-5 text-sm leading-relaxed text-gray-600">
              <strong className="text-gray-900">Ini aplikasi contoh.</strong> Untuk saat ini, akun asli belum bisa masuk di web. Pakai akun contoh ini dulu, ya.
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
            <p className="m-0 max-w-[360px] text-center text-lg font-semibold leading-normal text-blue-800">Catatanmu sama di HP dan di web.</p>
            <span className="block h-[420px] w-[260px] max-w-full overflow-hidden rounded-t-[40px] border-[8px] border-b-0 border-gray-900 bg-gray-900">
              <img src="/phone-dashboard.svg" alt="Contoh tampilan beranda: pengeluaran bulan ini, saldo, dan sisa anggaran" width="244" height="531" className="block w-full" />
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
