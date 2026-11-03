import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { Card, Dropdown, PageTitle, PrimaryButton } from '../../components/ui.jsx';
import { counted, findCategory, rootCategoryId, useStore } from '../../lib/store.jsx';
import { fromISO, MONTHS, pad, rupiah, today } from '../../lib/format.js';
import { GROUPS } from '../../lib/seed.js';

export default function Anggaran() {
  const { budgets, transactions, categories, features } = useStore();
  const navigate = useNavigate();
  const base = fromISO(today());
  const monthOptions = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() - 4 + i, 1);
    return [`${d.getFullYear()}-${pad(d.getMonth() + 1)}`, `${MONTHS[d.getMonth()]} ${d.getFullYear()}`];
  }), [base.getFullYear(), base.getMonth()]);
  const [month, setMonth] = useState(today().slice(0, 7));
  const budget = budgets.find((b) => b.month === month);
  const rows = transactions.filter((t) => counted(t) && t.type === 'expense' && t.date.startsWith(month));

  const items = budget ? budget.items.map((item) => {
    const category = findCategory(categories, item.categoryId);
    const used = rows.filter((t) => rootCategoryId(categories, t.categoryId) === item.categoryId).reduce((s, t) => s + t.amount, 0);
    return { ...item, name: category.name, icon: category.icon, group: category.group, used };
  }) : [];
  const total = items.reduce((s, i) => s + i.amount, 0);
  const used = items.reduce((s, i) => s + i.used, 0);
  const left = total - used;
  const usedPct = total ? Math.round((used / total) * 100) : 0;
  const over = items.filter((i) => i.used > i.amount);
  const hottest = [...items].sort((a, b) => b.used / (b.amount || 1) - a.used / (a.amount || 1))[0];
  const groups = Object.entries(GROUPS).map(([key, g]) => {
    const list = items.filter((i) => i.group === key);
    const plan = list.reduce((s, i) => s + i.amount, 0);
    const spend = list.reduce((s, i) => s + i.used, 0);
    return { key, ...g, list, plan, spend, target: budget?.split?.[key] ?? 0, share: total ? Math.round((plan / total) * 100) : 0 };
  });

  const monthPicker = <Dropdown label="Pilih bulan" value={month} options={monthOptions} onChange={setMonth} className="[&>button]:!min-h-[38px] [&>button]:!rounded-xl [&>button]:!px-4 [&>button]:!text-sm" />;

  if (!features.anggaran) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageTitle title="Anggaran" />
        <Card className="py-12 text-center text-sm text-gray-600">Fitur anggaran sedang dimatikan. Nyalakan lagi di <Link className="font-semibold text-blue-700" to="/akun/fitur">Atur fitur</Link>.</Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageTitle
        title="Anggaran"
        subtitle="Sisa berapa ya anggaranmu?"
        right={(
          <div className="flex items-center gap-2">
            {budget && <Link to={`/anggaran/${budget.id}/edit`} className="flex min-h-[38px] items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Pencil className="h-3.5 w-3.5" /> Edit</Link>}
            {monthPicker}
          </div>
        )}
      />

      {!budget ? (
        <Card className="flex flex-col items-center py-12 text-center">
          <span className="text-[40px] leading-[48px]" aria-hidden="true">🎯</span>
          <h2 className="mt-3 text-lg font-semibold text-gray-800">Yuk, Atur Anggaranmu!</h2>
          <p className="mt-2 max-w-[400px] text-sm leading-5 text-gray-600">Dengan anggaran, kamu bisa tahu uangmu pergi ke mana dan memastikan tabungan tetap aman. Cuma 2 menit kok!</p>
          <PrimaryButton className="mt-6 min-h-[40px] px-6" onClick={() => navigate(`/anggaran/buat?month=${month}`)}>Buat Anggaran Sekarang</PrimaryButton>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <h2 className="text-sm font-semibold text-gray-600">Sisa Anggaran</h2>
              <p className={`mt-2 text-3xl font-bold ${left < 0 ? 'text-red-600' : 'text-gray-900'}`}>{rupiah(left)}</p>
              <p className="mt-1 text-xs text-gray-500">dari {rupiah(total)}</p>
              <div className="mt-4 h-2.5 rounded-full bg-gray-100"><div className={`h-2.5 rounded-full ${usedPct >= 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, usedPct)}%` }} /></div>
              <p className="mt-2 text-xs text-gray-500">Penggunaan {usedPct}%</p>
            </Card>
            <Card className="lg:col-span-2">
              <h2 className="text-base font-semibold text-gray-900">Penggunaan Anggaran vs Rencana</h2>
              {rows.length === 0 ? <p className="py-8 text-center text-sm text-gray-500">Belum ada data transaksi untuk ditampilkan</p> : (
                <div className="mt-4 space-y-4">
                  {groups.filter((g) => g.plan > 0).map((g) => (
                    <div key={g.key}>
                      <p className="flex items-center justify-between text-sm"><span className={`font-semibold ${g.text}`}>{g.label}</span><span className="text-xs text-gray-500">{rupiah(g.spend)} / {rupiah(g.plan)}</span></p>
                      <div className="mt-1.5 h-2.5 rounded-full bg-gray-100"><div className={`h-2.5 rounded-full ${g.bar}`} style={{ width: `${Math.min(100, Math.round((g.spend / g.plan) * 100))}%` }} /></div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <Card>
            <h2 className="text-base font-semibold text-gray-900">Sisa Anggaran per Group</h2>
            <div className="mt-4 grid gap-6 lg:grid-cols-3">
              {groups.map((g) => (
                <div key={g.key}>
                  <p className={`text-sm font-bold ${g.text}`}>{g.label} <span className="font-normal text-gray-500">· rencana {g.target}%</span></p>
                  <p className="text-xs text-gray-500">sisa {rupiah(g.plan - g.spend)} dari {rupiah(g.plan)}</p>
                  <ul className="mt-3 list-none space-y-3 p-0">
                    {g.list.length === 0 && <li className="text-xs text-gray-400">Belum ada kategori.</li>}
                    {g.list.map((i) => {
                      const pct = i.amount ? Math.round((i.used / i.amount) * 100) : 0;
                      return (
                        <li key={i.categoryId}>
                          <p className="flex items-center justify-between text-sm"><span className="truncate font-medium text-gray-800">{i.icon} {i.name}</span><span className={`text-xs font-semibold ${pct > 100 ? 'text-red-600' : 'text-gray-500'}`}>{pct}%</span></p>
                          <div className="mt-1 h-1.5 rounded-full bg-gray-100"><div className={`h-1.5 rounded-full ${pct > 100 ? 'bg-red-500' : g.bar}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
                          <p className="mt-1 text-xs text-gray-500">Sisa {rupiah(i.amount - i.used)}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-semibold text-gray-900">Insight</h2>
            <ul className="mt-3 list-none space-y-2 p-0 text-sm text-gray-700">
              {over.length > 0 ? <li>⚠️ {over.map((i) => i.name).join(', ')} sudah melewati batas anggaran.</li> : <li>✅ Semua kategori masih dalam batas anggaran.</li>}
              {hottest && hottest.used > 0 && <li>🔥 Paling cepat terpakai: {hottest.name} ({Math.round((hottest.used / (hottest.amount || 1)) * 100)}%).</li>}
              <li>💡 Sisa {rupiah(Math.max(0, left))} bisa kamu bagi rata sampai akhir bulan.</li>
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
