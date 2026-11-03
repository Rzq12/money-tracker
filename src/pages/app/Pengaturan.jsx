import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, ChevronDown, Pencil, Plus, RotateCcw, Tag, Trash2, Wallet, Coins } from 'lucide-react';
import { CategoryIcon, Confirm, Drawer, Label, MoneyInput, PrimaryButton, Segmented, WalletAvatar, inputClass } from '../../components/ui.jsx';
import { useStore, walletBalance } from '../../lib/store.jsx';
import { GROUPS } from '../../lib/seed.js';
import { decimal, groupDecimal, rupiah } from '../../lib/format.js';
import { CURRENCIES, currencySymbol, formatMoney, fromIdr, toIdr } from '../../lib/money.js';

const TABS = [['kategori', 'Kategori', Tag], ['dompet', 'Dompet', Wallet], ['mata-uang', 'Kurs', Coins], ['tanggal', 'Tanggal Awal Bulan', Calendar], ['reset', 'Reset Data', RotateCcw]];
const WALLET_TYPES = ['Tabungan', 'Tunai', 'E-wallet', 'Paylater', 'Kartu kredit', 'P2P lending'];
const COLORS = ['#01478a', '#0288d1', '#29b6f6', '#4caf50', '#f59e0b', '#ef4444', '#a855f7'];

