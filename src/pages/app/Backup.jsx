import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check, Download, HardDrive, Upload } from 'lucide-react';
import { Card, Confirm, Empty, Label, PageTitle, PrimaryButton, inputClass } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { downloadText, longDate, toCSV, today } from '../../lib/format.js';

const STATE_KEYS = [
  'loggedIn', 'onboarded', 'user', 'profileAnswers', 'wallets', 'categories', 'features', 'startDay',
  'rates', 'currency', 'integrations', 'chat', 'transactions', 'budgets', 'contacts', 'goals',
  'holdings', 'recurring', 'rules', 'splits',
];

const LAST_KEY = 'uangku.backup.last';

const summaryOf = (data) => [
  ['Transaksi', Array.isArray(data.transactions) ? data.transactions.length : 0],
  ['Dompet', Array.isArray(data.wallets) ? data.wallets.length : 0],
  ['Anggaran', Array.isArray(data.budgets) ? data.budgets.length : 0],
  ['Tujuan', Array.isArray(data.goals) ? data.goals.length : 0],
  ['Aset', Array.isArray(data.holdings) ? data.holdings.length : 0],
  ['Berulang', Array.isArray(data.recurring) ? data.recurring.length : 0],
  ['Aturan', Array.isArray(data.rules) ? data.rules.length : 0],
  ['Split', Array.isArray(data.splits) ? data.splits.length : 0],
];

const validBackup = (data) => data && typeof data === 'object'
  && (Array.isArray(data.transactions) || Array.isArray(data.wallets) || Array.isArray(data.categories));

