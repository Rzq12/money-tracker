import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store.jsx';
import { BRAND } from '../../lib/seed.js';

const STEPS = [
  { key: 'source', question: `Dari mana kamu tahu tentang ${BRAND}?`, options: ['Toko aplikasi', 'Twitter', 'Teman', 'Threads', 'Instagram', 'Lainnya'] },
  { key: 'purpose', question: `${BRAND} dipakai untuk apa?`, hint: 'Bisa pilih lebih dari satu', multi: true, options: ['Catat pengeluaran', 'Atur anggaran', 'Menabung', 'Catat hutang', 'Keuangan keluarga'] },
  { key: 'before', question: 'Apakah sebelumnya pernah mencatat pengeluaran?', options: ['Belum pernah', 'Dengan buku', 'Dengan Google Sheet / Excel', 'Dengan aplikasi lain'] },
];

export default function Onboarding() {
  const { user, finishOnboarding } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ source: 'Toko aplikasi' });
  const current = STEPS[step];
  const value = answers[current.key];
  const selected = (o) => (current.multi ? (value || []).includes(o) : value === o);
  const pick = (o) => {
    if (current.multi) {
      const list = value || [];
      setAnswers({ ...answers, [current.key]: list.includes(o) ? list.filter((x) => x !== o) : [...list, o] });
    } else {
      setAnswers({ ...answers, [current.key]: o });
    }
  };
  const done = () => {
    finishOnboarding();
    navigate('/dashboard', { replace: true });
  };
  const next = () => (step === STEPS.length - 1 ? done() : setStep(step + 1));
  const filled = current.multi ? (value || []).length > 0 : Boolean(value);

  return (
    <div className="dots px-4 py-12">
      <div className="mx-auto max-w-[446px] rounded-2xl bg-white p-8 shadow-xl shadow-black/[0.05] max-md:p-6">
        <div className="h-1.5 rounded-full bg-gray-100" role="progressbar" aria-valuemin={0} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Kemajuan">
          <div className="h-1.5 rounded-full bg-blue-400 transition-all" style={{ width: `${((step + 1) / (STEPS.length + 1)) * 100 - 5}%` }} />
        </div>
        <h1 className="mt-6 text-xl font-bold text-gray-900">Hi {user.name.split(' ')[0]}, yuk kenalan dulu</h1>
        <p className="mt-1.5 text-sm font-medium leading-5 text-gray-500">Biar pengalaman pakai {BRAND} lebih maksimal, kasih tau dikit yuk!</p>
        <h2 className="mt-7 text-sm font-medium text-gray-900 first-letter:uppercase">{current.question}</h2>
        {current.hint && <p className="mt-1 text-xs text-gray-500">{current.hint}</p>}
        <div className="mt-3.5 flex flex-wrap gap-2.5 border-b border-gray-100 pb-8">
          {current.options.map((o) => (
            <button type="button" key={o} aria-pressed={selected(o)} onClick={() => pick(o)} className={`min-h-[42px] rounded-full border px-5 text-sm font-medium transition-colors ${selected(o) ? 'border-blue-500 bg-blue-50 font-bold text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>{o}</button>
          ))}
        </div>
        <button type="button" disabled={!filled} onClick={next} className="mt-6 min-h-[52px] w-full rounded-full bg-blue-700 font-bold text-white hover:bg-blue-800 disabled:bg-blue-300">
          {step === STEPS.length - 1 ? 'Mulai Mencatat' : 'Selanjutnya'}
        </button>
        <button type="button" onClick={done} className="mt-3 min-h-[44px] w-full text-sm font-medium text-gray-500 hover:text-gray-800">Nanti Dulu</button>
      </div>
    </div>
  );
}
