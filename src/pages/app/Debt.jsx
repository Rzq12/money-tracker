import { useState } from 'react';
import { Check, Plus, Search, Trash2 } from 'lucide-react';
import { Card, Confirm, Drawer, Label, MoneyInput, PrimaryButton, Segmented, inputClass } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { addDays, rupiah, shortDate, today } from '../../lib/format.js';

function ContactForm({ onClose }) {
  const { saveContact, notify } = useStore();
  const [name, setName] = useState('');
  const [kind, setKind] = useState('Perorangan');
  const [due, setDue] = useState('');
  return (
    <Drawer
      title="Tambah Kontak"
      onClose={onClose}
      footer={<PrimaryButton className="min-h-[44px] w-full" disabled={!name.trim()} onClick={() => { saveContact({ name: name.trim(), kind, due }); notify('Kontak disimpan.'); onClose(); }}>Simpan Kontak</PrimaryButton>}
    >
      <div className="space-y-6">
        <div><Label htmlFor="d-name">Nama</Label><input id="d-name" autoFocus className={inputClass} placeholder="Nama lengkap atau panggilan..." value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div>
          <Label>Tipe</Label>
          <div className="grid grid-cols-2 gap-2">
            {[['Perorangan', '👤'], ['Lembaga', '🏢']].map(([k, icon]) => (
              <button type="button" key={k} aria-pressed={kind === k} onClick={() => setKind(k)} className={`min-h-[42px] rounded-xl border text-sm font-medium ${kind === k ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700'}`}>{icon} {k}</button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="d-due">Jatuh tempo <span className="font-normal normal-case">(opsional)</span></Label>
          <input id="d-due" type="date" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} />
          <div className="mt-3 flex gap-2">
            {[['+1 mgg', 7], ['+2 mgg', 14], ['+1 bln', 30]].map(([t, n]) => (
              <button type="button" key={t} onClick={() => setDue(addDays(today(), n))} className="min-h-[38px] rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50">{t}</button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

function RecordForm({ contact, onClose }) {
  const { addDebtRecord, notify } = useStore();
  const [direction, setDirection] = useState('owed-to-me');
  const [amount, setAmount] = useState(0);
  const [note, setNote] = useState('');
  return (
    <Drawer
      title={`Catat untuk ${contact.name}`}
      onClose={onClose}
      footer={<PrimaryButton className="min-h-[44px] w-full" disabled={!amount} onClick={() => { addDebtRecord(contact.id, { direction, amount, note, date: today() }); notify('Catatan disimpan.'); onClose(); }}>Simpan</PrimaryButton>}
    >
      <div className="space-y-6">
        <Segmented options={[['owed-to-me', 'Hutang ke saya'], ['i-owe', 'Saya yang hutang']]} value={direction} onChange={setDirection} />
        <div><Label htmlFor="r-amount">Nominal</Label><MoneyInput id="r-amount" large autoFocus value={amount} onChange={setAmount} /></div>
        <div><Label htmlFor="r-note">Catatan</Label><input id="r-note" className={inputClass} placeholder="Deskripsi singkat..." value={note} onChange={(e) => setNote(e.target.value)} /></div>
      </div>
    </Drawer>
  );
}

export default function Debt() {
  const { contacts, toggleDebtPaid, deleteContact, notify } = useStore();
  const [adding, setAdding] = useState(false);
  const [recordFor, setRecordFor] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [query, setQuery] = useState('');

  const open = contacts.flatMap((c) => c.records).filter((r) => !r.paid);
  const iOwe = open.filter((r) => r.direction === 'i-owe').reduce((s, r) => s + r.amount, 0);
  const owedToMe = open.filter((r) => r.direction === 'owed-to-me').reduce((s, r) => s + r.amount, 0);
  const shown = contacts.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900"><span aria-hidden="true">🤝</span> Hutang Piutang</h1>
          <p className="mt-1 text-sm text-gray-600">Kelola pinjaman &amp; piutangmu</p>
        </div>
        <PrimaryButton onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Tambah Kontak</PrimaryButton>
      </div>

      {contacts.length === 0 ? (
        <Card className="flex flex-col items-center py-14 text-center">
          <span className="text-[52px] leading-[60px] opacity-30" aria-hidden="true">🤝</span>
          <h2 className="mt-3 text-lg font-semibold text-gray-800">Belum ada catatan hutang piutang</h2>
          <p className="mt-2 max-w-[340px] text-sm leading-5 text-gray-600">Catat pinjaman ke teman atau tagihan yang belum dibayar</p>
          <PrimaryButton className="mt-5 min-h-[44px] px-6" onClick={() => setAdding(true)}>+ Tambah Kontak Pertama</PrimaryButton>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card><p className="text-sm font-medium text-gray-600">💸 Saya yang hutang</p><p className="mt-2 text-2xl font-bold text-orange-700">{rupiah(iOwe)}</p></Card>
            <Card><p className="text-sm font-medium text-gray-600">💰 Hutang ke saya</p><p className="mt-2 text-2xl font-bold text-green-700">{rupiah(owedToMe)}</p></Card>
          </div>
          <div className="mt-5 flex min-h-[46px] items-center gap-3 rounded-xl border border-gray-200 bg-white px-4">
            <Search className="h-4 w-4 text-gray-500" />
            <input aria-label="Cari nama kontak" className="w-full bg-transparent text-sm focus:outline-none" placeholder="Cari nama kontak..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="mt-5 space-y-4">
            {shown.length === 0 && <p className="py-8 text-center text-sm text-gray-500">Tidak ada kontak dengan nama itu.</p>}
            {shown.map((c) => (
              <Card key={c.id} className="!p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{c.name}</h2>
                    <p className="text-xs text-gray-500">{c.kind}{c.due ? ` · jatuh tempo ${shortDate(c.due)}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => setRecordFor(c)} className="min-h-[36px] rounded-lg px-3 text-sm font-semibold text-blue-700 hover:bg-blue-50">+ Tambah</button>
                    <button type="button" aria-label={`Hapus ${c.name}`} onClick={() => setRemoving(c)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <ul className="mt-3 list-none divide-y divide-gray-100 p-0">
                  {c.records.length === 0 && <li className="py-3 text-sm text-gray-500">Belum ada catatan.</li>}
                  {c.records.map((r) => (
                    <li key={r.id} className="flex min-h-[52px] items-center gap-3 py-2">
                      <button type="button" aria-label={r.paid ? 'Tandai belum lunas' : 'Tandai lunas'} title={r.paid ? 'Lunas' : 'Tandai lunas'} onClick={() => toggleDebtPaid(c.id, r.id)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${r.paid ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 text-transparent hover:text-gray-300'}`}><Check className="h-4 w-4" /></button>
                      <span className="min-w-0 flex-1">
                        <b className={`block truncate text-sm font-medium ${r.paid ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{r.note || (r.direction === 'i-owe' ? 'Saya yang hutang' : 'Hutang ke saya')}</b>
                        <span className="text-xs text-gray-500">{shortDate(r.date)} · {r.direction === 'i-owe' ? 'Saya yang hutang' : 'Hutang ke saya'}</span>
                      </span>
                      <b className={`text-sm ${r.paid ? 'text-gray-400' : r.direction === 'i-owe' ? 'text-orange-700' : 'text-green-700'}`}>{rupiah(r.amount)}</b>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </>
      )}

      {adding && <ContactForm onClose={() => setAdding(false)} />}
      {recordFor && <RecordForm contact={recordFor} onClose={() => setRecordFor(null)} />}
      {removing && <Confirm title={`Hapus ${removing.name}?`} text="Semua catatannya ikut terhapus." onCancel={() => setRemoving(null)} onConfirm={() => { deleteContact(removing.id); notify('Kontak dihapus.'); setRemoving(null); }} />}
    </div>
  );
}
