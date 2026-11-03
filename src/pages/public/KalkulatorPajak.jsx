import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import PublicLayout from './PublicLayout.jsx';
import { Label, MoneyInput, inputClass } from '../../components/ui.jsx';
import { rupiah } from '../../lib/format.js';
import { BRAND } from '../../lib/seed.js';

const PTKP = [
  ['TK/0', 'Tidak kawin, 0 tanggungan', 54000000],
  ['TK/1', 'Tidak kawin, 1 tanggungan', 58500000],
  ['K/0', 'Kawin, 0 tanggungan', 58500000],
  ['K/1', 'Kawin, 1 tanggungan', 63000000],
  ['K/2', 'Kawin, 2 tanggungan', 67500000],
  ['K/3', 'Kawin, 3 tanggungan', 72000000],
];

const BRACKETS = [
  [60000000, 0.05],
  [250000000, 0.15],
  [500000000, 0.25],
  [5000000000, 0.3],
  [Infinity, 0.35],
];

const hitung = (brutoBulanan, ptkp) => {
  const bruto = Math.max(0, Number(brutoBulanan) || 0) * 12;
  const biayaJabatan = Math.min(bruto * 0.05, 6000000);
  const neto = bruto - biayaJabatan;
  const pkp = Math.max(0, Math.floor((neto - ptkp) / 1000) * 1000);
  let sisa = pkp;
  let batasBawah = 0;
  let pajak = 0;
  const rincian = [];
  for (const [batas, tarif] of BRACKETS) {
    if (sisa <= 0) break;
    const lapisan = Math.min(sisa, batas - batasBawah);
    const nilai = lapisan * tarif;
    pajak += nilai;
    rincian.push({ dari: batasBawah, sampai: Math.min(batas, pkp), lapisan, tarif, nilai });
    sisa -= lapisan;
    batasBawah = batas;
  }
  return { bruto, biayaJabatan, neto, pkp, pajak, perBulan: pajak / 12, thp: Math.max(0, Number(brutoBulanan) || 0) - pajak / 12, rincian };
};

export default function KalkulatorPajak() {
  const [bruto, setBruto] = useState(10000000);
  const [status, setStatus] = useState('TK/0');
  const ptkp = PTKP.find(([key]) => key === status)?.[2] || 54000000;
  const result = useMemo(() => hitung(bruto, ptkp), [bruto, ptkp]);

  return (
    <PublicLayout
      crumb="Kalkulator pajak"
      title={`Kalkulator PPh 21 · ${BRAND}`}
      description="Perkiraan pajak penghasilan karyawan dari gaji bruto bulanan."
    >
      <section className="dots">
        <div className="wrap py-14">
          <p className="eyebrow">Tools</p>
          <h1 className="hero-h1 mt-3 max-w-[840px]">Kalkulator PPh 21</h1>
          <p className="mt-5 max-w-[660px] text-lg leading-relaxed text-gray-600">Perkiraan pajak penghasilan karyawan tetap dari gaji bruto. Angka ini alat bantu, bukan perhitungan resmi.</p>
        </div>
      </section>

      <section className="wrap pb-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><Calculator className="h-5 w-5 text-blue-700" /> Data penghasilan</h2>
            <div className="mt-5 space-y-5">
              <div><Label htmlFor="pajak-bruto">Gaji bruto per bulan</Label><MoneyInput id="pajak-bruto" value={bruto} onChange={setBruto} large /></div>
              <div>
                <Label htmlFor="pajak-status">Status PTKP</Label>
                <select id="pajak-status" className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
                  {PTKP.map(([key, label, value]) => <option key={key} value={key}>{key} · {label} ({rupiah(value)})</option>)}
                </select>
              </div>
              <p className="rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-600">Perhitungan memakai biaya jabatan 5% (maksimal Rp 6.000.000/tahun), pembulatan PKP ke ribuan, dan tarif progresif UU HPP. THR, bonus, dan penghasilan lain belum dihitung.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900">Perkiraan hasil</h2>
            <div className="mt-4 rounded-xl bg-blue-700 p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">PPh 21 per bulan</p>
              <b className="mt-1 block text-3xl font-bold">{rupiah(result.perBulan)}</b>
              <p className="mt-1 text-sm text-blue-100">Take home pay ± {rupiah(result.thp)}</p>
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              {[
                ['Bruto setahun', result.bruto],
                ['Biaya jabatan', result.biayaJabatan],
                ['Penghasilan neto', result.neto],
                ['PTKP', ptkp],
                ['PKP (dibulatkan)', result.pkp],
                ['PPh 21 setahun', result.pajak],
              ].map(([name, value]) => (
                <div key={name} className="flex justify-between gap-3 border-b border-gray-100 pb-2 last:border-0"><dt className="text-gray-600">{name}</dt><dd className="font-semibold text-gray-900">{rupiah(value)}</dd></div>
              ))}
            </dl>
          </div>
        </div>

        {result.rincian.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <h2 className="border-b border-gray-100 px-5 py-4 text-sm font-bold text-gray-900">Rincian lapisan tarif</h2>
            <ul className="list-none divide-y divide-gray-100 p-0">
              {result.rincian.map((row) => (
                <li key={row.tarif} className="flex flex-wrap items-center gap-2 px-5 py-3 text-sm">
                  <span className="flex-1 text-gray-700">Lapisan {rupiah(row.dari)} – {row.sampai === Infinity ? 'seterusnya' : rupiah(row.sampai)}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{(row.tarif * 100).toFixed(0)}%</span>
                  <b className="w-28 text-right text-gray-900">{rupiah(row.nilai)}</b>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/tools/kalkulator-kpr" className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50">Kalkulator KPR</Link>
          <Link to="/tools" className="rounded-2xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-900 hover:bg-gray-50">← Semua tools</Link>
          <Link to="/masuk" className="rounded-2xl bg-blue-700 px-6 py-3 text-sm font-bold text-white">Buka {BRAND}</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
