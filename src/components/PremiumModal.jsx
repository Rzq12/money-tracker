import { Check, Crown, Lock, X } from 'lucide-react';
import { Modal } from './ui.jsx';
import { useStore } from '../lib/store.jsx';
import { BRAND } from '../lib/seed.js';

const perks = ['Input transaksi lewat chat tanpa batas', 'Ekspor data transaksi ke CSV', 'Sinkronisasi email bank otomatis', 'Laporan & analisis keuangan lengkap'];
const plans = [
  { name: '2 Bulan', price: 'Rp 60.000', per: 'Rp 30.000/bulan' },
  { name: '12 Bulan', price: 'Rp 150.000', per: 'Rp 12.500/bulan', badge: 'PALING POPULER', badgeBg: 'bg-blue-700', main: true },
  { name: '24 Bulan', price: 'Rp 240.000', per: 'Rp 10.000/bulan', badge: 'PALING HEMAT', badgeBg: 'bg-green-500' },
];

export default function PremiumModal() {
  const { setPremiumOpen, setPremiumPlan, notify } = useStore();
  const close = () => setPremiumOpen(false);
  const choose = () => {
    setPremiumPlan();
    close();
    notify('Mode contoh: Premium aktif tanpa pembayaran apa pun.');
  };
  return (
    <Modal title={`${BRAND} Premium`} onClose={close} width="max-w-[672px]">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-lg font-bold capitalize text-gray-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-500"><Crown className="h-4 w-4" /></span>
          {BRAND} Premium
        </h2>
        <button type="button" aria-label="Tutup" onClick={close} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><X className="h-5 w-5" /></button>
      </div>
      <ul className="mt-4 grid list-none gap-x-6 gap-y-2 border-b border-gray-100 p-0 pb-4 text-xs text-gray-700 sm:grid-cols-2">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2"><span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-blue-700"><Check className="h-2.5 w-2.5" /></span>{p}</li>
        ))}
      </ul>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.name} className={`relative rounded-xl border-2 p-4 ${plan.main ? 'border-blue-500 bg-blue-50/40' : 'border-gray-200'}`}>
            {plan.badge && <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-2xs font-bold text-white ${plan.badgeBg}`}>{plan.badge}</span>}
            <p className="mt-1 text-sm font-medium text-gray-800">{plan.name}</p>
            <p className="mt-3 text-xl font-bold text-gray-900">{plan.price}</p>
            <p className="text-xs text-gray-500">{plan.per}</p>
            <button type="button" onClick={choose} className={`mt-3 min-h-[36px] w-full rounded-lg text-sm font-semibold ${plan.main ? 'bg-blue-700 text-white hover:bg-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
              {plan.main ? 'Beli Sekarang' : 'Pilih'}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500"><Lock className="h-3 w-3" /> Versi contoh: harga hanya ilustrasi dan tidak ada pembayaran.</p>
    </Modal>
  );
}
