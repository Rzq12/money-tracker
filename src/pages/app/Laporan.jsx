import { useMemo, useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ChartTip, TxRow } from './Dashboard.jsx';
import { Card, CategoryIcon, Dropdown, Empty, PageTitle, Tabs, inputClass } from '../../components/ui.jsx';
import { counted, findCategory, rootCategoryId, useStore } from '../../lib/store.jsx';
import { tagCounts } from '../../lib/rules.js';
import { addDays, compactRupiah, downloadText, fromISO, MONTHS, MONTHS_SHORT, pad, periodOf, rupiah, shiftPeriod, slashDate, toCSV, today } from '../../lib/format.js';

const TABS = [['expense', 'Pengeluaran'], ['income', 'Pemasukan']];
const axis = { tick: { fontSize: 10, fill: '#6b7280' }, axisLine: false, tickLine: false };
const DAYS_HEAD = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

const sumBy = (rows) => rows.reduce((s, t) => s + t.amount, 0);

function BreakdownRow({ icon, name, value, total, tone }) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <li>
      <div className="flex items-center gap-3">
        {icon}
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-800">{name}</span>
        <span className="text-xs text-gray-500">{pct}%</span>
        <b className="text-sm text-gray-900">{compactRupiah(value)}</b>
      </div>
      <div className="mt-1.5 h-1.5 rounded-full bg-gray-100"><div className={`h-1.5 rounded-full ${tone}`} style={{ width: `${pct}%` }} /></div>
    </li>
  );
}

