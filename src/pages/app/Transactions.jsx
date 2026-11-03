import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, ChevronRight, Plus, Receipt, SlidersHorizontal, X } from 'lucide-react';
import { Card, CategoryIcon, PrimaryButton, Segmented, inputClass } from '../../components/ui.jsx';
import { findCategory, rootCategoryId, useStore } from '../../lib/store.jsx';
import { addDays, digits, groupDigits, longDate, periodOf, rangeLabel, rupiah, shiftPeriod, today } from '../../lib/format.js';

const Section = ({ title, children }) => (
  <section className="border-b border-gray-100 py-4 last:border-b-0">
    <h3 className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-gray-700">{title}</h3>
    {children}
  </section>
);

const Chip = ({ active, children, ...props }) => (
  <button type="button" aria-pressed={active} className={`min-h-[32px] rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${active ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`} {...props}>
    {children}
  </button>
);

const CheckRow = ({ checked, onChange, children }) => (
  <label className="flex min-h-[40px] cursor-pointer items-center gap-3 px-1 text-sm text-gray-800">
    <input type="checkbox" checked={checked} onChange={onChange} className="h-[18px] w-[18px] rounded border-gray-300 accent-blue-700" />
    {children}
  </label>
);

const AMOUNTS = [['< Rp50rb', 0, 50000], ['Rp50rb – Rp500rb', 50000, 500000], ['Rp500rb – Rp1jt', 500000, 1000000], ['> Rp1jt', 1000000, 0]];

