import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, FileSpreadsheet, Landmark, Upload } from 'lucide-react';
import { GhostButton, PrimaryButton, inputClass } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { digits, fromISO, pad, rupiah, toISO, today } from '../../lib/format.js';

const STEPS = ['Upload', 'Mapping', 'Kategori', 'Proses', 'Selesai'];
const FIELDS = [['date', 'Tanggal'], ['note', 'Catatan'], ['amount', 'Nominal'], ['type', 'Jenis (opsional)'], ['category', 'Kategori (opsional)']];
const MAX_ROWS = 10000;
const MAX_BYTES = 10 * 1024 * 1024;

const parseCSV = (text) => {
  const first = text.split(/\r?\n/, 1)[0] || '';
  const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i += 1; } else if (c === '"') quoted = false; else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(cell); cell = ''; } else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => String(x).trim()));
};

const normalizeDate = (value) => {
  if (value instanceof Date) return toISO(value);
  const s = String(value || '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${pad(m[2])}-${pad(m[1])}`;
  return '';
};

const guess = (headers, words) => {
  const i = headers.findIndex((h) => words.some((w) => String(h).toLowerCase().includes(w)));
  return i >= 0 ? String(i) : '';
};

export default function ImportData() {
  const { wallets, categories, addTransactions, notify } = useStore();
  const input = useRef(null);
  const [mode, setMode] = useState('file');
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [map, setMap] = useState({});
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [fallback, setFallback] = useState('lain-lain');
  const [imported, setImported] = useState(0);
  const [skipped, setSkipped] = useState(0);

  const headers = rows[0] || [];
  const body = rows.slice(1);

  const read = async (file) => {
    setError('');
    if (!file) return;
    if (file.size > MAX_BYTES) { setError('Ukuran file lebih dari 10 MB.'); return; }
    if (mode === 'bank' && /\.pdf$/i.test(file.name)) { setError('Versi contoh belum bisa membaca PDF. Pakai file CSV dari bankmu.'); return; }
    try {
      let parsed;
      if (/\.xlsx$/i.test(file.name)) {
        const { default: readXlsx } = await import('read-excel-file');
        parsed = await readXlsx(file);
      } else if (/\.csv$/i.test(file.name)) {
        parsed = parseCSV(await file.text());
      } else {
        setError('Format belum didukung. Pakai .csv atau .xlsx.');
        return;
      }
      if (parsed.length < 2) { setError('File ini tidak punya baris data.'); return; }
      if (parsed.length - 1 > MAX_ROWS) { setError('File ini lebih dari 10.000 baris.'); return; }
      setRows(parsed);
      setFileName(file.name);
      setMap({
        date: guess(parsed[0], ['tanggal', 'date', 'tgl']),
        note: guess(parsed[0], ['catatan', 'deskripsi', 'keterangan', 'note', 'description']),
        amount: guess(parsed[0], ['nominal', 'jumlah', 'amount', 'mutasi']),
        type: guess(parsed[0], ['jenis', 'tipe', 'type']),
        category: guess(parsed[0], ['kategori', 'category']),
      });
    } catch {
      setError('File tidak bisa dibaca. Coba simpan ulang lalu unggah lagi.');
    }
  };

  const preview = useMemo(() => {
    if (map.date === '' || map.amount === '' || map.date === undefined) return [];
    return body.map((r) => {
      const raw = r[Number(map.amount)];
      const amount = typeof raw === 'number' ? Math.abs(raw) : digits(String(raw).split(/[,.]\d{1,2}$/)[0]);
      const negative = typeof raw === 'number' ? raw < 0 : /^\s*-/.test(String(raw));
      const typeText = map.type !== '' ? String(r[Number(map.type)] || '').toLowerCase() : '';
      const type = /masuk|income|kredit|\bcr\b/.test(typeText) ? 'income' : /keluar|expense|debit|\bdb\b/.test(typeText) ? 'expense' : negative ? 'expense' : 'expense';
      const catText = map.category !== '' ? String(r[Number(map.category)] || '').toLowerCase() : '';
      const match = categories.find((c) => c.name.toLowerCase() === catText);
      return { date: normalizeDate(r[Number(map.date)]), note: map.note !== '' ? String(r[Number(map.note)] || '') : '', amount, type, categoryId: match?.id };
    });
  }, [body, map, categories]);

  const valid = preview.filter((r) => r.date && r.amount > 0);

  const run = () => {
    setStep(3);
    const list = valid.map((r) => ({
      type: r.type,
      date: r.date,
      note: r.note,
      amount: r.amount,
      walletId,
      excluded: false,
      categoryId: r.categoryId || (r.type === 'income' ? 'pemasukan-lain' : fallback),
    }));
    addTransactions(list);
    setImported(list.length);
    setSkipped(preview.length - list.length);
    setTimeout(() => setStep(4), 500);
    notify(`${list.length} transaksi diimpor.`);
  };

  const restart = () => { setStep(0); setRows([]); setFileName(''); setMap({}); };

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/akun" className="flex items-center gap-4"><ArrowLeft className="h-5 w-5 text-gray-600" /><span className="text-lg font-bold text-gray-900">Import Data</span></Link>
      <div className="mt-7 grid gap-6 md:grid-cols-[176px_minmax(0,672px)] md:gap-6">
        <ol className="no-scrollbar flex list-none gap-5 overflow-x-auto p-0 md:block md:space-y-5">
          {STEPS.map((name, i) => (
            <li key={name} className="flex items-center gap-2.5 whitespace-nowrap py-1">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i < step ? 'bg-blue-700 text-white' : i === step ? 'bg-blue-700 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-600'}`}>{i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
              <span className={`text-sm font-medium ${i === step ? 'text-blue-700' : 'text-gray-600'}`}>{name}</span>
            </li>
          ))}
        </ol>

        <div className="min-w-0">
          {step === 0 && (
            <>
              <h1 className="text-xl font-bold text-gray-900">Import Data</h1>
              <p className="mt-1 text-sm text-gray-600">Impor transaksi dari spreadsheet, aplikasi keuangan lain, atau mutasi bank.</p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {[['file', 'File Excel / CSV', 'Spreadsheet, ekspor dari aplikasi ini, atau aplikasi keuangan lain.', FileSpreadsheet], ['bank', 'Mutasi bank', 'File CSV mutasi rekening dari bank.', Landmark]].map(([key, title, text, Icon]) => (
                  <button key={key} type="button" aria-pressed={mode === key} onClick={() => setMode(key)} className={`flex gap-3 rounded-2xl border-2 p-4 text-left ${mode === key ? 'border-blue-700 bg-white' : 'border-gray-100 bg-white/70 hover:bg-white'}`}>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${mode === key ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}><Icon className="h-5 w-5" /></span>
                    <span><b className="block text-sm font-semibold text-gray-900">{title}</b><span className="mt-1 block text-xs leading-5 text-gray-600">{text}</span></span>
                  </button>
                ))}
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                onDragLeave={() => setDrag(false)}
                onDrop={(e) => { e.preventDefault(); setDrag(false); read(e.dataTransfer.files[0]); }}
                className={`mt-5 flex min-h-[276px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center ${drag ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
              >
                <Upload className="h-9 w-9 text-gray-300" />
                {fileName ? <p className="mt-3 text-sm font-semibold text-gray-900">{fileName} · {body.length} baris</p> : <p className="mt-3 text-sm font-semibold text-gray-700">Drag &amp; drop file di sini</p>}
                <p className="mt-1 text-xs text-gray-500">atau</p>
                <PrimaryButton className="mt-3" onClick={() => input.current.click()}>Pilih File</PrimaryButton>
                <input ref={input} type="file" accept=".csv,.xlsx" className="hidden" aria-label="Pilih file" onChange={(e) => { read(e.target.files[0]); e.target.value = ''; }} />
                <p className="mt-5 text-xs text-gray-500">Mendukung: .csv · .xlsx · Maks. 10 MB · 10.000 baris</p>
              </div>
              {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
              <div className="mt-6 text-xs leading-5 text-gray-600">
                <p className="font-semibold tracking-wide">FORMAT YANG DIDUKUNG</p>
                <p className="mt-1">• Spreadsheet → File &gt; Download &gt; .csv</p>
                <p>• Ekspor dari aplikasi ini (.csv)</p>
                <p>• Aplikasi keuangan lain (.csv atau .xlsx)</p>
              </div>
              <div className="mt-6 flex justify-end"><PrimaryButton className="min-h-[40px] px-6" disabled={!rows.length} onClick={() => setStep(1)}>Lanjut →</PrimaryButton></div>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-gray-900">Cocokkan kolom</h1>
              <p className="mt-1 text-sm text-gray-600">Pilih kolom di file yang berisi tiap data.</p>
              <div className="mt-5 grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 md:grid-cols-2">
                {FIELDS.map(([key, label]) => (
                  <label key={key} className="text-sm font-medium text-gray-700">{label}
                    <select className={`${inputClass} mt-1.5`} value={map[key] ?? ''} onChange={(e) => setMap({ ...map, [key]: e.target.value })}>
                      <option value="">— Tidak dipakai —</option>
                      {headers.map((h, i) => <option key={`${h}-${i}`} value={i}>{String(h) || `Kolom ${i + 1}`}</option>)}
                    </select>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-sm text-gray-600">{valid.length} dari {body.length} baris siap diimpor.</p>
              <div className="mt-6 flex justify-between">
                <GhostButton className="min-h-[40px]" onClick={() => setStep(0)}>Kembali</GhostButton>
                <PrimaryButton className="min-h-[40px] px-6" disabled={!valid.length} onClick={() => setStep(2)}>Lanjut →</PrimaryButton>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-bold text-gray-900">Kategori &amp; dompet</h1>
              <p className="mt-1 text-sm text-gray-600">Baris tanpa kategori yang cocok masuk ke kategori di bawah.</p>
              <div className="mt-5 grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 md:grid-cols-2">
                <label className="text-sm font-medium text-gray-700">Masukkan ke dompet
                  <select className={`${inputClass} mt-1.5`} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
                    {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium text-gray-700">Kategori bawaan
                  <select className={`${inputClass} mt-1.5`} value={fallback} onChange={(e) => setFallback(e.target.value)}>
                    {categories.filter((c) => c.type === 'expense').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
              </div>
              <ul className="mt-4 list-none divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white p-0 text-sm">
                {valid.slice(0, 5).map((r, i) => (
                  <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="truncate text-gray-800">{r.date} · {r.note || 'Tanpa catatan'}</span><b className={r.type === 'income' ? 'text-blue-700' : 'text-orange-700'}>{rupiah(r.amount)}</b></li>
                ))}
              </ul>
              <div className="mt-6 flex justify-between">
                <GhostButton className="min-h-[40px]" onClick={() => setStep(1)}>Kembali</GhostButton>
                <PrimaryButton className="min-h-[40px] px-6" disabled={!walletId} onClick={run}>Impor {valid.length} transaksi</PrimaryButton>
              </div>
            </>
          )}

          {step === 3 && <p className="py-16 text-center text-sm text-gray-600">Memproses…</p>}

          {step === 4 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700"><Check className="h-7 w-7" /></span>
              <h1 className="mt-4 text-xl font-bold text-gray-900">{imported} transaksi diimpor</h1>
              {skipped > 0 && <p className="mt-1 text-sm text-gray-600">{skipped} baris dilewati karena tanggal atau nominalnya kosong.</p>}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <GhostButton className="min-h-[40px]" onClick={restart}>Impor lagi</GhostButton>
                <Link to="/transactions" className="flex min-h-[40px] items-center rounded-xl bg-blue-700 px-5 text-sm font-semibold text-white">Lihat transaksi</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
