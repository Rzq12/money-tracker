import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Card, Label, PageTitle, PrimaryButton, inputClass } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { BRAND } from '../../lib/seed.js';

export default function Profil() {
  const { user, saveProfile, notify } = useStore();
  const [form, setForm] = useState({ name: user.name || '', email: user.email || '' });
  const [saved, setSaved] = useState(false);
  const set = (key, value) => { setSaved(false); setForm((f) => ({ ...f, [key]: value })); };
  const dirty = form.name.trim() !== (user.name || '') || form.email.trim() !== (user.email || '');

  return (
    <div className="mx-auto max-w-2xl px-4 py-7 sm:px-6 lg:px-8">
      <Link to="/akun" className="flex items-center gap-3 text-sm font-semibold text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Akun</Link>
      <PageTitle title="Profil" subtitle="Nama ini hanya dipakai untuk menyapa kamu di dalam aplikasi." />

      <Card>
        <div className="space-y-5">
          <div>
            <Label htmlFor="profile-name">Nama</Label>
            <input id="profile-name" className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Nama kamu" />
          </div>
          <div>
            <Label htmlFor="profile-email">Email <span className="font-normal normal-case">(opsional)</span></Label>
            <input id="profile-email" type="email" className={inputClass} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="nama@contoh.com" />
            <p className="mt-1.5 text-xs text-gray-500">Tidak dikirim ke mana pun. Hanya tersimpan di perangkat ini.</p>
          </div>
          <div className="flex items-center gap-3">
            <PrimaryButton
              disabled={!form.name.trim() || !dirty}
              onClick={() => {
                saveProfile({ name: form.name.trim(), email: form.email.trim() });
                notify('Profil disimpan.');
                setSaved(true);
              }}
            >
              Simpan
            </PrimaryButton>
            {saved && <span className="flex items-center gap-1 text-sm font-medium text-green-700"><Check className="h-4 w-4" /> Tersimpan</span>}
          </div>
        </div>
      </Card>

      <p className="mt-5 text-xs leading-5 text-gray-500">Kamu memakai {BRAND} tanpa akun server. Semua data tersimpan di browser ini; gunakan menu Backup untuk memindahkannya ke perangkat lain.</p>
    </div>
  );
}
