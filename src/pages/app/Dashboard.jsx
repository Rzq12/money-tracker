import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Handshake, Wallet } from 'lucide-react';
import { Card, CategoryIcon, Empty, WalletAvatar } from '../../components/ui.jsx';
import { counted, findCategory, inRange, rootCategoryId, useStore, walletBalance } from '../../lib/store.jsx';
import { addDays, compactRupiah, fromISO, MONTHS, periodOf, rupiah, shiftPeriod, shortDate, today } from '../../lib/format.js';

const PIE = ['#0091ea', '#f97316', '#4caf50', '#a855f7', '#ef4444', '#f59e0b', '#26c6da'];

export const ChartTip = ({ active, payload, label, labelPrefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="flex min-w-max flex-col gap-1.5 whitespace-nowrap rounded-xl bg-gray-900 px-3 py-2.5 text-xs text-white shadow-xl">
      <b>{labelPrefix}{label}</b>
      {payload.filter((p) => p.value !== null && p.value !== undefined).map((p) => (
        <span key={p.dataKey} className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          {p.name}: {rupiah(p.value)}
        </span>
      ))}
    </div>
  );
};

const axis = { tick: { fontSize: 10, fill: '#6b7280' }, axisLine: false, tickLine: false };

const SectionHead = ({ title, to, more = 'Lihat semua', subtitle }) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
    </div>
    {to && <Link to={to} className="whitespace-nowrap text-xs font-semibold text-blue-700 hover:text-blue-800">{more}</Link>}
  </div>
);

export const TxRow = ({ tx }) => {
  const { categories, wallets, openCatat } = useStore();
  const category = tx.type === 'transfer' ? { name: 'Transfer', icon: '🔁' } : findCategory(categories, tx.categoryId);
  const wallet = wallets.find((w) => w.id === tx.walletId);
  return (
    <button type="button" onClick={() => openCatat(tx)} className="flex w-full items-center gap-3 rounded-lg py-1.5 text-left hover:bg-gray-50">
      <CategoryIcon icon={category.icon} />
      <span className="min-w-0 flex-1">
        <b className="block truncate text-sm font-semibold text-gray-900">{tx.note || category.name}</b>
        <span className="block truncate text-xs text-gray-500">{category.name} · {wallet?.name || 'Dompet'} · {shortDate(tx.date)}</span>
      </span>
      <b className={`whitespace-nowrap text-sm ${tx.type === 'income' ? 'text-blue-700' : tx.type === 'expense' ? 'text-orange-700' : 'text-gray-700'}`}>{rupiah(tx.amount)}</b>
    </button>
  );
};

function StatCards({ cards }) {
  const scroller = useRef(null);
  const [index, setIndex] = useState(0);
  const onScroll = () => {
    const el = scroller.current;
    if (el) setIndex(Math.round(el.scrollLeft / (el.scrollWidth / cards.length)));
  };
  const body = (c) => (
    <>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{c.label}</p>
      <h3 className={`relative z-10 mt-2 mb-3 text-[24px] font-bold leading-8 lg:text-3xl lg:leading-9 ${c.tone}`}>{c.value}</h3>
      <p className="relative z-10 text-xs text-gray-500">{c.note}</p>
      {c.watermark && <Wallet className="pointer-events-none absolute right-0 top-2 h-[112px] w-[112px] text-gray-100" />}
    </>
  );
  return (
    <>
      <div className="hidden gap-4 md:grid md:grid-cols-3 lg:gap-6">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}><Card className="relative h-full min-h-[138px] overflow-hidden transition-all duration-300 hover:border-blue-200 hover:shadow-md">{body(c)}</Card></Link>
        ))}
      </div>
      <div ref={scroller} onScroll={onScroll} className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto md:hidden">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="relative min-w-[82%] shrink-0 snap-center overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm shadow-black/[0.03]">{body(c)}</Link>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
        {cards.map((c, i) => <span key={c.label} className={`h-1.5 rounded-full ${i === index ? 'w-5 bg-blue-500' : 'w-1.5 bg-gray-200'}`} />)}
      </div>
    </>
  );
}

