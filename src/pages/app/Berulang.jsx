import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarClock, Plus, RotateCw, Trash2 } from 'lucide-react';
import { Card, Confirm, Drawer, Label, MoneyInput, PageTitle, PrimaryButton, Segmented, Toggle, inputClass } from '../../components/ui.jsx';
import { findCategory, useStore } from '../../lib/store.jsx';
import { longDate, rupiah, today } from '../../lib/format.js';

const FREQUENCIES = [['daily', 'Harian'], ['weekly', 'Mingguan'], ['monthly', 'Bulanan']];
const freqLabel = (key) => FREQUENCIES.find(([k]) => k === key)?.[1] || 'Bulanan';

function RecurringForm({ item, onClose }) {
  const { categories, wallets, saveRecurring, notify } = useStore();
  const [type, setType] = useState(item?.type || 'expense');
  const [form, setForm] = useState({
    title: item?.title || '',
    amount: item?.amount || 0,
    categoryId: item?.categoryId || '',
    walletId: item?.walletId || wallets[0]?.id || '',
    frequency: item?.frequency || 'monthly',
    nextDate: item?.nextDate || today(),
  });
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const list = categories.filter((c) => c.type === type);
  return (
    <Drawer
      title={item ? 'Edit transaksi berulang' : 'Transaksi berulang baru'}
      onClose={onClose}
      footer={(
        <PrimaryButton
          className="min-h-[44px] w-full"
          disabled={!form.title.trim() || !form.amount || !form.categoryId || !form.walletId}
          onClick={() => {
            saveRecurring({ ...item, ...form, type, title: form.title.trim(), active: item ? item.active !== false : true });
            notify(item ? 'Transaksi berulang diperbarui.' : 'Transaksi berulang dibuat.');
            onClose();
          }}
        >
          {item ? 'Simpan Perubahan' : 'Simpan'}
        </PrimaryButton>
      )}
    >
      <Segmented options={[['expense', 'Pengeluaran'], ['income', 'Pemasukan']]} value={type} onChange={(next) => { setType(next); set('categoryId', ''); }} />
      <div className="mt-5 space-y-5">
        <div><Label htmlFor="rec-title">Nama</Label><input id="rec-title" className={inputClass} placeholder="Internet rumah, gaji, sewa…" value={form.title} onChange={(e) => set('title', e.target.value)} /></div>
        <div><Label htmlFor="rec-amount">Nominal</Label><MoneyInput id="rec-amount" value={form.amount} onChange={(v) => set('amount', v)} autoFocus /></div>
        <div>
          <Label htmlFor="rec-category">Kategori</Label>
          <select id="rec-category" className={inputClass} value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            <option value="">— Pilih —</option>
            {list.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="rec-wallet">Dompet</Label>
          <select id="rec-wallet" className={inputClass} value={form.walletId} onChange={(e) => set('walletId', e.target.value)}>
            {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor="rec-freq">Ulangi</Label>
          <select id="rec-freq" className={inputClass} value={form.frequency} onChange={(e) => set('frequency', e.target.value)}>
            {FREQUENCIES.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
          </select>
        </div>
        <div><Label htmlFor="rec-next">Dicatat berikutnya</Label><input id="rec-next" type="date" className={inputClass} value={form.nextDate} onChange={(e) => set('nextDate', e.target.value)} /></div>
        <p className="text-xs leading-5 text-gray-500">Saat aplikasi dibuka pada atau setelah tanggal ini, transaksi otomatis dibuat. Tanggal berikutnya menyesuaikan frekuensi.</p>
      </div>
    </Drawer>
  );
}

export default function Berulang() {
  const { recurring, wallets, categories, saveRecurring, deleteRecurring, postRecurringNow, notify } = useStore();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const walletName = (id) => wallets.find((w) => w.id === id)?.name || '—';

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/akun" className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Akun</Link>
      <PageTitle
        title="Transaksi berulang"
        subtitle="Tagihan dan pemasukan rutin dicatat otomatis saat jatuh tempo."
        right={<PrimaryButton onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Tambah</PrimaryButton>}
      />

      {recurring.length === 0 ? (
        <Card className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700"><CalendarClock className="h-7 w-7" /></span>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Belum ada transaksi berulang</h2>
          <p className="mx-auto mt-1 max-w-[420px] text-sm text-gray-600">Tambahkan langganan, cicilan, atau gaji bulanan supaya tidak perlu diingat.</p>
          <PrimaryButton className="mt-5" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Tambah transaksi berulang</PrimaryButton>
        </Card>
      ) : (
        <ul className="list-none divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-sm">
          {recurring.map((item) => {
            const category = findCategory(categories, item.categoryId);
            const active = item.active !== false;
            return (
              <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-lg" aria-hidden="true">{category.icon}</span>
                <button type="button" onClick={() => setEditing(item)} className="min-w-0 flex-1 text-left">
                  <b className="block truncate text-sm font-semibold text-gray-900">{item.title}</b>
                  <span className="block truncate text-xs text-gray-500">
                    {category.name} · {walletName(item.walletId)} · {freqLabel(item.frequency)}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {active ? `Berikutnya ${longDate(item.nextDate)}` : 'Dijeda'}
                  </span>
                </button>
                <div className="text-right">
                  <b className={`block text-sm font-bold ${item.type === 'income' ? 'text-green-700' : 'text-gray-900'}`}>{item.type === 'income' ? '+' : '−'}{rupiah(item.amount)}</b>
                  <span className="text-[11px] font-semibold text-gray-400">{active ? 'Aktif' : 'Nonaktif'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Toggle label={`Aktifkan ${item.title}`} checked={active} onChange={(v) => saveRecurring({ ...item, active: v })} />
                  <button type="button" aria-label={`Catat ${item.title} sekarang`} title="Catat sekarang" onClick={() => { postRecurringNow(item.id); notify('Transaksi dicatat.'); }} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><RotateCw className="h-4 w-4" /></button>
                  <button type="button" aria-label={`Hapus ${item.title}`} onClick={() => setRemoving(item)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && <RecurringForm item={editing.id ? editing : null} onClose={() => setEditing(null)} />}
      {removing && <Confirm title={`Hapus ${removing.title}?`} text="Transaksi yang sudah tercatat tetap ada." onCancel={() => setRemoving(null)} onConfirm={() => { deleteRecurring(removing.id); notify('Transaksi berulang dihapus.'); setRemoving(null); }} />}
    </div>
  );
}
