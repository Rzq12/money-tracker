import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../public/PublicLayout.jsx';
import { Confirm } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { BRAND, CONTACT_EMAIL } from '../../lib/seed.js';

export default function HapusAkun() {
  const { loggedIn, deleteAccount, user } = useStore();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState('');
  return (
    <PublicLayout crumb="Hapus akun" title={`Hapus akun · ${BRAND}`} description="Permintaan penghapusan akun.">
      <section className="wrap pb-20 pt-12">
        <div className="mx-auto max-w-[640px] rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Permintaan Penghapusan Akun</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">Kamu memegang kendali penuh atas datamu. Di versi contoh ini, semua data hanya ada di browser ini dan langsung terhapus.</p>
          {loggedIn ? (
            <>
              <label htmlFor="del-name" className="mt-6 block text-sm font-semibold text-gray-700">Nama Lengkap</label>
              <input id="del-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={user.name} className="mt-1.5 w-full min-h-[46px] rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none" />
              <button type="button" disabled={!name.trim()} onClick={() => setConfirm(true)} className="mt-5 min-h-[46px] w-full rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300">Kirim Permintaan Penghapusan</button>
            </>
          ) : (
            <div className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-700">
              Untuk melanjutkan permintaan penghapusan akun, kamu perlu masuk terlebih dahulu.
              <Link to="/masuk" className="mt-3 block font-semibold text-blue-700">Masuk →</Link>
            </div>
          )}
          <p className="mt-6 text-xs text-gray-500">Ada pertanyaan tentang penghapusan data? Hubungi kami di <a className="text-blue-700" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        </div>
      </section>
      {confirm && <Confirm title="Hapus akun ini?" text="Semua catatan di browser ini akan hilang dan tidak bisa dikembalikan." onCancel={() => setConfirm(false)} onConfirm={() => { deleteAccount(); navigate('/masuk'); }} />}
    </PublicLayout>
  );
}