export default function Dashboard() {
  const { user, transactions, wallets, categories, budgets, contacts, startDay, features } = useStore();
  const now = today();
  const period = useMemo(() => periodOf(now, startDay), [now, startDay]);
  const previous = useMemo(() => shiftPeriod(period, startDay, -1), [period, startDay]);
  const list = useMemo(() => transactions.filter(counted), [transactions]);
  const current = list.filter((t) => inRange(t, period.from, period.to));
  const expenses = current.filter((t) => t.type === 'expense');
  const spent = expenses.reduce((s, t) => s + t.amount, 0);
  const prevSpent = list.filter((t) => t.type === 'expense' && inRange(t, previous.from, previous.to)).reduce((s, t) => s + t.amount, 0);
  const totalBalance = wallets.reduce((s, w) => s + walletBalance(w, transactions), 0);
  const nowDate = fromISO(now);
  const budget = budgets.find((b) => b.month === now.slice(0, 7));
  const budgetTotal = budget ? budget.items.reduce((s, i) => s + i.amount, 0) : 0;
  const daysLeft = Math.max(1, Math.round((fromISO(period.to) - nowDate) / 864e5) + 1);
  const dayIndex = Math.round((nowDate - fromISO(period.from)) / 864e5) + 1;
  const firstName = user.name.split(' ')[0];

  const diff = prevSpent ? Math.round(((spent - prevSpent) / prevSpent) * 100) : null;
  const cards = [
    {
      label: 'Total Pengeluaran', value: rupiah(spent), tone: 'text-orange-700', to: '/laporan',
      note: diff === null ? <><b className="font-semibold text-green-500">Data baru</b> dari bulan lalu</> : <><b className={`font-semibold ${diff > 0 ? 'text-red-600' : 'text-green-500'}`}>{diff > 0 ? '+' : ''}{diff}%</b> dari bulan lalu</>,
    },
    {
      label: 'Sisa Anggaran', value: budget ? rupiah(budgetTotal - spent) : 'Belum tersedia', tone: 'text-gray-900', to: '/anggaran',
      note: `Kamu bisa mengeluarkan ${budget ? rupiah(Math.max(0, budgetTotal - spent) / daysLeft) : '0'}/hari`,
    },
    { label: 'Total Saldo', value: rupiah(totalBalance), tone: 'text-blue-700', to: '/aset', note: ' ', watermark: true },
  ];

  const trend = useMemo(() => {
    const length = Math.round((fromISO(period.to) - fromISO(period.from)) / 864e5) + 1;
    let run = 0;
    let prevRun = 0;
    return Array.from({ length }, (_, i) => {
      const day = addDays(period.from, i);
      const prevDay = addDays(previous.from, i);
      run += list.filter((t) => t.type === 'expense' && t.date === day).reduce((s, t) => s + t.amount, 0);
      prevRun += list.filter((t) => t.type === 'expense' && t.date === prevDay).reduce((s, t) => s + t.amount, 0);
      return { day: i + 1, ini: day <= now ? run : null, lalu: prevRun };
    });
  }, [list, period, previous, now]);

  const flow = useMemo(() => Array.from({ length: 30 }, (_, i) => {
    const day = addDays(now, i - 29);
    const sum = (type) => list.filter((t) => t.type === type && t.date === day).reduce((s, t) => s + t.amount, 0);
    return { day: fromISO(day).getDate(), label: shortDate(day), Pemasukan: sum('income'), Pengeluaran: sum('expense') };
  }), [list, now]);

  const byCategory = useMemo(() => {
    const map = new Map();
    expenses.forEach((t) => {
      const id = rootCategoryId(categories, t.categoryId);
      map.set(id, (map.get(id) || 0) + t.amount);
    });
    return [...map].map(([id, value]) => ({ name: findCategory(categories, id).name, value })).sort((a, b) => b.value - a.value);
  }, [expenses, categories]);

  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  const largest = [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 4);
  const debtRows = contacts.flatMap((c) => c.records.filter((r) => !r.paid).map((r) => ({ ...r, who: c.name }))).slice(0, 3);
  const budgetRows = budget ? budget.items.slice(0, 4).map((item) => {
    const used = expenses.filter((t) => rootCategoryId(categories, t.categoryId) === item.categoryId).reduce((s, t) => s + t.amount, 0);
    const category = findCategory(categories, item.categoryId);
    return { ...item, used, name: category.name, icon: category.icon };
  }) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-gray-100/60 pb-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-gray-900">Hi, {firstName} <span aria-hidden="true">👋</span></h1>
          <p className="text-sm text-gray-500">Udah siap buat lihat status keuanganmu?</p>
        </div>
        <div className="md:text-right">
          <h2 className="text-lg font-bold text-gray-900">{MONTHS[nowDate.getMonth()]} {nowDate.getFullYear()}</h2>
          <p className="text-sm font-medium text-gray-500">Hari ke - {dayIndex}</p>
        </div>
      </div>

      <div className="mt-8"><StatCards cards={cards} /></div>

      <div className="mt-[34px] grid gap-4 lg:grid-cols-3 lg:gap-x-6 lg:gap-y-[34px]">
        <Card className="lg:col-span-2 lg:min-h-[348px]">
          <SectionHead title="Trend Pengeluaran" subtitle="Harian dibandingkan bulan lalu" />
          <div className="mt-3 h-[242px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" ticks={[1, 5, 10, 15, 20, 25, 30]} {...axis} />
                <YAxis width={56} tickFormatter={compactRupiah} {...axis} />
                <Tooltip content={<ChartTip labelPrefix="Tanggal " />} />
                <Line isAnimationActive={false} type="monotone" dataKey="lalu" name="Bulan lalu" stroke="#d1d5db" strokeWidth={2} dot={false} />
                <Line isAnimationActive={false} type="monotone" dataKey="ini" name="Bulan ini" stroke="#ef4444" strokeWidth={2} dot={false} connectNulls={false} />
                {budget && <ReferenceLine y={budgetTotal} stroke="#a855f7" strokeDasharray="4 4" />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionHead title="Transaksi Terbaru" to="/transactions" />
          <div className="mt-3">
            {recent.length ? recent.map((t) => <TxRow key={t.id} tx={t} />) : <Empty className="pt-8">Tidak ada transaksi terbaru</Empty>}
          </div>
        </Card>

        <Card className="lg:col-span-2 lg:min-h-[348px]">
          <SectionHead title="Arus Keuangan" subtitle="30 hari terakhir" />
          <div className="mt-2 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flow} margin={{ top: 4, right: 0, left: 0, bottom: 0 }} barGap={1}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="day" interval={4} {...axis} />
                <YAxis hide />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f9fafb' }} />
                <Legend verticalAlign="top" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, fontWeight: 600, paddingBottom: 8 }} />
                <Bar isAnimationActive={false} dataKey="Pemasukan" fill="#29b6f6" radius={[2, 2, 0, 0]} maxBarSize={12} minPointSize={2} />
                <Bar isAnimationActive={false} dataKey="Pengeluaran" fill="#fb923c" radius={[2, 2, 0, 0]} maxBarSize={12} minPointSize={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <SectionHead title="Sisa Anggaran" to={features.anggaran ? '/anggaran' : undefined} />
          <div className="mt-4 space-y-4">
            {budgetRows.length ? budgetRows.map((row) => {
              const pct = row.amount ? Math.min(100, Math.round((row.used / row.amount) * 100)) : 0;
              return (
                <div key={row.categoryId}>
                  <p className="flex items-center justify-between text-sm"><span className="font-medium text-gray-800">{row.icon} {row.name}</span><span className="text-xs text-gray-500">{pct}%</span></p>
                  <div className="mt-1.5 h-2 rounded-full bg-gray-100"><div className={`h-2 rounded-full ${pct >= 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${pct}%` }} /></div>
                  <p className="mt-1 text-xs text-gray-500">Sisa {rupiah(row.amount - row.used)}</p>
                </div>
              );
            }) : <Empty className="pt-8">Tidak ada data anggaran</Empty>}
          </div>
        </Card>

        <Card>
          <SectionHead title="Pengeluaran per Kategori" />
          {byCategory.length ? (
            <>
              <div className="mt-2 h-[170px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie isAnimationActive={false} data={byCategory} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                      {byCategory.map((c, i) => <Cell key={c.name} fill={PIE[i % PIE.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => rupiah(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 list-none space-y-1 p-0 text-xs">
                {byCategory.slice(0, 4).map((c, i) => (
                  <li key={c.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE[i % PIE.length] }} /><span className="flex-1 truncate text-gray-700">{c.name}</span><b className="text-gray-900">{compactRupiah(c.value)}</b></li>
                ))}
              </ul>
            </>
          ) : <div className="mt-4 flex h-[259px] items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-500">Belum ada data pengeluaran</div>}
        </Card>
        <Card>
          <SectionHead title="Transaksi Terbesar" to="/transactions" />
          <div className="mt-3">{largest.length ? largest.map((t) => <TxRow key={t.id} tx={t} />) : <Empty className="pt-8">Tidak ada transaksi</Empty>}</div>
        </Card>
        <Card>
          <SectionHead title="Saldo Dompet" to="/aset" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            {wallets.map((w) => (
              <Link key={w.id} to={`/transactions?wallet=${w.id}`} className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 hover:border-blue-200">
                <WalletAvatar wallet={w} size="h-8 w-8 text-xs" />
                <b className="mt-3 block truncate text-sm font-bold text-gray-900">{rupiah(walletBalance(w, transactions))}</b>
                <span className="block truncate text-xs text-gray-500">{w.name}</span>
              </Link>
            ))}
          </div>
        </Card>

        {features.hutang && (
          <Card className="lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-semibold text-gray-900"><Handshake className="h-4 w-4 text-gray-600" /> Hutang Piutang</h2>
              <Link to="/debt" className="text-xs font-semibold text-blue-700">Lihat semua ›</Link>
            </div>
            {debtRows.length ? (
              <ul className="mt-4 grid list-none gap-3 p-0 md:grid-cols-3">
                {debtRows.map((r) => (
                  <li key={r.id} className="rounded-xl bg-gray-50 p-3.5">
                    <b className="block text-sm text-gray-900">{r.who}</b>
                    <span className="text-xs text-gray-500">{r.direction === 'i-owe' ? 'Saya yang hutang' : 'Hutang ke saya'}</span>
                    <b className={`mt-1 block ${r.direction === 'i-owe' ? 'text-orange-700' : 'text-green-700'}`}>{rupiah(r.amount)}</b>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-5 text-center">
                <p className="text-sm text-gray-500">Belum ada catatan</p>
                <Link to="/debt" className="mt-3 inline-block text-sm font-semibold text-blue-700">Mulai Catat →</Link>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
