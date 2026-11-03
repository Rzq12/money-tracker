import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChevronDown, ChevronRight, Handshake, Landmark, TrendingUp } from 'lucide-react';
import { ChartTip } from './Dashboard.jsx';
import { Card, PageTitle, WalletAvatar } from '../../components/ui.jsx';
import { rootCategoryId, useStore, walletBalance } from '../../lib/store.jsx';
import { compactRupiah, fromISO, MONTHS_SHORT, pad, rupiah, today } from '../../lib/format.js';

const axis = { tick: { fontSize: 10, fill: '#6b7280' }, axisLine: false, tickLine: false };

export default function Aset() {
  const { wallets, transactions, contacts, categories } = useStore();
  const [open, setOpen] = useState(true);
  const bank = wallets.reduce((s, w) => s + walletBalance(w, transactions), 0);
  const invest = transactions.filter((t) => t.type === 'expense' && rootCategoryId(categories, t.categoryId) === 'investasi').reduce((s, t) => s + t.amount, 0);
  const owed = contacts.flatMap((c) => c.records).filter((r) => !r.paid && r.direction === 'owed-to-me').reduce((s, r) => s + r.amount, 0);
  const owe = contacts.flatMap((c) => c.records).filter((r) => !r.paid && r.direction === 'i-owe').reduce((s, r) => s + r.amount, 0);
  const net = owed - owe;
  const total = bank + invest + net;
  const share = (v) => (total > 0 ? Math.max(0, Math.round((v / total) * 100)) : 0);

  const growth = useMemo(() => {
    const base = fromISO(today());
    return Array.from({ length: 12 }, (_, i) => {
      const d = new Date(base.getFullYear(), base.getMonth() - 11 + i + 1, 0);
      const end = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const until = transactions.filter((t) => t.date <= end);
      const dompet = wallets.reduce((s, w) => s + walletBalance(w, until), 0);
      const investasi = until.filter((t) => t.type === 'expense' && rootCategoryId(categories, t.categoryId) === 'investasi').reduce((s, t) => s + t.amount, 0);
      return { name: MONTHS_SHORT[d.getMonth()], Dompet: dompet, Investasi: investasi, 'Hutang piutang': net, 'Aset bersih': dompet + investasi + net };
    });
  }, [transactions, wallets, categories, net]);

  const summary = [['Bank & tunai', bank, Landmark], ['Investasi', invest, TrendingUp], ['Hutang piutang', net, Handshake]];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageTitle title="Aset" subtitle="Pantau kekayaan bersih dan pertumbuhan asetmu" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">Pertumbuhan Aset</h2>
          <p className="text-xs text-gray-500">12 bulan terakhir</p>
          <div className="mt-3 h-[310px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={growth} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" {...axis} />
                <YAxis width={54} tickFormatter={compactRupiah} {...axis} />
                <Tooltip content={<ChartTip />} cursor={{ fill: '#f9fafb' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar isAnimationActive={false} dataKey="Dompet" stackId="a" fill="#0091ea" maxBarSize={24} />
                <Bar isAnimationActive={false} dataKey="Investasi" stackId="a" fill="#a855f7" maxBarSize={24} />
                <Bar isAnimationActive={false} dataKey="Hutang piutang" stackId="a" fill="#ef4444" maxBarSize={24} />
                <Line isAnimationActive={false} type="monotone" dataKey="Aset bersih" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-gray-900">Total Aset</h2>
          <p className="mt-5 text-2xl font-bold text-gray-900">{rupiah(total)}</p>
          <ul className="mt-5 list-none space-y-5 p-0">
            {summary.map(([name, value, Icon]) => (
              <li key={name}>
                <p className="flex items-center gap-2 text-sm"><Icon className="h-4 w-4 text-gray-500" /><span className="flex-1 font-medium text-gray-800">{name}</span><span className="text-xs text-gray-500">{share(value)}%</span><b className="text-gray-900">{rupiah(value)}</b></p>
                <div className="mt-2 h-2 rounded-full bg-gray-100"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${share(value)}%` }} /></div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <Card className="mt-6">
        <div className="flex items-center justify-between"><h2 className="text-base font-semibold text-gray-900">Detail Aset</h2><span className="text-xs text-gray-500">{wallets.length} dompet dihitung</span></div>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="mt-4 flex min-h-[44px] w-full items-center gap-3 rounded-xl bg-gray-50 px-3 text-left text-xs font-semibold tracking-wide text-gray-700">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <Landmark className="h-4 w-4" />
          <span className="flex-1">BANK &amp; TUNAI <span className="ml-1 font-normal text-gray-500">({wallets.length})</span></span>
          <b className="text-sm text-gray-900">{rupiah(bank)}</b>
        </button>
        {open && (
          <ul className="ml-2 mt-1 list-none border-l border-gray-100 p-0 pl-5">
            {wallets.map((w) => (
              <li key={w.id}>
                <Link to={`/transactions?wallet=${w.id}`} className="flex min-h-[62px] items-center gap-3 rounded-lg px-1 hover:bg-gray-50">
                  <WalletAvatar wallet={w} size="h-8 w-8 text-xs" />
                  <span className="flex-1 text-sm font-medium text-gray-800">{w.name}</span>
                  <span className="text-sm text-gray-900">{rupiah(walletBalance(w, transactions))}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
