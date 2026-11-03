import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Card, Confirm, Drawer, Label, PageTitle, PrimaryButton, Segmented, Toggle, inputClass } from '../../components/ui.jsx';
import { findCategory, useStore } from '../../lib/store.jsx';
import { applyRules } from '../../lib/rules.js';

function RuleForm({ rule, onClose }) {
  const { categories, saveRule, notify } = useStore();
  const [type, setType] = useState(rule?.type || 'expense');
  const [form, setForm] = useState({
    keyword: rule?.keyword || '',
    categoryId: rule?.categoryId || '',
  });
  const list = categories.filter((c) => c.type === type);
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  return (
    <Drawer
      title={rule ? 'Edit aturan' : 'Aturan otomatis baru'}
      onClose={onClose}
      footer={(
        <PrimaryButton
          className="min-h-[44px] w-full"
          disabled={!form.keyword.trim() || !form.categoryId}
          onClick={() => {
            saveRule({ ...rule, keyword: form.keyword.trim().toLowerCase(), categoryId: form.categoryId, type, active: rule ? rule.active !== false : true });
            notify(rule ? 'Aturan diperbarui.' : 'Aturan dibuat.');
            onClose();
          }}
        >
          {rule ? 'Simpan Perubahan' : 'Simpan'}
        </PrimaryButton>
      )}
    >
      <Segmented options={[['expense', 'Pengeluaran'], ['income', 'Pemasukan']]} value={type} onChange={(next) => { setType(next); set('categoryId', ''); }} />
      <div className="mt-5 space-y-5">
        <div>
          <Label htmlFor="rule-keyword">Kata kunci di catatan</Label>
          <input id="rule-keyword" className={inputClass} placeholder="contoh: kopi, grab, listrik" value={form.keyword} onChange={(e) => set('keyword', e.target.value)} />
          <p className="mt-1.5 text-xs text-gray-500">Tidak peka huruf besar/kecil. Cocok kalau catatan mengandung kata ini.</p>
        </div>
        <div>
          <Label htmlFor="rule-category">Kategori</Label>
          <select id="rule-category" className={inputClass} value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            <option value="">— Pilih —</option>
            {list.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <p className="text-xs leading-5 text-gray-500">Aturan dipakai saat transaksi dicatat tanpa kategori, atau dengan kategori Lain-lain.</p>
      </div>
    </Drawer>
  );
}

export default function Aturan() {
  const { rules, categories, deleteRule, saveRule, notify } = useStore();
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [sample, setSample] = useState('');

  const catName = (id) => findCategory(categories, id).name;
  const preview = useMemo(() => {
    if (!sample.trim()) return null;
    return applyRules(rules, sample, 'lain-lain', 'expense');
  }, [rules, sample]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/akun" className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Akun</Link>
      <PageTitle
        title="Aturan otomatis"
        subtitle="Isi kategori sendiri berdasarkan kata kunci di catatan."
        right={<PrimaryButton onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Tambah aturan</PrimaryButton>}
      />

      <Card className="mb-5 bg-blue-50/60">
        <h2 className="flex items-center gap-2 text-sm font-bold text-gray-900"><Sparkles className="h-4 w-4 text-blue-700" /> Coba aturan</h2>
        <input aria-label="Contoh catatan" className={`${inputClass} mt-3`} placeholder="Tulis catatan, misalnya: kopi susu 25rb" value={sample} onChange={(e) => setSample(e.target.value)} />
        <p className="mt-2 text-sm text-gray-600">
          {sample.trim() ? <>Kategori yang terpilih: <b className="text-gray-900">{catName(preview)}</b></> : 'Hasil akan muncul di sini.'}
        </p>
      </Card>

      {rules.length === 0 ? (
        <Card className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700"><Sparkles className="h-7 w-7" /></span>
          <h2 className="mt-4 text-lg font-bold text-gray-900">Belum ada aturan</h2>
          <p className="mx-auto mt-1 max-w-[420px] text-sm text-gray-600">Buat aturan supaya transaksi impor dan transaksi berulang langsung masuk kategori yang tepat.</p>
          <PrimaryButton className="mt-5" onClick={() => setEditing({})}><Plus className="h-4 w-4" /> Tambah aturan</PrimaryButton>
        </Card>
      ) : (
        <ul className="list-none divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-sm">
          {rules.map((rule) => (
            <li key={rule.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <button type="button" onClick={() => setEditing(rule)} className="min-w-0 flex-1 text-left">
                <b className="block truncate text-sm font-semibold text-gray-900">“{rule.keyword}”</b>
                <span className="block truncate text-xs text-gray-500">{rule.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} → {catName(rule.categoryId)}</span>
              </button>
              <Toggle label={`Aktifkan aturan ${rule.keyword}`} checked={rule.active !== false} onChange={(v) => saveRule({ ...rule, active: v })} />
              <button type="button" aria-label={`Hapus aturan ${rule.keyword}`} onClick={() => setRemoving(rule)} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}

      {editing && <RuleForm rule={editing.id ? editing : null} onClose={() => setEditing(null)} />}
      {removing && <Confirm title={`Hapus aturan “${removing.keyword}”?`} text="Transaksi yang sudah tercatat tidak berubah." onCancel={() => setRemoving(null)} onConfirm={() => { deleteRule(removing.id); notify('Aturan dihapus.'); setRemoving(null); }} />}
    </div>
  );
}