function WalletForm({ wallet, onClose }) {
  const { saveWallet, notify, rates } = useStore();
  const [name, setName] = useState(wallet?.name || '');
  const [currency, setCurrency] = useState(wallet?.currency || 'IDR');
  const [initial, setInitial] = useState(() => {
    if (!wallet) return 0;
    return (wallet.currency || 'IDR') === 'IDR' ? wallet.initial : fromIdr(wallet.initial, wallet.currency, rates);
  });
  const [type, setType] = useState(wallet?.type || 'Tabungan');
  const [color, setColor] = useState(wallet?.color || COLORS[1]);

  const changeCurrency = (code) => {
    const idr = toIdr(initial, currency, rates);
    setInitial(code === 'IDR' ? Math.round(idr) : fromIdr(idr, code, rates));
    setCurrency(code);
  };

  return (
    <Drawer
      title={wallet ? 'Edit Dompet' : 'Tambah Dompet Baru'}
      onClose={onClose}
      footer={<PrimaryButton className="min-h-[44px] w-full" disabled={!name.trim()} onClick={() => {
        const value = currency === 'IDR' ? Math.round(initial) : toIdr(initial, currency, rates);
        saveWallet({ ...wallet, name: name.trim(), initial: value, type, color, currency });
        notify(wallet ? 'Dompet diperbarui.' : 'Dompet dibuat.');
        onClose();
      }}>{wallet ? 'Simpan Perubahan' : 'Buat Dompet'}</PrimaryButton>}
    >
      <div className="space-y-6">
        <div>
          <Label>Ikon</Label>
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button type="button" key={c} aria-label={`Warna ikon ${c}`} aria-pressed={color === c} onClick={() => setColor(c)} className={`h-10 w-10 rounded-full ${color === c ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`} style={{ background: c }} />
            ))}
          </div>
        </div>
        <div><Label htmlFor="w-name">Nama Dompet</Label><input id="w-name" className={inputClass} placeholder="Contoh: Bank Tabungan" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div>
          <Label htmlFor="w-currency">Mata uang dompet</Label>
          <select id="w-currency" className={inputClass} value={currency} onChange={(e) => changeCurrency(e.target.value)}>
            {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.label}</option>)}
          </select>
          {currency !== 'IDR' && <p className="mt-1.5 text-xs text-gray-500">1 {currency} = {rupiah(rates[currency])}. Semua transaksi tetap disimpan dalam rupiah.</p>}
        </div>
        <div>
          <Label htmlFor="w-initial">Saldo Awal ({currency})</Label>
          {currency === 'IDR' ? (
            <MoneyInput id="w-initial" value={initial} onChange={setInitial} />
          ) : (
            <div className="flex min-h-[46px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <span className="text-sm font-semibold text-gray-500">{currencySymbol(currency)}</span>
              <input
                id="w-initial"
                inputMode="decimal"
                className="w-full min-w-0 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                placeholder="0"
                value={groupDecimal(initial)}
                onChange={(e) => setInitial(decimal(e.target.value))}
              />
            </div>
          )}
          {currency !== 'IDR' && <p className="mt-1.5 text-xs text-gray-500">≈ {rupiah(toIdr(initial, currency, rates))}</p>}
        </div>
        <div>
          <Label>Tipe Dompet</Label>
          <div className="flex flex-wrap gap-2">
            {WALLET_TYPES.map((t) => (
              <button type="button" key={t} aria-pressed={type === t} onClick={() => setType(t)} className={`min-h-[38px] rounded-xl border px-4 text-sm font-medium ${type === t ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function CategoryForm({ type, category, onClose }) {
  const { saveCategory, deleteCategory, categories, notify } = useStore();
  const isChild = category && !categories.some((c) => c.id === category.id);
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || '📌');
  const [parent, setParent] = useState('');
  const [group, setGroup] = useState(category?.group && category.group !== 'none' ? category.group : 'needs');
  const parents = categories.filter((c) => c.type === type);
  return (
    <Drawer
      title={category ? 'Edit Kategori' : 'Tambah Kategori'}
      onClose={onClose}
      footer={(
        <div className="flex gap-3">
          {category && <button type="button" onClick={() => { deleteCategory(category.id); notify('Kategori dihapus.'); onClose(); }} className="min-h-[44px] rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600">Hapus Kategori</button>}
          <PrimaryButton className="min-h-[44px] flex-1" disabled={!name.trim()} onClick={() => {
            saveCategory(category ? { ...category, name: name.trim(), icon, group: type === 'income' ? 'none' : group } : { name: name.trim(), icon, type, group: type === 'income' ? 'none' : group }, parent);
            notify('Kategori tersimpan.');
            onClose();
          }}>{category ? 'Simpan Perubahan' : 'Simpan'}</PrimaryButton>
        </div>
      )}
    >
      <div className="space-y-6">
        <div><Label htmlFor="c-name">Nama Kategori</Label><input id="c-name" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} /></div>
        {!isChild && <div><Label htmlFor="c-icon">Ikon (emoji)</Label><input id="c-icon" className={inputClass} value={icon} onChange={(e) => setIcon(e.target.value)} /></div>}
        {!category && (
          <div>
            <Label htmlFor="c-parent">Kategori Induk (opsional)</Label>
            <select id="c-parent" className={inputClass} value={parent} onChange={(e) => setParent(e.target.value)}>
              <option value="">Tidak ada (kategori utama)</option>
              {parents.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        {type === 'expense' && !isChild && !parent && (
          <div>
            <Label>Tipe Anggaran</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(GROUPS).map(([key, g]) => (
                <button type="button" key={key} aria-pressed={group === key} onClick={() => setGroup(key)} className={`min-h-[38px] rounded-xl border px-4 text-sm font-medium ${group === key ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700'}`}>{g.label}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}

function Dompet() {
  const { wallets, transactions, rates, deleteWallet, notify } = useStore();
  const [form, setForm] = useState(null);
  const [removing, setRemoving] = useState(null);
  const groups = [...new Set(wallets.map((w) => w.type))];
  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Semua Dompet</h2>
        <PrimaryButton onClick={() => setForm({})}><Plus className="h-4 w-4" /> Tambah Baru</PrimaryButton>
      </div>
      {wallets.length === 0 && <p className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500">Belum ada dompet.</p>}
      {groups.map((group) => (
        <section key={group} className="mb-4">
          <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-600">{group}</h3>
          <ul className="list-none divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white p-0 shadow-sm">
            {wallets.filter((w) => w.type === group).map((w) => (
              <li key={w.id} className="flex min-h-[68px] items-center gap-3 px-4">
                <button type="button" onClick={() => setForm(w)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <WalletAvatar wallet={w} />
                  <span className="truncate text-sm font-medium text-gray-900">{w.name}</span>
                  {w.currency && w.currency !== 'IDR' && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">{w.currency}</span>}
                </button>
                <span className="text-sm font-medium text-gray-900">{formatMoney(walletBalance(w, transactions), w.currency || 'IDR', rates)}</span>
                <button type="button" aria-label={`Hapus ${w.name}`} onClick={() => setRemoving(w)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><Trash2 className="h-4 w-4" /></button>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {form && <WalletForm wallet={form.id ? form : null} onClose={() => setForm(null)} />}
      {removing && <Confirm title={`Hapus ${removing.name}?`} text="Transaksi di dompet ini ikut terhapus." onCancel={() => setRemoving(null)} onConfirm={() => { deleteWallet(removing.id); notify('Dompet dihapus.'); setRemoving(null); }} />}
    </>
  );
}

function Kategori() {
  const { categories } = useStore();
  const [type, setType] = useState('expense');
  const [form, setForm] = useState(null);
  const [open, setOpen] = useState({});
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Segmented className="w-full max-w-[280px]" options={[['expense', 'Pengeluaran'], ['income', 'Pemasukan']]} value={type} onChange={setType} />
        <PrimaryButton onClick={() => setForm({})}><Plus className="h-4 w-4" /> Tambah Baru</PrimaryButton>
      </div>
      <ul className="list-none divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white p-0 shadow-sm">
        {categories.filter((c) => c.type === type).map((c) => (
          <li key={c.id}>
            <div className="flex min-h-[60px] items-center gap-3 px-4">
              <CategoryIcon icon={c.icon} />
              <span className="flex-1 text-sm font-medium text-gray-900">{c.name}</span>
              {c.children.length > 0 && (
                <button type="button" aria-label={`Lihat sub-kategori ${c.name}`} aria-expanded={Boolean(open[c.id])} onClick={() => setOpen({ ...open, [c.id]: !open[c.id] })} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><ChevronDown className={`h-4 w-4 transition-transform ${open[c.id] ? 'rotate-180' : ''}`} /></button>
              )}
              <button type="button" aria-label={`Edit ${c.name}`} onClick={() => setForm(c)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><Pencil className="h-4 w-4" /></button>
            </div>
            {open[c.id] && (
              <ul className="list-none bg-gray-50/60 p-0 pb-1 pl-[68px] pr-4">
                {c.children.map((x) => (
                  <li key={x.id} className="flex min-h-[44px] items-center justify-between text-sm text-gray-700">
                    {x.name}
                    <button type="button" aria-label={`Edit ${x.name}`} onClick={() => setForm(x)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><Pencil className="h-3.5 w-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      {form && <CategoryForm type={type} category={form.id ? form : null} onClose={() => setForm(null)} />}
    </>
  );
}

function MataUang() {
  const { rates, setRate, notify } = useStore();
  const changes = CURRENCIES.filter((c) => c.code !== 'IDR');
  return (
    <>
      <h2 className="text-lg font-bold text-gray-900">Kurs mata uang</h2>
      <p className="mt-1 max-w-[560px] text-sm text-gray-600">Nilai tukar dipakai saat mencatat transaksi di dompet dengan mata uang asing. Perbarui manual sesuai kurs yang kamu pakai.</p>
      <ul className="mt-5 list-none divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-sm">
        {changes.map((c) => (
          <li key={c.code} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-sm font-bold text-gray-700">{c.symbol}</span>
            <div className="min-w-0 flex-1">
              <b className="block text-sm font-semibold text-gray-900">{c.code} · {c.label}</b>
              <span className="text-xs text-gray-500">1 {c.code} = {rupiah(rates[c.code])}</span>
            </div>
            <div className="w-40">
              <MoneyInput
                id={`rate-${c.code}`}
                value={Math.round(rates[c.code] || 0)}
                onChange={(v) => setRate(c.code, v)}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        <PrimaryButton onClick={() => notify('Kurs disimpan otomatis saat diubah.')}>Simpan</PrimaryButton>
        <span className="self-center text-xs text-gray-500">IDR selalu 1.</span>
      </div>
    </>
  );
}

function Tanggal() {
  const { startDay, setStartDay, notify } = useStore();
  const [day, setDay] = useState(startDay);
  return (
    <>
      <h2 className="text-lg font-bold text-gray-900">Tanggal Awal Bulan</h2>
      <p className="mt-1 max-w-[560px] text-sm text-gray-600">Atur tanggal mulai periode pencatatan bulanan. Pengaturan ini mempengaruhi perhitungan Laporan &amp; Anggaran kamu.</p>
      <div className="mt-5 max-w-[460px] rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setDay(1)} className={`min-h-[34px] rounded-full border px-3 text-xs font-semibold ${day === 1 ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>Tanggal 1</button>
          <button type="button" onClick={() => setDay(31)} className={`min-h-[34px] rounded-full border px-3 text-xs font-semibold ${day === 31 ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>Akhir bulan</button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
            <button type="button" key={d} aria-pressed={day === d} onClick={() => setDay(d)} className={`h-10 rounded-lg text-sm font-medium ${day === d ? 'bg-blue-700 text-white' : 'text-gray-700 hover:bg-gray-100'}`}>{d}</button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-gray-500">Tanggal 29–31 dipakai sebagai akhir bulan di bulan yang lebih pendek.</p>
        <PrimaryButton className="mt-4 min-h-[44px] w-full" onClick={() => { setStartDay(day); notify(`Awal bulan: ${day >= 28 ? 'akhir bulan' : `tanggal ${day}`}.`); }}>Simpan</PrimaryButton>
      </div>
    </>
  );
}

function Reset() {
  const { transactions, contacts, integrations, goals, holdings, recurring, rules, splits, resetData, restoreSample, notify } = useStore();
  const [confirm, setConfirm] = useState(false);
  const rows = [
    ['Transaksi', transactions.length],
    ['Catatan hutang piutang', contacts.length],
    ['Tujuan keuangan', goals.length],
    ['Aset portofolio', holdings.length],
    ['Transaksi berulang', recurring.length],
    ['Aturan otomatis', rules.length],
    ['Split bill', splits.length],
    ['Integrasi', Object.values(integrations).filter(Boolean).length],
  ];
  return (
    <>
      <h2 className="text-lg font-bold text-gray-900">Reset Data</h2>
      <p className="mt-1 text-sm text-gray-600">Hapus semua data transaksi dan integrasimu. Akun, dompet, dan kategorimu tetap aman.</p>
      <ul className="mt-5 max-w-[520px] list-none divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white p-0 shadow-sm">
        {rows.map(([name, n]) => <li key={name} className="flex min-h-[52px] items-center justify-between px-4 text-sm text-gray-800">{name}<b>{n}</b></li>)}
      </ul>
      <p className="mt-3 text-xs text-gray-500">Dompet dan kategori tidak ikut terhapus. Unduh backup dulu di menu Backup.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={() => setConfirm(true)} className="min-h-[44px] rounded-xl bg-red-600 px-5 text-sm font-semibold text-white hover:bg-red-700">Reset Semua Data</button>
        <button type="button" onClick={() => { restoreSample(); notify('Data contoh dipulihkan.'); }} className="min-h-[44px] rounded-xl border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 hover:bg-gray-50">Isi dengan data contoh</button>
      </div>
      {confirm && <Confirm title="Reset semua data?" text="Semua transaksi, anggaran, tujuan, aset, dan catatan hutang di browser ini akan dihapus." confirmLabel="Reset" onCancel={() => setConfirm(false)} onConfirm={() => { resetData(); notify('Data sudah direset.'); setConfirm(false); }} />}
    </>
  );
}

export default function Pengaturan() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'kategori';
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-[224px_minmax(0,1fr)] md:gap-8">
        <aside className="min-w-0">
          <Link to="/akun" className="flex items-center gap-3 px-1 py-2"><ArrowLeft className="h-4 w-4 text-gray-600" /><span className="text-lg font-bold text-gray-900">Pengaturan</span></Link>
          <nav className="no-scrollbar mt-3 flex gap-1 overflow-x-auto md:block md:space-y-1" aria-label="Pengaturan">
            {TABS.map(([key, label, Icon]) => {
              const active = tab === key;
              const danger = key === 'reset';
              return (
                <button type="button" key={key} aria-current={active ? 'page' : undefined} onClick={() => setParams({ tab: key })} className={`flex min-h-[40px] w-max items-center gap-3 whitespace-nowrap rounded-xl px-4 text-sm font-medium md:w-full ${active ? 'bg-blue-50 text-blue-700 shadow-sm' : danger ? 'text-red-600 hover:bg-white/60' : 'text-gray-700 hover:bg-white/60'}`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              );
            })}
          </nav>
        </aside>
        <div className="min-w-0 pt-1">
          {tab === 'dompet' && <Dompet />}
          {tab === 'kategori' && <Kategori />}
          {tab === 'mata-uang' && <MataUang />}
          {tab === 'tanggal' && <Tanggal />}
          {tab === 'reset' && <Reset />}
        </div>
      </div>
    </div>
  );
}
