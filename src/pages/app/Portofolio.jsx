import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LineChart, Plus, Trash2 } from 'lucide-react';
import { Card, Confirm, Drawer, Label, MoneyInput, PageTitle, PrimaryButton, inputClass } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { groupDecimal, rupiah } from '../../lib/format.js';

const KINDS = ['Saham', 'Reksadana', 'Emas', 'Kripto', 'Deposito', 'Obligasi', 'Lainnya'];
const money = (n) => rupiah(Math.round(Number(n) || 0));
const pct = (n) => `${Number(n) >= 0 ? '+' : ''}${Number(n).toFixed(1)}%`;

const DecimalInput = ({ id, value, onChange, autoFocus }) => (
  <div className="flex min-h-[46px] items-center rounded-xl border border-gray-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
    <input
      id={id}
      inputMode="decimal"
      autoFocus={autoFocus}
      className="w-full min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
      placeholder="0"
      value={groupDecimal(value)}
      onChange={(e) => {
        const clean = String(e.target.value).replace(/\./g, '').replace(/[^\d,]/g, '').replace(/,/g, '.');
        const next = Number(clean);
        onChange(Number.isFinite(next) ? next : 0);
      }}
    />
  </div>
);

function HoldingForm({ holding, onClose }) {
  const { saveHolding, notify } = useStore();
  const [form, setForm] = useState({
    name: holding?.name || '',
    kind: holding?.kind || 'Reksadana',
    units: holding?.units ?? 0,
    buyPrice: holding?.buyPrice || 0,
    currentPrice: holding?.currentPrice || 0,
    note: holding?.note || '',
  });
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  return (
    <Drawer
      title={holding ? 'Edit aset' : 'Tambah aset'}
      onClose={onClose}
      footer={(
        <PrimaryButton
          className="min-h-[44px] w-full"
          disabled={!form.name.trim() || !form.units}
          onClick={() => {
            saveHolding({ ...holding, ...form, name: form.name.trim() });
            notify(holding ? 'Aset diperbarui.' : 'Aset ditambahkan.');
            onClose();
          }}
        >
          {holding ? 'Simpan Perubahan' : 'Simpan'}
        </PrimaryButton>
      )}
    >
      <div className="space-y-5">
        <div><Label htmlFor="hold-name">Nama aset</Label><input id="hold-name" className={inputClass} placeholder="BBCA, Emas Antam, Reksadana Indeks…" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div>
          <Label htmlFor="hold-kind">Jenis</Label>
          <select id="hold-kind" className={inputClass} value={form.kind} onChange={(e) => set('kind', e.target.value)}>
            {KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div><Label htmlFor="hold-units">Jumlah unit / lembar</Label><DecimalInput id="hold-units" value={form.units} onChange={(v) => set('units', v)} /></div>
        <div><Label htmlFor="hold-buy">Harga beli per unit</Label><MoneyInput id="hold-buy" value={form.buyPrice} onChange={(v) => set('buyPrice', v)} /></div>
        <div><Label htmlFor="hold-now">Harga sekarang per unit</Label><MoneyInput id="hold-now" value={form.currentPrice} onChange={(v) => set('currentPrice', v)} /></div>
        <div><Label htmlFor="hold-note">Catatan <span className="font-normal normal-case">(opsional)</span></Label><textarea id="hold-note" rows={2} className={inputClass} value={form.note} onChange={(e) => set('note', e.target.value)} /></div>
        <p className="text-xs text-gray-500">Nilai dihitung dari jumlah unit × harga sekarang. Catat biaya beli untuk melihat untung/rugi.</p>
      </div>
    </Drawer>
  );
}

export default function Portofolio() {
  const { holdings, deleteHolding, notify } = useStore();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const rows = useMemo(() => holdings.map((h) => {
    const value = (Number(h.units) || 0) * (Number(h.currentPrice) || 0);
    const cost = (Number(h.units) || 0) * (Number(h.buyPrice) || 0);
    const pnl = value - cost;
    return { holding: h, value, cost, pnl, pnlPct: cost > 0 ? (pnl / cost) * 100 : 0 };
  }), [holdings]);

  const totals = rows.reduce((acc, r) => ({ value: acc.value + r.value, cost: acc.cost + r.cost }), { value: 0, cost: 0 });
  const totalPnl = totals.value - totals.cost;
  const byKind = rows.reduce((acc, r) => {
    acc[r.holding.kind] = (acc[r.holding.kind] || 0) + r.value;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/akun" className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Akun</Link>
      <PageTitle
        title="Portofolio"
        subtitle="Nilai aset investasimu, dihitung dari harga yang kamu masukkan sendiri."
        right={<PrimaryButton onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Tambah Aset</PrimaryButton>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <Card className="!p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nilai sekarang</p>
          <b className="mt-1 block text-2xl font-bold text-gray-900">{money(totals.value)}</b>
        </Card>
        <Card className="!p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Modal</p>
          <b className="mt-1 block text-2xl font-bold text-gray-900">{money(totals.cost)}</b>
        </Card>
        <Card className="!p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Untung / rugi</p>
          <b className={`mt-1 block text-2xl font-bold ${totalPnl >= 0 ? 'text-green-700' : 'text-red-600'}`}>{money(totalPnl)}</b>
          {totals.cost > 0 && <span className={`text-xs font-semibold ${totalPnl >= 0 ? 'text-green-700' : 'text-red-600'}`}>{pct((totalPnl / totals.cost) * 100)}</span>}
        </Card>
      </div>

      {rows.length === 0 ? (
        <Card className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700"><LineChart className="h-7 w-7" /></span>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Belum ada aset</h2>
          <p className="mx-auto mt-1 max-w-[420px] text-sm text-gray-600">Tambahkan saham, reksadana, emas, atau aset lain untuk memantau nilainya.</p>
          <PrimaryButton className="mt-5" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Tambah aset</PrimaryButton>
        </Card>
      ) : (
        <>
          <Card className="mb-4">
            <h2 className="text-sm font-bold text-gray-900">Komposisi</h2>
            <div className="mt-3 space-y-2">
              {Object.entries(byKind).sort((a, b) => b[1] - a[1]).map(([kind, value]) => (
                <div key={kind}>
                  <div className="flex justify-between text-xs text-gray-600"><span>{kind}</span><b className="text-gray-900">{money(value)}</b></div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${totals.value > 0 ? (value / totals.value) * 100 : 0}%` }} /></div>
                </div>
              ))}
            </div>
          </Card>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <ul className="list-none divide-y divide-gray-100 p-0">
              {rows.map(({ holding, value, pnl, pnlPct }) => (
                <li key={holding.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                  <button type="button" onClick={() => setEditing(holding)} className="min-w-0 flex-1 text-left">
                    <b className="block truncate text-sm font-semibold text-gray-900">{holding.name}</b>
                    <span className="text-xs text-gray-500">{holding.kind} · {groupDecimal(holding.units)} unit · beli {money(holding.buyPrice)}</span>
                  </button>
                  <div className="text-right">
                    <b className="block text-sm font-bold text-gray-900">{money(value)}</b>
                    <span className={`text-xs font-semibold ${pnl >= 0 ? 'text-green-700' : 'text-red-600'}`}>{money(pnl)} ({pct(pnlPct)})</span>
                  </div>
                  <button type="button" aria-label={`Hapus ${holding.name}`} onClick={() => setRemoving(holding)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {editing && <HoldingForm holding={editing.id ? editing : null} onClose={() => setEditing(null)} />}
      {removing && <Confirm title={`Hapus ${removing.name}?`} text="Data aset ini akan dihapus dari portofolio." onCancel={() => setRemoving(null)} onConfirm={() => { deleteHolding(removing.id); notify('Aset dihapus.'); setRemoving(null); }} />}
    </div>
  );
}