export default function Backup() {
  const store = useStore();
  const { replaceState, notify } = store;
  const fileInput = useRef(null);
  const [text, setText] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const snapshot = useMemo(() => {
    const data = {};
    STATE_KEYS.forEach((key) => { data[key] = store[key]; });
    data.exportedAt = new Date().toISOString();
    return data;
  }, [store]);

  const size = useMemo(() => new Blob([JSON.stringify(snapshot)]).size, [snapshot]);
  const last = (() => {
    try { return localStorage.getItem(LAST_KEY); } catch { return null; }
  })();

  const counts = summaryOf(snapshot);

  const exportJson = () => {
    downloadText(`uangku-backup-${today()}.json`, JSON.stringify(snapshot, null, 2), 'application/json');
    try { localStorage.setItem(LAST_KEY, new Date().toISOString()); } catch { /* private mode */ }
    notify('Backup JSON diunduh.');
  };

  const exportCsv = () => {
    const rows = [
      ['Tanggal', 'Jenis', 'Kategori', 'Dompet', 'Catatan', 'Nominal', 'Tag', 'Mata uang', 'Nominal asli'],
      ...store.transactions.map((t) => [
        t.date,
        t.type,
        store.categories.flatMap((c) => [c, ...c.children]).find((c) => c.id === t.categoryId)?.name || t.categoryId,
        store.wallets.find((w) => w.id === t.walletId)?.name || '',
        t.note,
        t.amount,
        (t.tags || []).join(' '),
        t.currency || 'IDR',
        t.originalAmount ?? '',
      ]),
    ];
    downloadText(`uangku-transaksi-${today()}.csv`, toCSV(rows));
    notify('CSV transaksi diunduh.');
  };

  const inspect = (raw, source) => {
    setError('');
    setDone(false);
    try {
      const data = JSON.parse(raw);
      if (!validBackup(data)) {
        setError(`File ${source} tidak berisi data uangku yang dikenali.`);
        return;
      }
      setCandidate(data);
    } catch {
      setError(`File ${source} bukan JSON yang valid.`);
    }
  };

  const readFile = async (file) => {
    if (!file) return;
    if (file.size > 25 * 1024 * 1024) { setError('Ukuran file lebih dari 25 MB.'); return; }
    inspect(await file.text(), file.name);
  };

  const restore = () => {
    replaceState({ ...candidate, loggedIn: true });
    try { localStorage.setItem(LAST_KEY, new Date().toISOString()); } catch { /* private mode */ }
    setCandidate(null);
    setText('');
    setDone(true);
    notify('Backup dipulihkan.');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/akun" className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Akun</Link>
      <PageTitle title="Backup & pemulihan" subtitle="Semua data ada di browser ini. Unduh salinan supaya tidak hilang saat cache dibersihkan." />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><Download className="h-5 w-5 text-blue-700" /> Unduh backup</h2>
          <p className="mt-1 text-sm text-gray-600">Satu file JSON berisi seluruh catatan, termasuk foto struk.</p>
          <dl className="mt-4 space-y-1.5 text-sm">
            {counts.map(([name, value]) => (
              <div key={name} className="flex justify-between gap-3"><dt className="text-gray-600">{name}</dt><dd className="font-semibold text-gray-900">{value}</dd></div>
            ))}
          </dl>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
            <HardDrive className="h-4 w-4 shrink-0" />
            Perkiraan ukuran: {(size / 1024).toFixed(1)} KB · kuota browser biasanya 5 MB
          </div>
          {last && <p className="mt-2 text-xs text-gray-500">Backup terakhir: {longDate(last.slice(0, 10))} · {last.slice(11, 16)}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton onClick={exportJson}><Download className="h-4 w-4" /> Unduh JSON</PrimaryButton>
            <button type="button" onClick={exportCsv} className="inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50">Unduh CSV</button>
          </div>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 text-base font-bold text-gray-900"><Upload className="h-5 w-5 text-blue-700" /> Pulihkan backup</h2>
          <p className="mt-1 text-sm text-gray-600">Memilih file atau menempel JSON akan mengganti semua data saat ini.</p>
          <PrimaryButton className="mt-4" onClick={() => fileInput.current?.click()}><Upload className="h-4 w-4" /> Pilih file JSON</PrimaryButton>
          <input ref={fileInput} type="file" accept=".json,application/json" className="hidden" aria-label="Pilih file backup" onChange={(e) => { readFile(e.target.files?.[0]); e.target.value = ''; }} />
          <div className="mt-4">
            <Label htmlFor="backup-text">Atau tempel JSON</Label>
            <textarea id="backup-text" rows={5} className={`${inputClass} font-mono text-xs`} placeholder='{"transactions":[…]}' value={text} onChange={(e) => setText(e.target.value)} />
            <button type="button" disabled={!text.trim()} onClick={() => inspect(text, 'tempelan')} className="mt-2 inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-gray-200 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">Periksa JSON</button>
          </div>
        </Card>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
      {done && <p className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800"><Check className="h-4 w-4" /> Data dari backup sudah dipulihkan.</p>}

      <Card className="mt-4 border-amber-200 bg-amber-50/60">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900"><AlertTriangle className="h-4 w-4 text-amber-600" /> Sebelum memulihkan</h2>
        <p className="mt-1 text-sm leading-6 text-gray-700">Unduh backup data yang sekarang dulu. Pemulihan mengganti semua transaksi, dompet, kategori, dan pengaturan, bukan menggabungkannya.</p>
        {candidate && (
          <div className="mt-3 rounded-xl bg-white p-4">
            <b className="block text-sm font-semibold text-gray-900">File yang dipilih</b>
            <p className="mt-0.5 text-xs text-gray-500">{candidate.exportedAt ? `Dibuat ${longDate(candidate.exportedAt.slice(0, 10))}` : 'Tanpa tanggal ekspor'}</p>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {summaryOf(candidate).map(([name, value]) => <li key={name} className="flex justify-between text-gray-600"><span>{name}</span><b className="text-gray-900">{value}</b></li>)}
            </ul>
          </div>
        )}
      </Card>

      {store.transactions.length === 0 && store.wallets.length <= 3 && <Empty className="mt-6">Belum banyak data untuk dicadangkan.</Empty>}

      {candidate && (
        <Confirm
          title="Ganti semua data dengan backup ini?"
          text="Data saat ini akan hilang. Pastikan kamu sudah mengunduh backup terbaru."
          confirmLabel="Pulihkan"
          onCancel={() => setCandidate(null)}
          onConfirm={restore}
        />
      )}
    </div>
  );
}