export default function Transactions() {
  const { transactions, categories, wallets, startDay, openCatat } = useStore();
  const [params] = useSearchParams();
  const now = today();
  const current = useMemo(() => periodOf(now, startDay), [now, startDay]);
  const presets = useMemo(() => [
    ['today', 'Hari ini', { from: now, to: now }],
    ['7d', '7 hari terakhir', { from: addDays(now, -6), to: now }],
    ['period', 'Periode ini', current],
    ['last', 'Periode lalu', shiftPeriod(current, startDay, -1)],
    ['3m', '3 bulan terakhir', { from: shiftPeriod(current, startDay, -2).from, to: current.to }],
    ['year', 'Tahun ini', { from: `${now.slice(0, 4)}-01-01`, to: `${now.slice(0, 4)}-12-31` }],
  ], [now, current, startDay]);

  const [preset, setPreset] = useState('period');
  const [range, setRange] = useState(current);
  const [editingDate, setEditingDate] = useState(false);
  const [draft, setDraft] = useState(current);
  const [type, setType] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [cats, setCats] = useState([]);
  const [allCats, setAllCats] = useState(false);
  const [walletIds, setWalletIds] = useState(() => (params.get('wallet') ? [params.get('wallet')] : []));
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mobileFilters, setMobileFilters] = useState(false);

  const toggle = (list, setList, id) => setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const expenseCats = categories.filter((c) => c.type === 'expense' || c.type === 'income');
  const shownCats = allCats ? expenseCats : expenseCats.slice(0, 5);

  const hasFilters = type !== 'all' || keyword || cats.length || walletIds.length || min || max || preset !== 'period';
  const clearAll = () => {
    setPreset('period'); setRange(current); setType('all'); setKeyword(''); setCats([]); setWalletIds([]); setMin(0); setMax(0);
  };

  const rows = useMemo(() => transactions
    .filter((t) => t.date >= range.from && t.date <= range.to)
    .filter((t) => type === 'all' || t.type === type)
    .filter((t) => !keyword || (t.note || '').toLowerCase().includes(keyword.toLowerCase()))
    .filter((t) => !cats.length || cats.includes(rootCategoryId(categories, t.categoryId)))
    .filter((t) => !walletIds.length || walletIds.includes(t.walletId) || walletIds.includes(t.toWalletId))
    .filter((t) => (!min || t.amount >= min) && (!max || t.amount <= max))
    .sort((a, b) => b.date.localeCompare(a.date)), [transactions, range, type, keyword, cats, walletIds, min, max, categories]);

  const totals = rows.reduce((acc, t) => {
    if (t.excluded) return acc;
    if (t.type === 'expense') acc.out += t.amount;
    if (t.type === 'income') acc.in += t.amount;
    return acc;
  }, { in: 0, out: 0 });

  const days = useMemo(() => {
    const map = new Map();
    rows.forEach((t) => map.set(t.date, [...(map.get(t.date) || []), t]));
    return [...map];
  }, [rows]);

  const label = rangeLabel(range.from, range.to);

  const filterPanel = (
    <>
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-gray-900">Filter</h2>
        {hasFilters ? <button type="button" onClick={clearAll} className="text-xs font-semibold text-blue-700">Hapus semua</button> : null}
      </div>
      <Section title="Tanggal">
        <div className="flex flex-wrap gap-1.5">
          {presets.map(([key, text, value]) => (
            <Chip key={key} active={preset === key} onClick={() => { setPreset(key); setRange(value); setEditingDate(false); }}>{text}</Chip>
          ))}
        </div>
        <div className="mt-2.5 flex min-h-[40px] items-center gap-2 rounded-xl border border-gray-200 px-2.5 text-xs text-gray-700">
          <Calendar className="h-4 w-4 text-gray-600" />
          <span className="flex-1">{label}</span>
          <button type="button" onClick={() => { setDraft(range); setEditingDate(!editingDate); }} className="font-semibold text-blue-700">Ubah</button>
        </div>
        {editingDate && (
          <div className="mt-2 space-y-2">
            <input aria-label="Dari tanggal" type="date" className={inputClass} value={draft.from} onChange={(e) => setDraft({ ...draft, from: e.target.value })} />
            <input aria-label="Sampai tanggal" type="date" className={inputClass} value={draft.to} onChange={(e) => setDraft({ ...draft, to: e.target.value })} />
            <PrimaryButton className="w-full" disabled={!draft.from || !draft.to || draft.from > draft.to} onClick={() => { setRange(draft); setPreset('custom'); setEditingDate(false); }}>Terapkan tanggal</PrimaryButton>
          </div>
        )}
      </Section>
      <Section title="Jenis">
        <Segmented className="!grid-cols-2" options={[['all', 'Semua'], ['expense', 'Pengeluaran'], ['income', 'Pemasukan'], ['transfer', 'Transfer']]} value={type} onChange={setType} />
      </Section>
      <Section title="Kata kunci">
        <input aria-label="Kata kunci" className={`${inputClass} !min-h-[40px]`} placeholder="Cari di deskripsi atau catatan" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </Section>
      <Section title="Kategori">
        {shownCats.map((c) => (
          <CheckRow key={c.id} checked={cats.includes(c.id)} onChange={() => toggle(cats, setCats, c.id)}>
            <CategoryIcon icon={c.icon} size="h-7 w-7 text-sm" />{c.name}
          </CheckRow>
        ))}
        <button type="button" onClick={() => setAllCats(!allCats)} className="mt-2 flex items-center gap-1 px-1 text-xs font-semibold text-blue-700">
          {allCats ? 'Sembunyikan kategori' : `Lihat semua kategori (${expenseCats.length})`} <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </Section>
      <Section title="Dompet">
        {wallets.map((w) => <CheckRow key={w.id} checked={walletIds.includes(w.id)} onChange={() => toggle(walletIds, setWalletIds, w.id)}>{w.name}</CheckRow>)}
      </Section>
      <Section title="Nominal">
        <div className="grid grid-cols-2 gap-2">
          <input aria-label="Nominal minimum" inputMode="numeric" className={`${inputClass} !min-h-[40px]`} placeholder="Min" value={groupDigits(min)} onChange={(e) => setMin(digits(e.target.value))} />
          <input aria-label="Nominal maksimum" inputMode="numeric" className={`${inputClass} !min-h-[40px]`} placeholder="Maks" value={groupDigits(max)} onChange={(e) => setMax(digits(e.target.value))} />
        </div>
        {min > 0 && max > 0 && min >= max && <p className="mt-1.5 text-xs text-red-600">Min harus lebih kecil dari Maks.</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {AMOUNTS.map(([text, a, b]) => <Chip key={text} active={min === a && max === b} onClick={() => { setMin(a); setMax(b); }}>{text}</Chip>)}
        </div>
      </Section>
    </>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <div className={`grid gap-6 ${filtersOpen ? 'lg:grid-cols-[280px_minmax(0,1fr)]' : ''}`}>
        {filtersOpen && (
          <aside className="hidden self-start rounded-2xl border border-gray-100 bg-white p-4 shadow-sm lg:sticky lg:top-[85px] lg:block lg:max-h-[calc(100vh-101px)] lg:overflow-y-auto">
            {filterPanel}
            <button type="button" onClick={() => setFiltersOpen(false)} className="mt-2 px-1 text-xs font-semibold text-gray-600 hover:text-gray-900">Sembunyikan filter</button>
          </aside>
        )}

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Transaksi</h1>
              <p className="mt-1 text-sm text-gray-600">{label}</p>
            </div>
            <div className="flex gap-2">
              {!filtersOpen && <button type="button" onClick={() => setFiltersOpen(true)} className="hidden min-h-[40px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 lg:flex"><SlidersHorizontal className="h-4 w-4" /> Filter</button>}
              <button type="button" onClick={() => setMobileFilters(true)} className="flex min-h-[40px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 lg:hidden"><SlidersHorizontal className="h-4 w-4" /> Filter</button>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-600">Pengeluaran <b className="text-gray-900">{rupiah(totals.out)}</b> · Pemasukan <b className="text-gray-900">{rupiah(totals.in)}</b> · {rows.length} transaksi</p>

          {rows.length === 0 ? (
            <Card className="mt-4 flex flex-col items-center py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700"><Receipt className="h-6 w-6" /></span>
              {hasFilters ? (
                <>
                  <h2 className="mt-5 text-base font-bold text-gray-900">Tidak ada yang cocok</h2>
                  <p className="mt-1 text-sm text-gray-600">Coba ubah atau hapus filternya.</p>
                  <button type="button" onClick={clearAll} className="mt-5 text-sm font-semibold text-blue-700">Hapus semua filter</button>
                </>
              ) : (
                <>
                  <h2 className="mt-5 text-base font-bold text-gray-900">Belum ada transaksi</h2>
                  <p className="mt-1 text-sm text-gray-600">{label} masih kosong.</p>
                  <PrimaryButton className="mt-5 min-h-[44px] px-5" onClick={() => openCatat({})}><Plus className="h-4 w-4" /> Catat</PrimaryButton>
                </>
              )}
            </Card>
          ) : (
            <div className="mt-4 space-y-4">
              {days.map(([date, items]) => {
                const dayOut = items.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                return (
                  <Card key={date} className="!p-0 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-5 py-3 text-xs font-semibold text-gray-600">
                      <span>{longDate(date)}</span>
                      {dayOut > 0 && <span>{rupiah(dayOut)}</span>}
                    </div>
                    <ul className="list-none divide-y divide-gray-100 p-0">
                      {items.map((t) => {
                        const category = t.type === 'transfer' ? { name: 'Transfer', icon: '🔁' } : findCategory(categories, t.categoryId);
                        const wallet = wallets.find((w) => w.id === t.walletId);
                        const target = wallets.find((w) => w.id === t.toWalletId);
                        return (
                          <li key={t.id}>
                            <button type="button" onClick={() => openCatat(t)} className="flex min-h-[64px] w-full items-center gap-3 px-5 py-3 text-left hover:bg-gray-50">
                              <CategoryIcon icon={category.icon} />
                              <span className="min-w-0 flex-1">
                                <b className="block truncate text-sm font-semibold text-gray-900">{t.note || category.name}</b>
                                <span className="block truncate text-xs text-gray-500">{category.name} · {wallet?.name}{target ? ` → ${target.name}` : ''}{t.excluded ? ' · dikecualikan' : ''}</span>
                              </span>
                              <b className={`whitespace-nowrap text-sm ${t.type === 'income' ? 'text-blue-700' : t.type === 'expense' ? 'text-orange-700' : 'text-gray-700'}`}>
                                {t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}{rupiah(t.amount)}
                              </b>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-white p-4 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter">
          <div className="mb-2 flex justify-end"><button type="button" aria-label="Tutup filter" onClick={() => setMobileFilters(false)} className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600"><X className="h-5 w-5" /></button></div>
          {filterPanel}
          <PrimaryButton className="sticky bottom-2 mt-4 min-h-[44px] w-full" onClick={() => setMobileFilters(false)}>Tampilkan {rows.length} transaksi</PrimaryButton>
        </div>
      )}
    </div>
  );
}
