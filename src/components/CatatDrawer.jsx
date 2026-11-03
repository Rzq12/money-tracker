import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, MessageCircle, Search, Trash2 } from 'lucide-react';
import { CategoryIcon, Confirm, Drawer, Label, MoneyInput, PrimaryButton, Segmented, Toggle, inputClass } from './ui.jsx';
import { findCategory, useStore, walletBalance } from '../lib/store.jsx';
import { rupiah, today } from '../lib/format.js';

const TYPES = [['expense', 'Pengeluaran'], ['income', 'Pemasukan'], ['transfer', 'Transfer']];

function CategoryGrid({ type, onPick }) {
  const { categories } = useStore();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const list = useMemo(() => {
    const own = categories.filter((c) => c.type === type);
    const q = query.trim().toLowerCase();
    if (!q) return own;
    return own.filter((c) => c.name.toLowerCase().includes(q) || c.children.some((x) => x.name.toLowerCase().includes(q)));
  }, [categories, type, query]);

  return (
    <>
      <div className="mt-5 flex min-h-[50px] items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4">
        <Search className="h-[18px] w-[18px] text-gray-500" />
        <input aria-label="Cari kategori" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kategori" className="w-full bg-transparent text-[15px] placeholder:text-gray-500 focus:outline-none" />
      </div>
      <p className="mt-6 mb-2 text-xs font-semibold tracking-wide text-gray-600">SEMUA KATEGORI</p>
      {list.length === 0 && <p className="py-6 text-center text-sm text-gray-500">Tidak ada kategori yang cocok.</p>}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {list.map((c) => (
          <div key={c.id} className="contents">
            <div className={`relative rounded-xl border ${open === c.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
              <button type="button" onClick={() => onPick(c.id)} className="flex min-h-[96px] w-full flex-col items-center justify-center gap-1.5 p-2 text-center text-sm font-semibold text-gray-900">
                <span className="text-[26px] leading-8" aria-hidden="true">{c.icon}</span>
                {c.name}
              </button>
              {c.children.length > 0 && (
                <button type="button" aria-label={`Lihat sub-kategori ${c.name}`} aria-expanded={open === c.id} onClick={() => setOpen(open === c.id ? null : c.id)} className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100">
                  <ChevronDown className={`h-4 w-4 transition-transform ${open === c.id ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
            {open === c.id && (
              <div className="col-span-full flex flex-wrap gap-2 rounded-xl bg-gray-50 p-3">
                {c.children.map((x) => (
                  <button key={x.id} type="button" onClick={() => onPick(x.id)} className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:border-blue-300">
                    {x.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default function CatatDrawer() {
  const { catat, closeCatat, categories, wallets, transactions, saveTransaction, deleteTransaction, notify, features } = useStore();
  const navigate = useNavigate();
  const editing = Boolean(catat.id);
  const [type, setType] = useState(catat.type || 'expense');
  const [step, setStep] = useState(editing || catat.type === 'transfer' ? 'form' : 'category');
  const [form, setForm] = useState({
    amount: catat.amount || 0,
    note: catat.note || '',
    categoryId: catat.categoryId || '',
    date: catat.date || today(),
    walletId: catat.walletId || wallets[0]?.id || '',
    toWalletId: catat.toWalletId || '',
    excluded: Boolean(catat.excluded),
  });
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const changeType = (next) => {
    setType(next);
    setError('');
    setForm((f) => ({ ...f, categoryId: '' }));
    setStep(next === 'transfer' ? 'form' : 'category');
  };

  const wallet = wallets.find((w) => w.id === form.walletId);
  const balance = wallet ? walletBalance(wallet, transactions.filter((t) => t.id !== catat.id)) : 0;
  const after = balance + (type === 'income' ? form.amount : -form.amount);

  const save = () => {
    if (!form.amount) return setError('Nominal belum diisi.');
    if (!form.walletId) return setError(type === 'transfer' ? 'Pilih dompet asal.' : 'Pilih dompet dulu.');
    if (type === 'transfer') {
      if (!form.toWalletId) return setError('Pilih dompet tujuan.');
      if (form.toWalletId === form.walletId) return setError('Pilih dompet lain sebagai tujuan.');
    } else if (!form.categoryId) {
      return setError('Pilih kategori dulu.');
    }
    saveTransaction({ ...form, id: catat.id, type, categoryId: type === 'transfer' ? 'transfer' : form.categoryId });
    notify(editing ? 'Transaksi diperbarui.' : 'Transaksi tersimpan.');
    closeCatat();
    return undefined;
  };

  const category = form.categoryId ? findCategory(categories, form.categoryId) : null;

  return (
    <Drawer
      title={editing ? 'Detail transaksi' : 'Catat transaksi'}
      onClose={closeCatat}
      width="md:w-[560px]"
      footer={step === 'form' ? (
        <div className="flex gap-3">
          {editing && (
            <button type="button" aria-label="Hapus transaksi" onClick={() => setConfirming(true)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50">
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <PrimaryButton className="min-h-[44px] flex-1" onClick={save}>{editing ? 'Simpan Perubahan' : 'Simpan'}</PrimaryButton>
        </div>
      ) : null}
    >
      <Segmented options={TYPES} value={type} onChange={changeType} />

      {step === 'category' && type !== 'transfer' && (
        <>
          {features.chat && !editing && (
            <button type="button" onClick={() => { closeCatat(); navigate('/chat'); }} className="mt-5 flex min-h-[66px] w-full items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-700"><MessageCircle className="h-5 w-5" /></span>
              <span className="flex-1">
                <b className="block text-sm font-semibold text-gray-900">Catat lewat chat</b>
                <span className="text-sm text-gray-700">Ketik saja, misalnya “kopi 25rb pakai Tunai”</span>
              </span>
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          )}
          <CategoryGrid type={type} onPick={(id) => { set('categoryId', id); setError(''); setStep('form'); }} />
        </>
      )}

      {step === 'form' && (
        <div className="mt-5 space-y-5">
          {type !== 'transfer' && (
            <div>
              <Label>Kategori</Label>
              <button type="button" onClick={() => setStep('category')} className="flex min-h-[56px] w-full items-center gap-3 rounded-xl border border-gray-200 px-3 text-left hover:bg-gray-50">
                {category ? <CategoryIcon icon={category.icon} /> : <ArrowLeft className="h-5 w-5 text-gray-400" />}
                <span className="flex-1 text-sm font-semibold text-gray-900">{category ? category.name : 'Pilih Kategori'}</span>
                <span className="text-sm font-semibold text-blue-700">Ubah</span>
              </button>
            </div>
          )}
          <div>
            <Label htmlFor="tx-amount">Nominal</Label>
            <MoneyInput id="tx-amount" large value={form.amount} onChange={(v) => set('amount', v)} autoFocus={!editing} />
          </div>
          <div>
            <Label htmlFor="tx-note">Catatan <span className="font-normal normal-case">(opsional)</span></Label>
            <input id="tx-note" className={inputClass} placeholder="Deskripsi singkat..." value={form.note} onChange={(e) => set('note', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tx-date">Tanggal</Label>
            <input id="tx-date" type="date" className={inputClass} value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
          <div>
            <Label htmlFor="tx-wallet">{type === 'transfer' ? 'Dompet Asal' : 'Dompet / Rekening'}</Label>
            <select id="tx-wallet" className={inputClass} value={form.walletId} onChange={(e) => set('walletId', e.target.value)}>
              <option value="">-- Pilih Dompet --</option>
              {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          {type === 'transfer' && (
            <div>
              <Label htmlFor="tx-to">Dompet Tujuan</Label>
              <select id="tx-to" className={inputClass} value={form.toWalletId} onChange={(e) => set('toWalletId', e.target.value)}>
                <option value="">-- Pilih --</option>
                {wallets.filter((w) => w.id !== form.walletId).map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          )}
          {wallet && (
            <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-600">
              <p className="flex justify-between"><span>Saldo saat ini</span><b className="text-gray-900">{rupiah(balance)}</b></p>
              <p className="mt-1 flex justify-between"><span>Setelah transaksi</span><b className={after < 0 ? 'text-red-600' : 'text-gray-900'}>{rupiah(after)}</b></p>
            </div>
          )}
          {type !== 'transfer' && (
            <div className="flex items-center justify-between gap-3">
              <span><b className="block text-sm font-semibold text-gray-900">Exclude dari perhitungan</b><span className="text-xs text-gray-500">Tidak dihitung di laporan &amp; anggaran</span></span>
              <Toggle label="Exclude dari perhitungan" checked={form.excluded} onChange={(v) => set('excluded', v)} />
            </div>
          )}
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        </div>
      )}

      {confirming && (
        <Confirm
          title="Hapus transaksi ini?"
          text="Saldo dompet akan dihitung ulang."
          onCancel={() => setConfirming(false)}
          onConfirm={() => { deleteTransaction(catat.id); notify('Transaksi dihapus.'); closeCatat(); }}
        />
      )}
    </Drawer>
  );
}
