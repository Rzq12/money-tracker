import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Plus, Target, Trash2 } from 'lucide-react';
import { Card, Confirm, Drawer, Label, MoneyInput, PageTitle, PrimaryButton, inputClass } from '../../components/ui.jsx';
import { goalSaved, useStore, walletBalance } from '../../lib/store.jsx';
import { addDays, longDate, rupiah, today } from '../../lib/format.js';

const percent = (saved, target) => (target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0);
const daysLeft = (deadline) => {
  if (!deadline) return null;
  const diff = Math.round((new Date(`${deadline}T00:00:00`) - new Date(`${today()}T00:00:00`)) / 86400000);
  return diff;
};

function GoalForm({ goal, onClose }) {
  const { wallets, saveGoal, notify } = useStore();
  const [form, setForm] = useState({
    name: goal?.name || '',
    target: goal?.target || 0,
    walletId: goal?.walletId || wallets[0]?.id || '',
    deadline: goal?.deadline || addDays(today(), 180),
    note: goal?.note || '',
  });
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  return (
    <Drawer
      title={goal ? 'Edit tujuan' : 'Tujuan keuangan baru'}
      onClose={onClose}
      footer={(
        <PrimaryButton
          className="min-h-[44px] w-full"
          disabled={!form.name.trim() || !form.target}
          onClick={() => {
            saveGoal({ ...goal, ...form, name: form.name.trim() });
            notify(goal ? 'Tujuan diperbarui.' : 'Tujuan dibuat.');
            onClose();
          }}
        >
          {goal ? 'Simpan Perubahan' : 'Buat Tujuan'}
        </PrimaryButton>
      )}
    >
      <div className="space-y-5">
        <div><Label htmlFor="goal-name">Nama tujuan</Label><input id="goal-name" className={inputClass} placeholder="Dana darurat, liburan, DP rumah…" value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div><Label htmlFor="goal-target">Target dana</Label><MoneyInput id="goal-target" value={form.target} onChange={(v) => set('target', v)} autoFocus /></div>
        <div>
          <Label htmlFor="goal-wallet">Dompet penampung</Label>
          <select id="goal-wallet" className={inputClass} value={form.walletId} onChange={(e) => set('walletId', e.target.value)}>
            <option value="">— Tanpa dompet —</option>
            {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          <p className="mt-1.5 text-xs text-gray-500">Setiap dana yang kamu tambahkan dipindahkan ke dompet ini.</p>
        </div>
        <div><Label htmlFor="goal-deadline">Target tanggal</Label><input id="goal-deadline" type="date" className={inputClass} value={form.deadline} onChange={(e) => set('deadline', e.target.value)} /></div>
        <div><Label htmlFor="goal-note">Catatan <span className="font-normal normal-case">(opsional)</span></Label><textarea id="goal-note" rows={3} className={inputClass} value={form.note} onChange={(e) => set('note', e.target.value)} /></div>
      </div>
    </Drawer>
  );
}

function ContributeForm({ goal, onClose }) {
  const { wallets, transactions, addGoalContribution, notify } = useStore();
  const options = wallets.filter((w) => w.id !== goal.walletId);
  const [walletId, setWalletId] = useState(options[0]?.id || '');
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(today());
  const [error, setError] = useState('');
  const wallet = options.find((w) => w.id === walletId);
  return (
    <Drawer
      title={`Tambah dana · ${goal.name}`}
      onClose={onClose}
      footer={(
        <PrimaryButton
          className="min-h-[44px] w-full"
          disabled={!walletId || !amount}
          onClick={() => {
            if (!goal.walletId) { setError('Dompet tujuan belum diatur untuk tujuan ini.'); return; }
            if (!walletId || !amount) { setError('Pilih dompet sumber dan isi nominal.'); return; }
            if (walletId === goal.walletId) { setError('Dompet sumber harus berbeda dari dompet tujuan.'); return; }
            addGoalContribution(goal.id, { walletId, amount, date });
            notify('Dana tujuan ditambahkan.');
            onClose();
          }}
        >
          Pindahkan dana
        </PrimaryButton>
      )}
    >
      {!goal.walletId ? (
        <p className="text-sm text-gray-600">Atur dompet penampung dulu di pengaturan tujuan.</p>
      ) : (
        <div className="space-y-5">
          <div>
            <Label htmlFor="contrib-from">Dari dompet</Label>
            <select id="contrib-from" className={inputClass} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
              {options.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
            {wallet && <p className="mt-1.5 text-xs text-gray-500">Saldo: {rupiah(walletBalance(wallet, transactions))}</p>}
          </div>
          <div><Label htmlFor="contrib-amount">Nominal</Label><MoneyInput id="contrib-amount" value={amount} onChange={setAmount} autoFocus /></div>
          <div><Label htmlFor="contrib-date">Tanggal</Label><input id="contrib-date" type="date" className={inputClass} value={date} onChange={(e) => setDate(e.target.value)} /></div>
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        </div>
      )}
    </Drawer>
  );
}

export default function Tujuan() {
  const { goals, transactions, deleteGoal, notify } = useStore();
  const [editing, setEditing] = useState(null);
  const [contributing, setContributing] = useState(null);
  const [removing, setRemoving] = useState(null);

  const rows = useMemo(() => goals.map((goal) => {
    const saved = goalSaved(goal, transactions);
    const left = daysLeft(goal.deadline);
    return { goal, saved, pct: percent(saved, goal.target), left };
  }), [goals, transactions]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/akun" className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Akun</Link>
      <PageTitle
        title="Tujuan keuangan"
        subtitle="Pisahkan dana untuk hal yang kamu rencanakan. Uangnya benar-benar pindah dompet."
        right={<PrimaryButton onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Tujuan Baru</PrimaryButton>}
      />

      {rows.length === 0 ? (
        <Card className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700"><Target className="h-7 w-7" /></span>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Belum ada tujuan</h2>
          <p className="mx-auto mt-1 max-w-[420px] text-sm text-gray-600">Buat target pertama, misalnya dana darurat enam bulan biaya hidup.</p>
          <PrimaryButton className="mt-5" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Buat tujuan</PrimaryButton>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map(({ goal, saved, pct, left }) => (
            <Card key={goal.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-gray-900">{goal.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {goal.deadline ? longDate(goal.deadline) : 'Tanpa tenggat'}
                    {left !== null && <span className={left < 0 ? 'text-red-600' : 'text-gray-500'}>({left < 0 ? `lewat ${Math.abs(left)} hari` : `${left} hari lagi`})</span>}
                  </p>
                </div>
                <button type="button" aria-label={`Edit ${goal.name}`} onClick={() => setEditing(goal)} className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50">Edit</button>
              </div>

              <div className="mt-5">
                <div className="flex items-end justify-between gap-3">
                  <b className="text-xl font-bold text-gray-900">{rupiah(saved)}</b>
                  <span className="text-sm text-gray-500">dari {rupiah(goal.target)}</span>
                </div>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-gray-100">
                  <div className={`h-full rounded-full ${pct >= 100 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1.5 text-xs font-semibold text-gray-600">{pct}% tercapai{pct >= 100 ? ' · sudah penuh!' : ''}</p>
              </div>

              {goal.note && <p className="mt-3 text-sm leading-5 text-gray-600">{goal.note}</p>}

              <div className="mt-auto flex flex-wrap gap-2 pt-5">
                <PrimaryButton onClick={() => setContributing(goal)} disabled={!goal.walletId}>Tambah dana</PrimaryButton>
                <button type="button" onClick={() => setRemoving(goal)} className="inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Hapus</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && <GoalForm goal={editing.id ? editing : null} onClose={() => setEditing(null)} />}
      {contributing && <ContributeForm goal={contributing} onClose={() => setContributing(null)} />}
      {removing && (
        <Confirm
          title={`Hapus tujuan ${removing.name}?`}
          text="Catatan setoran yang sudah dibuat tetap ada di transaksi. Hanya targetnya yang dihapus."
          onCancel={() => setRemoving(null)}
          onConfirm={() => { deleteGoal(removing.id); notify('Tujuan dihapus.'); setRemoving(null); }}
        />
      )}
    </div>
  );
}
