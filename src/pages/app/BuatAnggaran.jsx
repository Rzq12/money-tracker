import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Check, ChevronLeft } from 'lucide-react';
import { GhostButton, MoneyInput, PrimaryButton } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { GROUPS, templates } from '../../lib/seed.js';
import { rupiah, today } from '../../lib/format.js';

const STEPS = ['Template', 'Pemasukan', 'Kategori'];
const SUBTITLES = ['Pilih template anggaran', 'Masukkan pemasukan bulanan', 'Atur anggaran per kategori'];

function SplitBar({ split }) {
  return (
    <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
      {Object.entries(GROUPS).map(([key, g]) => <span key={key} className={`${g.bar} rounded-full`} style={{ width: `${split[key]}%` }} />)}
    </div>
  );
}

const Legend = ({ split }) => (
  <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
    {Object.entries(GROUPS).map(([key, g]) => <span key={key} className={g.text}>{g.label} {split[key]}%</span>)}
  </p>
);

export default function BuatAnggaran() {
  const { budgetId } = useParams();
  const [params] = useSearchParams();
  const { budgets, categories, saveBudget, deleteBudget, notify } = useStore();
  const navigate = useNavigate();
  const existing = budgets.find((b) => b.id === budgetId);
  const [step, setStep] = useState(existing ? 2 : 0);
  const [templateId, setTemplateId] = useState(existing?.template || 'seimbang');
  const [custom, setCustom] = useState(existing?.template === 'kustom' ? existing.split : { needs: 50, wants: 30, savings: 20 });
  const [income, setIncome] = useState(existing?.income || 0);
  const expenseCats = useMemo(() => categories.filter((c) => c.type === 'expense' && c.group !== 'none'), [categories]);
  const split = templateId === 'kustom' ? custom : templates.find((t) => t.id === templateId).split;
  const customTotal = custom.needs + custom.wants + custom.savings;

  const suggest = () => {
    const next = {};
    Object.keys(GROUPS).forEach((group) => {
      const list = expenseCats.filter((c) => c.group === group);
      const each = list.length ? Math.floor(((income * split[group]) / 100 / list.length) / 1000) * 1000 : 0;
      list.forEach((c) => { next[c.id] = each; });
    });
    return next;
  };

  const [amounts, setAmounts] = useState(() => (existing ? Object.fromEntries(existing.items.map((i) => [i.categoryId, i.amount])) : {}));
  const goStep3 = () => {
    if (!existing) setAmounts(suggest());
    setStep(2);
  };

  const groupTotal = (group) => expenseCats.filter((c) => c.group === group).reduce((s, c) => s + (amounts[c.id] || 0), 0);
  const total = Object.keys(GROUPS).reduce((s, g) => s + groupTotal(g), 0);

  const save = () => {
    const month = existing?.month || params.get('month') || today().slice(0, 7);
    saveBudget({
      id: existing?.id,
      month,
      template: templateId,
      split,
      income,
      items: expenseCats.filter((c) => amounts[c.id] > 0).map((c) => ({ categoryId: c.id, amount: amounts[c.id] })),
    });
    notify(existing ? 'Anggaran diperbarui.' : 'Anggaran dibuat.');
    navigate('/anggaran');
  };

  const canContinue = templateId !== 'kustom' || customTotal === 100;

  return (
    <div>
      <div className="bg-white pb-3 pt-4">
        <div className="mx-auto max-w-[960px] px-4">
          <div className="flex items-center gap-4">
            <button type="button" aria-label="Kembali" onClick={() => (step > 0 && !existing ? setStep(step - 1) : navigate('/anggaran'))} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 -ml-2">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{existing ? 'Edit Anggaran' : 'Buat Anggaran'}</h1>
              <p className="text-xs text-gray-500">{SUBTITLES[step]}</p>
            </div>
          </div>
          <ol className="mt-4 flex list-none items-start justify-center p-0">
            {STEPS.map((name, i) => (
              <li key={name} className="flex items-start">
                {i > 0 && <span className={`mt-4 h-0.5 w-12 sm:w-20 ${i <= step ? 'bg-blue-500' : 'bg-gray-200'}`} />}
                <span className="flex w-[70px] flex-col items-center">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${i < step ? 'bg-blue-500 text-white' : i === step ? 'bg-blue-500 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-600'}`}>
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  <span className={`mt-1.5 text-xs font-medium ${i <= step ? 'text-blue-600' : 'text-gray-500'}`}>{name}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mx-auto max-w-[960px] px-4 py-6">
        {step === 0 && (
          <>
            <p className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl bg-gray-50/80 px-4 py-3 text-xs text-gray-600">
              {Object.values(GROUPS).map((g) => (
                <span key={g.label} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${g.bar}`} /><b className="font-semibold text-gray-800">{g.label}</b> — {g.hint}</span>
              ))}
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {templates.map((t) => {
                const active = templateId === t.id;
                return (
                  <button type="button" key={t.id} onClick={() => setTemplateId(t.id)} aria-pressed={active} className={`relative rounded-2xl border-2 p-5 text-left ${active ? 'border-blue-500 bg-blue-50/60' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                    <h2 className={`text-base font-bold ${active ? 'text-blue-700' : 'text-gray-900'}`}>{t.name}</h2>
                    <p className="mb-3 mt-1 text-xs text-gray-500">{t.split.needs}/{t.split.wants}/{t.split.savings}</p>
                    <SplitBar split={t.split} />
                    <Legend split={t.split} />
                    <p className="mt-2.5 text-sm leading-5 text-gray-600">{t.text}</p>
                    {active && <span className="absolute right-5 top-5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white"><Check className="h-3 w-3" /></span>}
                  </button>
                );
              })}
              <button type="button" onClick={() => setTemplateId('kustom')} aria-pressed={templateId === 'kustom'} className={`rounded-2xl border-2 border-dashed p-5 text-left ${templateId === 'kustom' ? 'border-blue-500 bg-blue-50/60' : 'border-gray-300 bg-white hover:border-gray-400'}`}>
                <h2 className="text-base font-bold text-gray-900">Kustom</h2>
                <p className="mt-2 text-sm text-gray-600">Atur sendiri — tentukan proporsi sesuai kondisi keuanganmu.</p>
              </button>
            </div>
            {templateId === 'kustom' && (
              <div className="mt-4 rounded-2xl border border-gray-100 bg-white p-5">
                <div className="grid gap-4 sm:grid-cols-3">
                  {Object.entries(GROUPS).map(([key, g]) => (
                    <label key={key} className="text-sm font-medium text-gray-700">{g.label} (%)
                      <input type="number" min="0" max="100" value={custom[key]} onChange={(e) => setCustom({ ...custom, [key]: Number(e.target.value) })} className="mt-1.5 w-full min-h-[44px] rounded-xl border border-gray-200 px-3" />
                    </label>
                  ))}
                </div>
                <p className={`mt-3 text-sm ${customTotal === 100 ? 'text-gray-500' : 'font-semibold text-red-600'}`}>Total {customTotal}%{customTotal === 100 ? '' : ' — harus pas 100%.'}</p>
              </div>
            )}
            <div className="mt-6 flex justify-end"><PrimaryButton className="min-h-[44px] px-8" disabled={!canContinue} onClick={() => setStep(1)}>Lanjut</PrimaryButton></div>
          </>
        )}

        {step === 1 && (
          <div className="mx-auto max-w-[448px] pt-2">
            <h2 className="text-center text-xl font-bold text-gray-900">Berapa pemasukan bulananmu?</h2>
            <p className="mt-2 text-center text-sm text-gray-600">Masukkan total pemasukan per bulan. Kamu bisa lewati langkah ini.</p>
            <label htmlFor="income" className="mt-7 block text-sm font-semibold text-gray-700">Pemasukan Bulanan</label>
            <div className="mt-2"><MoneyInput id="income" value={income} onChange={setIncome} placeholder="5.000.000" /></div>
            <div className="mt-6 flex justify-between">
              <GhostButton className="min-h-[46px] px-6" onClick={() => setStep(0)}>Kembali</GhostButton>
              <PrimaryButton className="min-h-[46px] px-8" onClick={goStep3}>Lanjut</PrimaryButton>
            </div>
          </div>
        )}

        {step === 2 && (
          <>
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <p className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600"><span>Total anggaran</span><b className="text-lg text-gray-900">{rupiah(total)}</b></p>
              {income > 0 && total > income && <p className="mt-1 text-sm font-medium text-red-600">Melebihi pemasukan sebesar {rupiah(total - income)}.</p>}
            </div>
            <div className="mt-4 space-y-4">
              {Object.entries(GROUPS).map(([key, g]) => {
                const list = expenseCats.filter((c) => c.group === key);
                const recommended = (income * split[key]) / 100;
                return (
                  <section key={key} className="rounded-2xl border border-gray-100 bg-white p-5">
                    <h2 className={`text-base font-bold ${g.text}`}>{g.label} <span className="text-sm font-normal text-gray-500">{split[key]}%</span></h2>
                    <p className="text-xs text-gray-500">{rupiah(groupTotal(key))}{income ? ` dari rekomendasi ${rupiah(recommended)}` : ''}</p>
                    <ul className="mt-3 grid list-none gap-3 p-0 md:grid-cols-2">
                      {list.map((c) => (
                        <li key={c.id}>
                          <label htmlFor={`b-${c.id}`} className="mb-1.5 block text-sm font-medium text-gray-800">{c.icon} {c.name}</label>
                          <MoneyInput id={`b-${c.id}`} value={amounts[c.id] || 0} onChange={(v) => setAmounts({ ...amounts, [c.id]: v })} />
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>
            <div className="mt-6 flex flex-wrap justify-between gap-3">
              {existing ? (
                <button type="button" onClick={() => { deleteBudget(existing.id); notify('Anggaran dihapus.'); navigate('/anggaran'); }} className="min-h-[46px] rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 hover:bg-red-50">Hapus Anggaran</button>
              ) : <GhostButton className="min-h-[46px] px-6" onClick={() => setStep(1)}>Kembali</GhostButton>}
              <PrimaryButton className="min-h-[46px] px-8" disabled={total === 0} onClick={save}>{existing ? 'Simpan Perubahan' : 'Simpan Anggaran'}</PrimaryButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