export default function Laporan() {
  const { transactions, categories, wallets, startDay, notify } = useStore();
  const now = today();
  const thisPeriod = useMemo(() => periodOf(now, startDay), [now, startDay]);
  const periods = useMemo(() => [
    ['this', 'Periode ini', thisPeriod],
    ['last', 'Periode lalu', shiftPeriod(thisPeriod, startDay, -1)],
    ['3m', '3 bulan terakhir', { from: shiftPeriod(thisPeriod, startDay, -2).from, to: thisPeriod.to }],
    ['year', 'Tahun ini', { from: `${now.slice(0, 4)}-01-01`, to: `${now.slice(0, 4)}-12-31` }],
  ], [thisPeriod, startDay, now]);
  const [periodKey, setPeriodKey] = useState('this');
  const period = periods.find(([k]) => k === periodKey)[2];
  const [mainType, setMainType] = useState('expense');
  const [mainCat, setMainCat] = useState('all');
  const [mainWallet, setMainWallet] = useState('all');
  const [trendTab, setTrendTab] = useState('expense');
  const [topTab, setTopTab] = useState('expense');
  const [catTab, setCatTab] = useState('expense');
  const [catWallet, setCatWallet] = useState('all');
  const [walletTab, setWalletTab] = useState('expense');
  const [walletCat, setWalletCat] = useState('all');
  const [calMonth, setCalMonth] = useState(() => new Date(fromISO(now).getFullYear(), fromISO(now).getMonth(), 1));
  const [from, setFrom] = useState(thisPeriod.from);
  const [to, setTo] = useState(thisPeriod.to);

  const list = useMemo(() => transactions.filter(counted), [transactions]);
  const inPeriod = useMemo(() => list.filter((t) => t.date >= period.from && t.date <= period.to), [list, period]);

  const catOptions = [['all', 'Semua Kategori'], ...categories.map((c) => [c.id, c.name])];
  const walletOptions = [['all', 'Semua Dompet'], ...wallets.map((w) => [w.id, w.name])];

  const mainRows = inPeriod.filter((t) => t.type === mainType && (mainCat === 'all' || rootCategoryId(categories, t.categoryId) === mainCat) && (mainWallet === 'all' || t.walletId === mainWallet));
  const mainTotal = sumBy(mainRows);
  const mainDays = new Set(mainRows.map((t) => t.date)).size;
  const mainData = useMemo(() => {
    const length = Math.round((fromISO(period.to) - fromISO(period.from)) / 864e5) + 1;
    return Array.from({ length }, (_, i) => {
      const day = addDays(period.from, i);
      return { day: fromISO(day).getDate(), Nilai: sumBy(mainRows.filter((t) => t.date === day)) };
    });
  }, [period, mainRows]);

  const months = useMemo(() => {
    const base = fromISO(now);
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth() - 11 + i, 1);
      const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
      const rows = list.filter((t) => t.date.startsWith(key));
      return { key, name: MONTHS_SHORT[d.getMonth()], Pengeluaran: sumBy(rows.filter((t) => t.type === 'expense')), Pemasukan: sumBy(rows.filter((t) => t.type === 'income')) };
    });
  }, [list, now]);
  const sixMonths = months.slice(-6).map((m) => ({ ...m, 'Net Flow': m.Pemasukan - m.Pengeluaran }));

  const top = [...inPeriod.filter((t) => t.type === topTab)].sort((a, b) => b.amount - a.amount).slice(0, 5);

  const catRows = useMemo(() => {
    const map = new Map();
    inPeriod.filter((t) => t.type === catTab && (catWallet === 'all' || t.walletId === catWallet)).forEach((t) => {
      const id = rootCategoryId(categories, t.categoryId);
      map.set(id, (map.get(id) || 0) + t.amount);
    });
    return [...map].sort((a, b) => b[1] - a[1]);
  }, [inPeriod, catTab, catWallet, categories]);
  const catTotal = catRows.reduce((s, [, v]) => s + v, 0);

  const walletRows = useMemo(() => {
    const map = new Map();
    inPeriod.filter((t) => t.type === walletTab && (walletCat === 'all' || rootCategoryId(categories, t.categoryId) === walletCat)).forEach((t) => map.set(t.walletId, (map.get(t.walletId) || 0) + t.amount));
    return [...map].sort((a, b) => b[1] - a[1]);
  }, [inPeriod, walletTab, walletCat, categories]);
  const walletTotal = walletRows.reduce((s, [, v]) => s + v, 0);

  const calCells = useMemo(() => {
    const start = new Date(calMonth);
    start.setDate(1 - start.getDay());
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const rows = list.filter((t) => t.date === iso);
      return { iso, date: d.getDate(), inMonth: d.getMonth() === calMonth.getMonth(), out: sumBy(rows.filter((t) => t.type === 'expense')), in: sumBy(rows.filter((t) => t.type === 'income')) };
    });
  }, [calMonth, list]);

  const range = list.filter((t) => t.date >= from && t.date <= to);
  const rangeIn = sumBy(range.filter((t) => t.type === 'income'));
  const rangeOut = sumBy(range.filter((t) => t.type === 'expense'));

  const exportRange = (kind) => {
    const rows = [['Tanggal', 'Jenis', 'Kategori', 'Dompet', 'Catatan', 'Nominal', 'Tag'], ...range.map((t) => [t.date, t.type, findCategory(categories, t.categoryId).name, wallets.find((w) => w.id === t.walletId)?.name, t.note, t.amount, (t.tags || []).join(' ')])];
    downloadText(`laporan-${from}-${to}.${kind}`, toCSV(rows));
    notify('Laporan diunduh.');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageTitle
        title="Laporan Keuangan"
        subtitle="Pantau arus kas dan tren kategori Anda"
        right={(
          <div className="relative flex min-h-[48px] items-center gap-2.5 rounded-xl border border-gray-100 bg-white pl-3 pr-2 shadow-sm">
            <Calendar className="h-4 w-4 text-blue-500" />
            <div>
              <Dropdown label="Pilih periode" value={periodKey} options={periods.map(([k, t]) => [k, t])} onChange={setPeriodKey} className="[&>button]:!min-h-0 [&>button]:!border-0 [&>button]:!p-0 [&>button]:!text-sm" />
              <p className="whitespace-nowrap text-2xs text-gray-500">{slashDate(period.from)} – {slashDate(period.to)}</p>
            </div>
          </div>
        )}
      />

      <Card className="!p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{rupiah(mainTotal)}</h2>
            <p className="text-xs text-gray-500">{mainRows.length} transaksi di {mainDays} hari</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs font-semibold" role="tablist">
              {TABS.map(([k, t]) => (
                <button key={k} type="button" role="tab" aria-selected={mainType === k} onClick={() => setMainType(k)} className={`min-h-[30px] px-3 ${mainType === k ? 'bg-blue-700 text-white' : 'bg-white text-gray-700'}`}>{t}</button>
              ))}
            </div>
            <Dropdown label="Kategori" value={mainCat} options={catOptions} onChange={setMainCat} />
            <Dropdown label="Dompet" value={mainWallet} options={walletOptions} onChange={setMainWallet} />
          </div>
        </div>
        <div className="mt-5 h-[290px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mainData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" interval={4} {...axis} />
              <YAxis width={54} tickFormatter={compactRupiah} {...axis} />
              <Tooltip content={<ChartTip labelPrefix="Tanggal " />} />
              <Area isAnimationActive={false} type="monotone" dataKey="Nilai" name={mainType === 'expense' ? 'Pengeluaran' : 'Pemasukan'} stroke={mainType === 'expense' ? '#f97316' : '#0091ea'} fill={mainType === 'expense' ? '#fff7ed' : '#e1f5fe'} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <Tabs options={TABS} value={trendTab} onChange={setTrendTab} />
          <h2 className="text-base font-semibold text-gray-900">Trend Bulanan</h2>
          <p className="text-xs text-gray-500">12 Bulan terakhir</p>
          <div className="mt-3 h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" {...axis} />
                <YAxis width={54} tickFormatter={compactRupiah} {...axis} />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f9fafb' }} />
                <Bar isAnimationActive={false} dataKey={trendTab === 'expense' ? 'Pengeluaran' : 'Pemasukan'} fill={trendTab === 'expense' ? '#fb923c' : '#29b6f6'} radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <Tabs options={TABS} value={topTab} onChange={setTopTab} />
          <h2 className="text-base font-semibold text-gray-900">Transaksi Terbesar</h2>
          <div className="mt-3">{top.length ? top.map((t) => <TxRow key={t.id} tx={t} />) : <Empty className="pt-10">Tidak ada transaksi</Empty>}</div>
        </Card>
        <Card className="!p-5">
          <Tabs options={TABS} value={catTab} onChange={setCatTab} />
          <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-gray-900">Kategori</h2><Dropdown label="Dompet" value={catWallet} options={walletOptions} onChange={setCatWallet} /></div>
          <ul className="mt-4 list-none space-y-3.5 p-0">
            {catRows.length ? catRows.map(([id, v]) => {
              const c = findCategory(categories, id);
              return <BreakdownRow key={id} icon={<CategoryIcon icon={c.icon} size="h-8 w-8 text-sm" />} name={c.name} value={v} total={catTotal} tone={catTab === 'expense' ? 'bg-orange-400' : 'bg-blue-400'} />;
            }) : <li><Empty>Tidak ada data</Empty></li>}
          </ul>
        </Card>
        <Card className="!p-5">
          <Tabs options={TABS} value={walletTab} onChange={setWalletTab} />
          <div className="flex items-center justify-between"><h2 className="text-sm font-semibold text-gray-900">Dompet</h2><Dropdown label="Kategori" value={walletCat} options={catOptions} onChange={setWalletCat} /></div>
          <ul className="mt-4 list-none space-y-3.5 p-0">
            {walletRows.length ? walletRows.map(([id, v]) => {
              const w = wallets.find((x) => x.id === id);
              return <BreakdownRow key={id} icon={<span className="h-8 w-8 rounded-full" style={{ background: w?.color }} />} name={w?.name || 'Dompet'} value={v} total={walletTotal} tone={walletTab === 'expense' ? 'bg-orange-400' : 'bg-blue-400'} />;
            }) : <li><Empty>Tidak ada data</Empty></li>}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 !p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><Calendar className="h-4 w-4 text-blue-500" /> Kalendar Transaksi</h2>
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Bulan sebelumnya" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><ChevronLeft className="h-4 w-4" /></button>
            <span className="min-w-[110px] text-center text-sm font-medium text-gray-800">{MONTHS[calMonth.getMonth()]} {calMonth.getFullYear()}</span>
            <button type="button" aria-label="Bulan berikutnya" onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-7 rounded-t-lg bg-gray-50 py-2 text-center text-2xs font-semibold tracking-wide text-gray-500">
              {DAYS_HEAD.map((d) => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 border-l border-t border-gray-100">
              {calCells.map((c) => (
                <div key={c.iso} className={`h-[120px] border-b border-r border-gray-100 p-2 text-xs ${c.inMonth ? '' : 'bg-gray-50/50 text-gray-400'}`}>
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full font-semibold ${c.iso === now ? 'bg-blue-700 text-white' : ''}`}>{pad(c.date)}</span>
                  {c.in > 0 && <p className="mt-1 truncate text-2xs font-semibold text-blue-700">+{compactRupiah(c.in)}</p>}
                  {c.out > 0 && <p className="mt-1 truncate text-2xs font-semibold text-orange-700">-{compactRupiah(c.out)}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <Card>
          <h2 className="text-base font-semibold text-gray-900">Arus Keuangan</h2>
          <p className="text-xs text-gray-500">6 bulan terakhir</p>
          <div className="mt-3 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={sixMonths} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" {...axis} />
                <YAxis width={54} tickFormatter={compactRupiah} {...axis} />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f9fafb' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Bar isAnimationActive={false} dataKey="Pemasukan" fill="#66bb6a" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Bar isAnimationActive={false} dataKey="Pengeluaran" fill="#f87171" radius={[3, 3, 0, 0]} maxBarSize={18} />
                <Line isAnimationActive={false} type="monotone" dataKey="Net Flow" stroke="#6366f1" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-gray-900">Ringkasan Arus Kas</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input aria-label="Dari tanggal" type="date" className={`${inputClass} !min-h-[34px] !w-[138px] !px-2 !py-1 !text-xs`} value={from} onChange={(e) => setFrom(e.target.value)} />
            <span className="text-gray-400">–</span>
            <input aria-label="Sampai tanggal" type="date" className={`${inputClass} !min-h-[34px] !w-[138px] !px-2 !py-1 !text-xs`} value={to} onChange={(e) => setTo(e.target.value)} />
            <button type="button" onClick={() => exportRange('csv')} className="flex min-h-[34px] items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"><Download className="h-3.5 w-3.5" /> Ekspor</button>
          </div>
          <div className="mt-4 border-b border-gray-100 pb-4">
            <p className="flex items-center justify-between text-xs font-semibold text-green-700"><span>▲ TOTAL PEMASUKAN</span><b>{rupiah(rangeIn)}</b></p>
            <p className="mt-2 text-xs italic text-gray-500">{range.some((t) => t.type === 'income') ? `${range.filter((t) => t.type === 'income').length} transaksi` : 'Tidak ada data'}</p>
          </div>
          <div className="mt-4 border-b border-gray-100 pb-4">
            <p className="flex items-center justify-between text-xs font-semibold text-red-600"><span>▼ TOTAL PENGELUARAN</span><b>{rupiah(rangeOut)}</b></p>
            <p className="mt-2 text-xs italic text-gray-500">{range.some((t) => t.type === 'expense') ? `${range.filter((t) => t.type === 'expense').length} transaksi` : 'Tidak ada data'}</p>
          </div>
          <p className="mt-5 flex items-center justify-between text-xs font-semibold text-gray-800"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-500" />Net Flow</span><b className="text-sm text-indigo-600">{rangeIn - rangeOut >= 0 ? '+' : ''}{rupiah(rangeIn - rangeOut)}</b></p>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-gray-900">Tag teratas</h2>
          {tagCounts(range).length === 0 ? (
            <Empty>Belum ada transaksi bertag di rentang ini.</Empty>
          ) : (
            <ul className="mt-3 list-none space-y-2 p-0">
              {tagCounts(range).slice(0, 8).map((tag) => (
                <li key={tag.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-gray-700">#{tag.name}</span>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">{tag.count} transaksi</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
