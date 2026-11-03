import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileDown, ShieldCheck, Trash2 } from 'lucide-react';
import PublicLayout from '../public/PublicLayout.jsx';
import { digits, groupDigits, rupiah } from '../../lib/format.js';
import { BRAND, CONTACT_EMAIL } from '../../lib/seed.js';

const field = 'w-full min-h-[46px] rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 focus:border-blue-500 focus:outline-none';
const Cap = ({ children, htmlFor }) => <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">{children}</label>;

const num = (s) => {
  const n = Number(String(s).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/** Annuity schedule: the payment is recalculated at the start of each interest stage. */
export const buildSchedule = (loan, totalMonths, stages) => {
  const rows = [];
  let balance = loan;
  let month = 0;
  stages.forEach((stage) => {
    const r = stage.rate / 100 / 12;
    const remaining = totalMonths - month;
    if (remaining <= 0) return;
    const payment = r === 0 ? balance / remaining : (balance * r) / (1 - (1 + r) ** -remaining);
    for (let i = 0; i < stage.months && month < totalMonths; i += 1) {
      const interest = balance * r;
      const principal = Math.min(balance, payment - interest);
      balance = Math.max(0, balance - principal);
      month += 1;
      rows.push({ month, payment: principal + interest, principal, interest, balance, rate: stage.rate, label: stage.label });
    }
  });
  return rows;
};

export default function KalkulatorKPR() {
  const [price, setPrice] = useState(800000000);
  const [dp, setDp] = useState('20');
  const [tenor, setTenor] = useState(15);
  const [fixed, setFixed] = useState([{ rate: '6', years: '3' }]);
  const [floating, setFloating] = useState('13');

  const fixedYears = fixed.reduce((s, f) => s + num(f.years), 0);
  const floatYears = Math.max(0, tenor - fixedYears);
  const loan = price * (1 - Math.min(100, num(dp)) / 100);

  const schedule = useMemo(() => buildSchedule(loan, tenor * 12, [
    ...fixed.map((f, i) => ({ rate: num(f.rate), months: Math.round(num(f.years) * 12), label: `Fixed ${i + 1}` })),
    { rate: num(floating), months: Math.round(floatYears * 12), label: 'Floating' },
  ]), [loan, tenor, fixed, floating, floatYears]);

  const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);
  const firstPay = schedule[0]?.payment || 0;
  const maxPay = schedule.reduce((m, r) => Math.max(m, r.payment), 0);
  const yearly = schedule.filter((r) => r.month % 12 === 0);
  const update = (i, patch) => setFixed(fixed.map((f, x) => (x === i ? { ...f, ...patch } : f)));

  return (
    <PublicLayout title={`Simulasi KPR · ${BRAND}`} description="Hitung cicilan bulanan, total bunga, dan jadwal pelunasan.">
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="no-print flex items-center gap-2 text-sm text-gray-500" aria-label="Lokasi halaman">
            <Link to="/fitur">Beranda</Link><ChevronRight className="h-3 w-3" /><Link to="/tools">Tools Keuangan</Link><ChevronRight className="h-3 w-3" /><span className="text-gray-700">Simulasi KPR</span>
          </nav>
          <h1 className="mt-5 text-[clamp(26px,3vw,36px)] font-bold leading-tight text-gray-900">Simulasi KPR — Kalkulator Cicilan Rumah</h1>
          <p className="mt-2 text-lg text-gray-600">Hitung cicilan bulanan, total bunga, dan jadwal pelunasan langsung di browser kamu.</p>
          <p className="mt-2 text-sm text-gray-500">Ada pertanyaan atau masukan? Email kami di <a className="text-blue-600" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700"><ShieldCheck className="h-4 w-4" /> Semua dihitung di browser kamu, tidak ada data yang dikirim.</p>
          <div className="no-print mt-5 flex justify-end">
            <button type="button" onClick={() => window.print()} className="flex min-h-[36px] items-center gap-2 rounded-xl bg-blue-500 px-4 text-sm font-semibold text-white"><FileDown className="h-4 w-4" /> Export PDF</button>
          </div>

          <section className="mt-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wide text-gray-400">Input KPR</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <Cap htmlFor="k-price">Harga Properti</Cap>
                <div className="flex min-h-[46px] items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4"><b className="text-sm text-gray-400">Rp</b><input id="k-price" inputMode="numeric" className="w-full bg-transparent text-sm focus:outline-none" value={groupDigits(price)} onChange={(e) => setPrice(digits(e.target.value))} /></div>
              </div>
              <div><Cap htmlFor="k-dp">Uang Muka / DP (%)</Cap><input id="k-dp" inputMode="decimal" className={field} value={dp} onChange={(e) => setDp(e.target.value)} /></div>
            </div>
            <div className="mt-4">
              <Cap htmlFor="k-tenor">Tenor</Cap>
              <select id="k-tenor" className={field} value={tenor} onChange={(e) => setTenor(Number(e.target.value))}>
                {[5, 10, 15, 20, 25, 30].map((y) => <option key={y} value={y}>{y} tahun</option>)}
              </select>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Suku Bunga per Tahap</h3>
              <button type="button" onClick={() => setFixed([...fixed, { rate: '8', years: '2' }])} className="min-h-[36px] text-xs font-semibold text-blue-500">+ Tambah Stage</button>
            </div>
            <div className="mt-2 space-y-3">
              {fixed.map((f, i) => (
                <div key={i} className="rounded-xl border border-blue-200 bg-blue-50/40 p-3.5">
                  <p className="flex items-center justify-between text-xs font-bold text-blue-600">FIXED {fixed.length > 1 ? i + 1 : ''}
                    {fixed.length > 1 && <button type="button" aria-label="Hapus tahap" onClick={() => setFixed(fixed.filter((_, x) => x !== i))} className="flex h-8 w-8 items-center justify-center rounded text-gray-500"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </p>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    <div><Cap htmlFor={`r-${i}`}>Suku Bunga / Thn (%)</Cap><input id={`r-${i}`} inputMode="decimal" className={`${field} !bg-white`} value={f.rate} onChange={(e) => update(i, { rate: e.target.value })} /></div>
                    <div><Cap htmlFor={`y-${i}`}>Masa (Tahun)</Cap><input id={`y-${i}`} inputMode="decimal" className={`${field} !bg-white`} value={f.years} onChange={(e) => update(i, { years: e.target.value })} /></div>
                  </div>
                </div>
              ))}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5">
                <p className="text-xs font-bold text-amber-700">FLOATING · {floatYears} THN (SISA TENOR)</p>
                <div className="mt-2"><Cap htmlFor="k-float">Suku Bunga / Thn (%)</Cap><input id="k-float" inputMode="decimal" className={`${field} !bg-white`} value={floating} onChange={(e) => setFloating(e.target.value)} /></div>
                <p className="mt-2 text-xs text-amber-800">Bunga floating bisa berubah sewaktu-waktu. Nilai di sini hanya perkiraan.</p>
              </div>
              {fixedYears > tenor && <p role="alert" className="text-sm font-medium text-red-600">Masa fixed lebih panjang dari tenor; sisa tahap tidak dihitung.</p>}
            </div>
          </section>

          <section className="mt-5 grid gap-4 md:grid-cols-4">
            {[['Pokok Pinjaman', loan], ['Cicilan Awal / Bulan', firstPay], ['Cicilan Tertinggi / Bulan', maxPay], ['Total Bunga', totalInterest]].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><p className="text-xs font-semibold text-gray-500">{label}</p><p className="mt-1.5 text-lg font-bold text-gray-900">{rupiah(value)}</p></div>
            ))}
          </section>

          <section className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <h2 className="p-5 text-base font-bold text-gray-900">Jadwal Pelunasan per Tahun</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr><th className="px-5 py-3">Tahun</th><th className="px-5 py-3">Tahap</th><th className="px-5 py-3">Bunga</th><th className="px-5 py-3">Cicilan / Bulan</th><th className="px-5 py-3">Sisa Pokok</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {yearly.map((r) => (
                    <tr key={r.month}><td className="px-5 py-2.5">{r.month / 12}</td><td className="px-5 py-2.5">{r.label}</td><td className="px-5 py-2.5">{r.rate}%</td><td className="px-5 py-2.5">{rupiah(r.payment)}</td><td className="px-5 py-2.5">{rupiah(r.balance)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}
