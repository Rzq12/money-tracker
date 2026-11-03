import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, Check, ClipboardPaste, FileSpreadsheet, Landmark, Trash2, Upload } from 'lucide-react';
import { GhostButton, PrimaryButton, Toggle, inputClass } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { rupiah } from '../../lib/format.js';
import {
  buildPreview, duplicateKey, guess, markDuplicates, parseCSV, parsePasted,
} from '../../lib/importer.js';

const STEPS = ['Sumber', 'Cocokkan', 'Opsi', 'Proses', 'Selesai'];
const FIELDS = [['date', 'Tanggal'], ['note', 'Catatan'], ['amount', 'Nominal'], ['type', 'Jenis (opsional)'], ['category', 'Kategori (opsional)']];
const MAX_ROWS = 10000;
const MAX_BYTES = 10 * 1024 * 1024;

export default function ImportData() {
  const { wallets, categories, transactions, addTransactions, deleteTransaction, notify } = useStore();
  const input = useRef(null);
  const [mode, setMode] = useState('file');
  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState([]);
  const [map, setMap] = useState({});
  const [pasteText, setPasteText] = useState('');
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [fallback, setFallback] = useState('lain-lain');
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [imported, setImported] = useState(0);
  const [skipped, setSkipped] = useState(0);

  const headers = rows[0] || [];
  const body = rows.slice(1);

  const preview = useMemo(() => {
    const parsed = buildPreview({ rows, map, categories });
    const valid = parsed.filter((r) => r.date && r.amount > 0);
    return { valid, checked: markDuplicates(valid, transactions) };
  }, [rows, map, categories, transactions]);

  const duplicates = preview.checked.filter((r) => r.duplicate).length;
  const toImport = skipDuplicates ? preview.checked.filter((r) => !r.duplicate) : preview.checked;

  const existingDuplicates = useMemo(() => {
    const seen = new Set();
    const dupes = [];
    transactions.forEach((t) => {
      const key = duplicateKey(t);
      if (seen.has(key)) dupes.push(t);
      else seen.add(key);
    });
    return dupes;
  }, [transactions]);

  const read = async (file) => {
    setError('');
    if (!file) return;
    if (file.size > MAX_BYTES) { setError('Ukuran file lebih dari 10 MB.'); return; }
    if (/\.pdf$/i.test(file.name)) { setError('PDF belum bisa dibaca langsung. Ekspor mutasi ke CSV dari aplikasi bankmu.'); return; }
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
      setStep(1);
      setMap({
        date: guess(parsed[0], ['tanggal', 'date', 'tgl']),
        note: guess(parsed[0], ['catatan', 'deskripsi', 'keterangan', 'note', 'description']),
        amount: guess(parsed[0], ['nominal', 'jumlah', 'amount', 'mutasi']),
        type: guess(parsed[0], ['jenis', 'tipe', 'type', 'debit', 'kredit', 'dk']),
        category: guess(parsed[0], ['kategori', 'category']),
      });
    } catch {
      setError('File tidak bisa dibaca. Coba simpan ulang lalu unggah lagi.');
    }
  };

  const readPaste = () => {
    setError('');
    const parsed = parsePasted(pasteText);
    if (parsed.rows.length < 2) {
      setError('Belum ada nominal yang terbaca. Pastikan tiap baris berisi satu transaksi.');
      return;
    }
    setRows(parsed.rows);
    setMap(parsed.map);
    setFileName('Tempelan teks');
    setStep(1);
  };

  const run = () => {
    const list = toImport.map((r) => ({
      type: r.type,
      date: r.date,
      note: r.note,
      amount: r.amount,
      walletId,
      excluded: false,
      tags: [],
      categoryId: r.categoryId || (r.type === 'income' ? 'pemasukan-lain' : fallback),
    }));
    setStep(3);
    addTransactions(list);
    setImported(list.length);
    setSkipped(preview.valid.length - list.length);
    setTimeout(() => setStep(4), 400);
    notify(`${list.length} transaksi diimpor.`);
  };

  const restart = () => { setStep(0); setRows([]); setFileName(''); setMap({}); setPasteText(''); setSkipDuplicates(true); };

  const removeDuplicates = () => {
    existingDuplicates.forEach((t) => deleteTransaction(t.id));
    notify(`${existingDuplicates.length} duplikat dihapus.`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/akun" className="flex items-center gap-4"><ArrowLeft className="h-5 w-5 text-gray-600" /><span className="text-lg font-bold text-gray-900">Import Data</span></Link>
      <div className="mt-7 grid gap-6 md:grid-cols-[176px_minmax(0,672px)] md:gap-6">
        <ol className="no-scrollbar flex list-none gap-5 overflow-x-auto p-0 md:block md:space-y-5">
          {STEPS.map((name, i) => (
            <li key={name} className="flex items-center gap-2.5 whitespace-nowrap py-1">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= step ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'} ${i === step ? 'ring-4 ring-blue-100' : ''}`}>{i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
              <span className={`text-sm font-medium ${i === step ? 'text-blue-700' : 'text-gray-600'}`}>{name}</span>
            </li>
          ))}
        </ol>

        <div className="min-w-0">
          {step === 0 && (
            <>
              <h1 className="text-xl font-bold text-gray-900">Import transaksi</h1>
              <p className="mt-1 text-sm text-gray-600">Dari spreadsheet, ekspor aplikasi lain, mutasi bank, atau tempel notifikasi/email.</p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  ['file', 'File Excel / CSV', 'Spreadsheet atau ekspor aplikasi ini.', FileSpreadsheet],
                  ['bank', 'Mutasi bank', 'File CSV mutasi rekening dari bank.', Landmark],
                  ['paste', 'Tempel teks', 'Notifikasi atau email bank, satu baris satu transaksi.', ClipboardPaste],
                ].map(([key, title, text, Icon]) => (
                  <button key={key} type="button" aria-pressed={mode === key} onClick={() => { setMode(key); setError(''); }} className={`flex gap-3 rounded-2xl border-2 p-4 text-left ${mode === key ? 'border-blue-700 bg-white' : 'border-gray-100 bg-white/70 hover:bg-white'}`}>
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${mode === key ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}><Icon className="h-5 w-5" /></span>
                    <span><b className="block text-sm font-semibold text-gray-900">{title}</b><span className="mt-1 block text-xs leading-5 text-gray-600">{text}</span></span>
                  </button>
                ))}
              </div>

              {mode === 'paste' ? (
                <div className="mt-5">
                  <textarea
                    aria-label="Tempel teks transaksi"
                    rows={8}
                    className={`${inputClass} font-mono text-xs`}
                    placeholder={'26/09/2026 QRIS Warung nasi Rp45.000\n27/09/2026 Transfer masuk gaji Rp7.500.000'}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                  />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-xs leading-5 text-gray-500">Tiap baris jadi satu transaksi. Tanggal dan nominal dikenali otomatis.</p>
                    <PrimaryButton disabled={!pasteText.trim()} onClick={readPaste}>Baca teks →</PrimaryButton>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
                  onDragLeave={() => setDrag(false)}
                  onDrop={(e) => { e.preventDefault(); setDrag(false); read(e.dataTransfer.files[0]); }}
                  className={`mt-5 flex min-h-[240px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center ${drag ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                >
                  <Upload className="h-9 w-9 text-gray-300" />
                  {fileName ? <p className="mt-3 text-sm font-semibold text-gray-900">{fileName} · {body.length} baris</p> : <p className="mt-3 text-sm font-semibold text-gray-700">Drag &amp; drop file di sini</p>}
                  <p className="mt-1 text-xs text-gray-500">atau</p>
                  <PrimaryButton className="mt-3" onClick={() => input.current.click()}>Pilih File</PrimaryButton>
                  <input ref={input} type="file" accept=".csv,.xlsx" className="hidden" aria-label="Pilih file" onChange={(e) => { read(e.target.files[0]); e.target.value = ''; }} />
                  <p className="mt-5 text-xs text-gray-500">Mendukung .csv · .xlsx · Maks. 10 MB · 10.000 baris</p>
                </div>
              )}
              {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}

              {transactions.length > 0 && (
                <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4">
                  <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900"><AlertTriangle className="h-4 w-4 text-amber-600" /> Data ganda</h2>
                  <p className="mt-1 text-xs leading-5 text-gray-600">
                    {existingDuplicates.length === 0
                      ? 'Tidak ada transaksi yang tampak ganda.'
                      : `${existingDuplicates.length} transaksi punya tanggal, nominal, dan catatan yang sama dengan transaksi lain.`}
                  </p>
                  {existingDuplicates.length > 0 && (
                    <button type="button" onClick={removeDuplicates} className="mt-3 inline-flex min-h-[36px] items-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Hapus duplikat</button>
                  )}
                </div>
              )}
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-gray-900">Cocokkan kolom</h1>
              <p className="mt-1 text-sm text-gray-600">{fileName} · {body.length} baris. Pilih kolom di file yang berisi tiap data.</p>
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
              <p className="mt-3 text-sm text-gray-600">{preview.valid.length} dari {body.length} baris siap diimpor.{duplicates > 0 ? ` ${duplicates} terlihat ganda.` : ''}</p>
              <div className="mt-6 flex justify-between">
                <GhostButton className="min-h-[40px]" onClick={() => setStep(0)}>Kembali</GhostButton>
                <PrimaryButton className="min-h-[40px] px-6" disabled={!preview.valid.length} onClick={() => setStep(2)}>Lanjut →</PrimaryButton>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-xl font-bold text-gray-900">Dompet &amp; duplikat</h1>
              <p className="mt-1 text-sm text-gray-600">Semua baris masuk ke dompet yang dipilih. Kategori tanpa kecocokan memakai kategori bawaan.</p>
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
              <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3">
                <span><b className="block text-sm font-semibold text-gray-900">Lewati transaksi ganda</b><span className="text-xs text-gray-500">{duplicates} baris punya padanan di catatanmu</span></span>
                <Toggle label="Lewati transaksi ganda" checked={skipDuplicates} onChange={setSkipDuplicates} />
              </div>
              <p className="mt-3 text-sm font-medium text-gray-700">{toImport.length} transaksi akan diimpor.</p>
              <ul className="mt-3 list-none divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white p-0 text-sm">
                {toImport.slice(0, 6).map((r, i) => (
                  <li key={`${r.date}-${i}`} className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="truncate text-gray-800">{r.date} · {r.note || 'Tanpa catatan'}</span><b className={r.type === 'income' ? 'text-blue-700' : 'text-orange-700'}>{rupiah(r.amount)}</b></li>
                ))}
              </ul>
              <div className="mt-6 flex justify-between">
                <GhostButton className="min-h-[40px]" onClick={() => setStep(1)}>Kembali</GhostButton>
                <PrimaryButton className="min-h-[40px] px-6" disabled={!walletId || !toImport.length} onClick={run}>Impor {toImport.length} transaksi</PrimaryButton>
              </div>
            </>
          )}

          {step === 3 && <p className="py-16 text-center text-sm text-gray-600">Memproses…</p>}

          {step === 4 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-700"><Check className="h-7 w-7" /></span>
              <h1 className="mt-4 text-xl font-bold text-gray-900">{imported} transaksi diimpor</h1>
              {skipped > 0 && <p className="mt-1 text-sm text-gray-600">{skipped} baris dilewati karena tanggal/nominal kosong atau terdeteksi ganda.</p>}
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
