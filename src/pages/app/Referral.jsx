import { useState } from 'react';
import { Copy, Crown } from 'lucide-react';
import { Card, PrimaryButton } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { BRAND } from '../../lib/seed.js';

const CODE = 'CONTOH20';

export default function Referral() {
  const { user, setPremiumOpen, notify } = useStore();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CODE);
      setCopied(true);
      notify('Kode disalin.');
    } catch {
      notify(`Kodemu: ${CODE}`);
    }
  };
  const steps = [['🔑', 'Upgrade ke Premium untuk aktifkan referral'], ['📤', 'Bagikan kode referral ke teman'], ['💰', 'Dapat komisi setiap pembayaran teman'], ['🏦', 'Tarik komisi ke rekening bank kamu']];
  return (
    <div className="mx-auto max-w-[768px] px-4 py-8">
      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-7 text-white">
        <h1 className="text-2xl font-bold leading-tight">Dapatkan komisi dari setiap teman yang kamu ajak</h1>
        <p className="mt-2 text-sm text-blue-50">Komisi tercatat setiap kali temanmu berlangganan {BRAND} Premium. Ini contoh; tidak ada uang sungguhan.</p>
        <p className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          {['💸 20% Komisi', '♾️ Tak Terbatas', '⏱️ 2 Tahun Penuh'].map((x) => <span key={x} className="rounded-full bg-white/15 px-3 py-1.5">{x}</span>)}
        </p>
      </div>
      <Card className="mt-5">
        {user.premium ? (
          <>
            <h2 className="text-base font-bold text-gray-900">Kode referral kamu</h2>
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3">
              <b className="tracking-widest text-gray-900">{CODE}</b>
              <button type="button" onClick={copy} className="flex min-h-[36px] items-center gap-1.5 text-sm font-semibold text-blue-700"><Copy className="h-4 w-4" /> {copied ? 'Tersalin' : 'Salin'}</button>
            </div>
          </>
        ) : (
          <>
            <p className="flex items-center gap-2 text-base font-bold text-gray-900"><Crown className="h-5 w-5 text-amber-500" /> Fitur Premium</p>
            <p className="mt-1 text-sm text-gray-600">Upgrade ke Premium untuk mendapat kode dan komisi dari teman yang berlangganan.</p>
            <PrimaryButton className="mt-4 min-h-[40px]" onClick={() => setPremiumOpen(true)}>Upgrade ke Premium</PrimaryButton>
          </>
        )}
      </Card>
      <Card className="mt-5">
        <h2 className="text-base font-bold text-gray-900">Teman yang sudah bergabung</h2>
        <p className="py-5 text-center text-sm text-gray-500">Belum ada teman yang bergabung lewat kode kamu.</p>
      </Card>
      <Card className="mt-5">
        <h2 className="text-base font-bold text-gray-900">Cara kerja</h2>
        <ol className="mt-3 list-none space-y-3 p-0">
          {steps.map(([icon, text]) => <li key={text} className="flex items-center gap-3 text-sm text-gray-700"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-base" aria-hidden="true">{icon}</span>{text}</li>)}
        </ol>
      </Card>
    </div>
  );
}
