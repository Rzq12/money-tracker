import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Receipt, Settings2, Trash2, UserPlus, Users } from 'lucide-react';
import { Card, Confirm, Drawer, Empty, Label, MoneyInput, PageTitle, PrimaryButton, inputClass } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { longDate, rupiah, today } from '../../lib/format.js';
import { uid } from '../../lib/seed.js';

const compute = (split) => {
  const participants = split?.participants || [];
  const ids = participants.map((p) => p.id);
  const items = split?.items || [];
  const subtotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const tax = (subtotal * (Number(split?.taxPct) || 0)) / 100;
  const service = (subtotal * (Number(split?.servicePct) || 0)) / 100;
  const extra = tax + service;
  const per = participants.map((person) => {
    const base = items.reduce((sum, item) => {
      const members = item.sharedBy?.length ? item.sharedBy : ids;
      return members.includes(person.id) ? sum + (Number(item.amount) || 0) / members.length : sum;
    }, 0);
    const share = subtotal > 0 ? extra * (base / subtotal) : extra / Math.max(1, participants.length);
    return { ...person, base, amount: base + share };
  });
  return { subtotal, tax, service, total: subtotal + extra, per };
};

function MetaForm({ split, onClose, onSaved }) {
  const { saveSplit, notify } = useStore();
  const [form, setForm] = useState({
    title: split?.title || '',
    date: split?.date || today(),
    taxPct: split?.taxPct ?? 0,
    servicePct: split?.servicePct ?? 0,
    note: split?.note || '',
  });
  const [people, setPeople] = useState(split?.participants?.length ? split.participants : [{ id: uid('p'), name: 'Aku', paid: false }]);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  return (
    <Drawer
      title={split ? 'Pengaturan split' : 'Split bill baru'}
      onClose={onClose}
      footer={(
        <PrimaryButton
          className="min-h-[44px] w-full"
          disabled={!form.title.trim() || people.filter((p) => p.name.trim()).length < 2}
          onClick={() => {
            const participants = people.filter((p) => p.name.trim()).map((p) => ({ ...p, name: p.name.trim() }));
            const ids = new Set(participants.map((p) => p.id));
            const items = (split?.items || []).map((item) => ({
              ...item,
              sharedBy: (item.sharedBy || []).filter((id) => ids.has(id)),
            }));
            const record = {
              ...(split || { id: uid('split') }),
              ...form,
              title: form.title.trim(),
              participants,
              items,
            };
            saveSplit(record);
            notify(split ? 'Split diperbarui.' : 'Split dibuat.');
            onSaved?.(record.id);
            onClose();
          }}
        >
          {split ? 'Simpan' : 'Buat split'}
        </PrimaryButton>
      )}
    >
      <div className="space-y-5">
        <div><Label htmlFor="split-title">Judul</Label><input id="split-title" className={inputClass} placeholder="Makan malam, patungan kado…" value={form.title} onChange={(e) => set('title', e.target.value)} autoFocus={!split} /></div>
        <div><Label htmlFor="split-date">Tanggal</Label><input id="split-date" type="date" className={inputClass} value={form.date} onChange={(e) => set('date', e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="split-tax">Pajak (%)</Label><input id="split-tax" type="number" min="0" step="0.1" className={inputClass} value={form.taxPct} onChange={(e) => set('taxPct', e.target.value)} /></div>
          <div><Label htmlFor="split-service">Service (%)</Label><input id="split-service" type="number" min="0" step="0.1" className={inputClass} value={form.servicePct} onChange={(e) => set('servicePct', e.target.value)} /></div>
        </div>
        <div>
          <Label>Peserta</Label>
          <div className="space-y-2">
            {people.map((person, index) => (
              <div key={person.id} className="flex gap-2">
                <input
                  aria-label={`Nama peserta ${index + 1}`}
                  className={inputClass}
                  value={person.name}
                  onChange={(e) => setPeople(people.map((p) => (p.id === person.id ? { ...p, name: e.target.value } : p)))}
                />
                <button type="button" aria-label="Hapus peserta" disabled={people.length <= 2} onClick={() => setPeople(people.filter((p) => p.id !== person.id))} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setPeople([...people, { id: uid('p'), name: '', paid: false }])} className="mt-2 inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"><UserPlus className="h-4 w-4" /> Tambah peserta</button>
        </div>
        <div><Label htmlFor="split-note">Catatan <span className="font-normal normal-case">(opsional)</span></Label><textarea id="split-note" rows={2} className={inputClass} value={form.note} onChange={(e) => set('note', e.target.value)} /></div>
      </div>
    </Drawer>
  );
}

function ItemForm({ split, onClose }) {
  const { saveSplit, notify } = useStore();
  const ids = (split.participants || []).map((p) => p.id);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState(0);
  const [sharedBy, setSharedBy] = useState(ids);
  const toggle = (id) => setSharedBy((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  return (
    <Drawer
      title="Tambah item"
      onClose={onClose}
      footer={(
        <PrimaryButton
          className="min-h-[44px] w-full"
          disabled={!name.trim() || !amount || sharedBy.length === 0}
          onClick={() => {
            saveSplit({ ...split, items: [...(split.items || []), { id: uid('i'), name: name.trim(), amount, sharedBy }] });
            notify('Item ditambahkan.');
            onClose();
          }}
        >
          Tambah item
        </PrimaryButton>
      )}
    >
      <div className="space-y-5">
        <div><Label htmlFor="item-name">Nama item</Label><input id="item-name" className={inputClass} placeholder="Nasi goreng, es teh…" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
        <div><Label htmlFor="item-amount">Harga</Label><MoneyInput id="item-amount" value={amount} onChange={setAmount} /></div>
        <div>
          <Label>Dibagi ke</Label>
          <div className="flex flex-wrap gap-2">
            {(split.participants || []).map((person) => (
              <button key={person.id} type="button" aria-pressed={sharedBy.includes(person.id)} onClick={() => toggle(person.id)} className={`min-h-[38px] rounded-full border px-4 text-sm font-medium ${sharedBy.includes(person.id) ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700'}`}>{person.name}</button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">Harga dibagi rata ke peserta yang dipilih.</p>
        </div>
      </div>
    </Drawer>
  );
}

function Detail({ split }) {
  const { saveSplit, deleteSplit, toggleSplitPaid, saveTransaction, wallets, notify } = useStore();
  const navigate = useNavigate();
  const [meta, setMeta] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const items = split.items || [];
  const participants = split.participants || [];
  const summary = compute(split);
  const paidCount = participants.filter((p) => p.paid).length;
  const me = participants.find((p) => /^aku$/i.test(p.name)) || participants[0];

  const removeItem = (id) => saveSplit({ ...split, items: items.filter((item) => item.id !== id) });

  const recordMine = () => {
    const mine = summary.per.find((p) => p.id === me?.id);
    if (!mine || !wallets[0]) return;
    saveTransaction({
      type: 'expense',
      categoryId: 'lain-lain',
      note: `Split: ${split.title}`,
      amount: Math.round(mine.amount),
      walletId: wallets[0].id,
      date: split.date || today(),
      tags: ['split'],
      excluded: false,
    });
    notify('Bagianmu dicatat sebagai pengeluaran.');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/split" className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Split bill</Link>
      <PageTitle
        title={split.title}
        subtitle={`${longDate(split.date)} · ${split.participants.length} orang${split.note ? ` · ${split.note}` : ''}`}
        right={<button type="button" onClick={() => setMeta(true)} className="inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"><Settings2 className="h-4 w-4" /> Pengaturan</button>}
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total tagihan</p>
            <b className="text-3xl font-bold text-gray-900">{rupiah(summary.total)}</b>
          </div>
          <p className="text-sm text-gray-600">{paidCount} dari {participants.length} sudah bayar</p>
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-4 text-sm">
          <div><dt className="text-xs text-gray-500">Subtotal</dt><dd className="font-semibold text-gray-900">{rupiah(summary.subtotal)}</dd></div>
          <div><dt className="text-xs text-gray-500">Pajak {Number(split.taxPct) || 0}%</dt><dd className="font-semibold text-gray-900">{rupiah(summary.tax)}</dd></div>
          <div><dt className="text-xs text-gray-500">Service {Number(split.servicePct) || 0}%</dt><dd className="font-semibold text-gray-900">{rupiah(summary.service)}</dd></div>
        </dl>
      </Card>

      <section className="mb-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900">Item</h2>
          <button type="button" onClick={() => setAddingItem(true)} className="inline-flex min-h-[36px] items-center gap-1.5 text-sm font-semibold text-blue-700"><Plus className="h-4 w-4" /> Tambah item</button>
        </div>
        {items.length === 0 ? (
          <Card><Empty>Belum ada item. Tambahkan menu yang dipesan.</Empty></Card>
        ) : (
          <ul className="list-none divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-sm">
            {items.map((item) => {
              const members = item.sharedBy?.length ? item.sharedBy : participants.map((p) => p.id);
              return (
                <li key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50"><Receipt className="h-4 w-4 text-gray-600" /></span>
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-sm font-semibold text-gray-900">{item.name}</b>
                    <span className="block truncate text-xs text-gray-500">Dibagi {members.length} orang · {rupiah(item.amount / members.length)}/orang</span>
                  </div>
                  <b className="text-sm font-bold text-gray-900">{rupiah(item.amount)}</b>
                  <button type="button" aria-label={`Hapus ${item.name}`} onClick={() => removeItem(item.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="mb-5">
        <h2 className="mb-2 text-sm font-bold text-gray-900">Per orang</h2>
        <ul className="list-none divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-sm">
          {summary.per.map((person) => (
            <li key={person.id} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700">{person.name.slice(0, 1).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <b className="block truncate text-sm font-semibold text-gray-900">{person.name}</b>
                <span className="text-xs text-gray-500">{rupiah(person.base)} + pajak/service</span>
              </div>
              <b className="text-sm font-bold text-gray-900">{rupiah(person.amount)}</b>
              <button
                type="button"
                aria-pressed={person.paid}
                onClick={() => toggleSplitPaid(split.id, person.id)}
                className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-3 text-xs font-semibold ${person.paid ? 'border-green-200 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {person.paid ? <><Check className="h-3.5 w-3.5" /> Lunas</> : 'Tandai lunas'}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2">
        <PrimaryButton onClick={recordMine} disabled={!wallets.length}>Catat bagianku</PrimaryButton>
        <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-red-200 px-4 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Hapus split</button>
      </div>

      {meta && <MetaForm split={split} onClose={() => setMeta(false)} />}
      {addingItem && <ItemForm split={split} onClose={() => setAddingItem(false)} />}
      {confirmDelete && (
        <Confirm
          title="Hapus split ini?"
          text="Item dan status pembayaran ikut terhapus."
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => { deleteSplit(split.id); notify('Split dihapus.'); navigate('/split'); }}
        />
      )}
    </div>
  );
}

function List() {
  const { splits, saveSplit } = useStore();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/akun" className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Akun</Link>
      <PageTitle
        title="Split bill"
        subtitle="Bagi tagihan per orang, lengkap dengan pajak dan service."
        right={<PrimaryButton onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Split baru</PrimaryButton>}
      />
      {splits.length === 0 ? (
        <Card className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700"><Users className="h-7 w-7" /></span>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Belum ada split bill</h2>
          <p className="mx-auto mt-1 max-w-[420px] text-sm text-gray-600">Buat tagihan patungan, tambahkan item, lalu tandai siapa yang sudah bayar.</p>
          <PrimaryButton className="mt-5" onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> Buat split</PrimaryButton>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {splits.map((split) => {
            const summary = compute(split);
            const participants = split.participants || [];
            const paid = participants.filter((p) => p.paid).length;
            return (
              <button key={split.id} type="button" onClick={() => navigate(`/split/${split.id}`)} className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm hover:border-blue-200">
                <b className="block truncate text-base font-bold text-gray-900">{split.title}</b>
                <span className="mt-0.5 block text-xs text-gray-500">{longDate(split.date)} · {participants.length} orang</span>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div><span className="block text-xs text-gray-500">Total</span><b className="text-lg font-bold text-gray-900">{rupiah(summary.total)}</b></div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${paid === participants.length ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{paid}/{participants.length} lunas</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {creating && (
        <MetaForm
          split={null}
          onClose={() => setCreating(false)}
          onSaved={(id) => navigate(`/split/${id}`)}
        />
      )}
    </div>
  );
}

export default function SplitBill() {
  const { splits } = useStore();
  const { id } = useParams();
  if (!id) return <List />;
  const split = splits.find((s) => s.id === id);
  if (!split) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Split tidak ditemukan</h1>
        <p className="mt-2 text-sm text-gray-600">Mungkin sudah dihapus di perangkat lain.</p>
        <Link to="/split" className="mt-6 inline-flex min-h-[40px] items-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white">Kembali ke Split bill</Link>
      </div>
    );
  }
  return <Detail split={split} />;
}
