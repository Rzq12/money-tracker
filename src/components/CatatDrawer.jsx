import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronRight, ImagePlus, MessageCircle, Mic, MicOff, Search, Trash2, X } from 'lucide-react';
import { CategoryIcon, Confirm, Drawer, Label, MoneyInput, PrimaryButton, Segmented, Toggle, inputClass } from './ui.jsx';
import { findCategory, useStore } from '../lib/store.jsx';
import { decimal, groupDecimal, round2, rupiah, today } from '../lib/format.js';
import { currencySymbol, formatMoney, fromIdr, toIdr } from '../lib/money.js';
import { normalizeTags } from '../lib/rules.js';
import { parseEntry } from '../lib/parse.js';
import { compressImage } from '../lib/image.js';
import { useSpeech } from '../lib/speech.js';

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
  const {
    catat, closeCatat, categories, wallets, transactions, rates, saveTransaction, deleteTransaction, notify, features,
  } = useStore();
  const navigate = useNavigate();
  const editing = Boolean(catat.id);
  const [type, setType] = useState(catat.type || 'expense');
  const [step, setStep] = useState(editing || catat.type === 'transfer' ? 'form' : 'category');
  const baseWallet = wallets.find((w) => w.id === (catat.walletId || wallets[0]?.id));
  const [currency, setCurrency] = useState(catat.currency || baseWallet?.currency || 'IDR');
  const [raw, setRaw] = useState(() => {
    if (catat.originalAmount !== undefined && catat.originalAmount !== null) return Number(catat.originalAmount) || 0;
    const code = catat.currency || baseWallet?.currency || 'IDR';
    return code === 'IDR' ? Number(catat.amount) || 0 : fromIdr(catat.amount || 0, code, rates);
  });
  const [form, setForm] = useState({
    amount: catat.amount || 0,
    note: catat.note || '',
    categoryId: catat.categoryId || '',
    date: catat.date || today(),
    walletId: catat.walletId || wallets[0]?.id || '',
    toWalletId: catat.toWalletId || '',
    excluded: Boolean(catat.excluded),
    tags: normalizeTags(catat.tags),
    receipt: catat.receipt || '',
  });
  const [tagText, setTagText] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [reading, setReading] = useState(false);
  const photoInput = useRef(null);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const setRawAmount = (value) => {
    setRaw(value);
    set('amount', currency === 'IDR' ? Math.round(value) : toIdr(value, currency, rates));
  };

  const applySpeech = (text) => {
    const entry = parseEntry(text);
    if (!entry) {
      set('note', text.trim());
      setError('Nominal tidak ditemukan. Isi manual ya.');
      return;
    }
    setType(entry.type);
    setRaw(currency === 'IDR' ? entry.amount : fromIdr(entry.amount, currency, rates));
    setForm((f) => ({ ...f, note: entry.note, categoryId: entry.categoryId, amount: entry.amount, date: entry.date }));
    setError('');
    setStep('form');
  };
  const speech = useSpeech(applySpeech);

  const changeType = (next) => {
    setType(next);
    setError('');
    setForm((f) => ({ ...f, categoryId: '' }));
    setStep(next === 'transfer' ? 'form' : 'category');
  };

  const changeWallet = (id) => {
    const next = wallets.find((w) => w.id === id);
    const code = next?.currency || 'IDR';
    setCurrency(code);
    setRaw(form.amount ? fromIdr(form.amount, code, rates) : 0);
    set('walletId', id);
  };

  const addTag = (value) => {
    const list = normalizeTags([...form.tags, value]);
    set('tags', list);
    setTagText('');
  };

  const pickPhoto = async (file) => {
    if (!file) return;
    setReading(true);
    setError('');
    try {
      const data = await compressImage(file);
      set('receipt', data);
    } catch (err) {
      setError(err.message || 'Foto tidak bisa dibaca.');
    } finally {
      setReading(false);
    }
  };

  const wallet = wallets.find((w) => w.id === form.walletId);
  const balance = wallet ? transactions.filter((t) => t.id !== catat.id).reduce((sum, t) => {
    if (t.type === 'income' && t.walletId === wallet.id) return sum + t.amount;
    if (t.type === 'expense' && t.walletId === wallet.id) return sum - t.amount;
    if (t.type === 'transfer') {
      if (t.walletId === wallet.id) return sum - t.amount;
      if (t.toWalletId === wallet.id) return sum + t.amount;
    }
    return sum;
  }, Number(wallet.initial) || 0) : 0;
  const after = balance + (type === 'income' ? form.amount : -form.amount);
  const foreign = currency !== 'IDR';
  const converted = foreign ? toIdr(raw, currency, rates) : form.amount;

  const save = () => {
    const finalAmount = currency === 'IDR' ? Math.round(raw) : toIdr(raw, currency, rates);
    if (!finalAmount) return setError('Nominal belum diisi.');
    if (!form.walletId) return setError(type === 'transfer' ? 'Pilih dompet asal.' : 'Pilih dompet dulu.');
    if (type === 'transfer') {
      if (!form.toWalletId) return setError('Pilih dompet tujuan.');
      if (form.toWalletId === form.walletId) return setError('Pilih dompet lain sebagai tujuan.');
    } else if (!form.categoryId) {
      return setError('Pilih kategori dulu.');
    }
    const payload = {
      ...form,
      id: catat.id,
      type,
      amount: finalAmount,
      categoryId: type === 'transfer' ? 'transfer' : form.categoryId,
      currency,
      originalAmount: foreign ? round2(raw) : null,
    };
    saveTransaction(payload);
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
              {form.categoryId === 'lain-lain' && <p className="mt-1.5 text-xs text-gray-500">Aturan otomatis akan mencoba memilih kategori dari catatan.</p>}
            </div>
          )}

          <div>
            <div className="mb-2 flex items-end justify-between gap-2">
              <div>
                <Label htmlFor="tx-amount">Nominal {foreign ? `(${currency})` : ''}</Label>
                {foreign && <p className="-mt-1 text-xs text-gray-500">1 {currency} = {rupiah(rates[currency])}</p>}
              </div>
            </div>
            {foreign ? (
              <div className="flex min-h-[60px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <span className="text-lg font-semibold text-gray-500">{currencySymbol(currency)}</span>
                <input
                  id="tx-amount"
                  inputMode="decimal"
                  autoFocus={!editing}
                  className="w-full min-w-0 bg-transparent text-2xl font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none"
                  placeholder="0"
                  value={groupDecimal(raw)}
                  onChange={(e) => setRawAmount(decimal(e.target.value))}
                />
              </div>
            ) : (
              <MoneyInput id="tx-amount" large value={raw} onChange={setRawAmount} autoFocus={!editing} />
            )}
            {foreign && <p className="mt-1.5 text-xs text-gray-500">≈ {rupiah(converted)}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <Label htmlFor="tx-note">
                Catatan <span className="font-normal normal-case">(opsional)</span>
              </Label>
              <button
                type="button"
                onClick={() => { if (!speech.supported) setError('Browser ini belum mendukung input suara.'); else speech.toggle(); }}
                aria-pressed={speech.listening}
                title={speech.supported ? 'Catat dengan suara' : 'Input suara tidak didukung browser ini'}
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${speech.listening ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {speech.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            </div>
            <input id="tx-note" className={inputClass} placeholder={speech.listening ? 'Mendengarkan…' : 'Deskripsi singkat...'} value={form.note} onChange={(e) => set('note', e.target.value)} />
          </div>

          <div>
            <Label htmlFor="tx-date">Tanggal</Label>
            <input id="tx-date" type="date" max={today()} className={inputClass} value={form.date} onChange={(e) => set('date', e.target.value || today())} />
          </div>

          <div>
            <Label htmlFor="tx-wallet">{type === 'transfer' ? 'Dompet Asal' : 'Dompet / Rekening'}</Label>
            <select id="tx-wallet" className={inputClass} value={form.walletId} onChange={(e) => changeWallet(e.target.value)}>
              <option value="">-- Pilih Dompet --</option>
              {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}{w.currency && w.currency !== 'IDR' ? ` (${w.currency})` : ''}</option>)}
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
              <p className="flex justify-between"><span>Saldo saat ini</span><b className="text-gray-900">{formatMoney(balance, currency, rates)}</b></p>
              <p className="mt-1 flex justify-between"><span>Setelah transaksi</span><b className={after < 0 ? 'text-red-600' : 'text-gray-900'}>{formatMoney(after, currency, rates)}</b></p>
            </div>
          )}

          {features.tag && (
            <div>
              <Label htmlFor="tx-tag">Tag <span className="font-normal normal-case">(opsional)</span></Label>
              {form.tags.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {form.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                      #{tag}
                      <button type="button" aria-label={`Hapus tag ${tag}`} onClick={() => set('tags', form.tags.filter((x) => x !== tag))} className="rounded-full p-0.5 hover:bg-blue-100"><X className="h-3 w-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <input
                id="tx-tag"
                className={inputClass}
                placeholder="liburan, kerja… (Enter untuk menambah)"
                value={tagText}
                onChange={(e) => { if (e.target.value.endsWith(',')) addTag(e.target.value.slice(0, -1)); else setTagText(e.target.value); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (tagText.trim()) addTag(tagText); } }}
                onBlur={() => { if (tagText.trim()) addTag(tagText); }}
              />
            </div>
          )}

          {features.struk && (
            <div>
              <Label>Foto struk <span className="font-normal normal-case">(opsional)</span></Label>
              {form.receipt ? (
                <div className="relative overflow-hidden rounded-xl border border-gray-200">
                  <img src={form.receipt} alt="Foto struk transaksi" className="max-h-48 w-full object-contain bg-gray-50" />
                  <button type="button" aria-label="Hapus foto struk" onClick={() => set('receipt', '')} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"><X className="h-4 w-4" /></button>
                </div>
              ) : (
                <button type="button" onClick={() => photoInput.current?.click()} disabled={reading} className="flex min-h-[64px] w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 text-sm font-semibold text-gray-600 hover:border-blue-400 hover:text-blue-700 disabled:opacity-60">
                  {reading ? 'Memproses foto…' : <><ImagePlus className="h-[18px] w-[18px]" /> Lampirkan foto struk</>}
                </button>
              )}
              <input ref={photoInput} type="file" accept="image/*" capture="environment" className="hidden" aria-label="Pilih foto struk" onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
              <p className="mt-1 text-xs text-gray-400">Foto disimpan di perangkat ini dan ikut dalam backup.</p>
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
