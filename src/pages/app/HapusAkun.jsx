import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../public/PublicLayout.jsx';
import { Confirm } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';
import { BRAND, CONTACT_EMAIL } from '../../lib/seed.js';

export default function HapusAkun() {
  const { loggedIn, deleteAccount, user, transactions, goals, holdings } = useStore();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);
  const [name, setName] = useState('');
  const matches = name.trim() === String(user.name || '').trim() && name.trim().length > 0;

  return (
    <PublicLayout crumb="Hapus akun" title={`Hapus akun · ${BRAND}`} description="Hapus semua data uangku di perangkat ini.">
      <section className="wrap pb-20 pt-12">
        <div className="mx-auto max-w-[640px] rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Hapus semua data</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">Semua catatan disimpan di browser ini. Menghapus akun berarti menghapus data itu permanen dari perangkat ini. Tidak ada salinan di server mana pun.</p>

          {loggedIn ? (
            <>
              <dl className="mt-5 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-4 text-center">
                <div><dt className="text-xs text-gray-500">Transaksi</dt><dd className="text-lg font-bold text-gray-900">{transactions.length}</dd></div>
                <div><dt className="text-xs text-gray-500">Tujuan</dt><dd className="text-lg font-bold text-gray-900">{goals.length}</dd></div>
                <div><dt className="text-xs text-gray-500">Aset</dt><dd className="text-lg font-bold text-gray-900">{holdings.length}</dd></div>
              </dl>
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                Sebelum menghapus, unduh backup di menu <Link to="/backup" className="font-semibold underline">Backup &amp; pemulihan</Link> supaya bisa dipulihkan nanti.
              </p>
              <label htmlFor="del-name" className="mt-6 block text-sm font-semibold text-gray-700">Ketik namamu untuk konfirmasi</label>
              <p className="mt-1 text-xs text-gray-500">Ketik persis: <b className="text-gray-800">{user.name}</b></p>
              <input id="del-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={user.name} className="mt-1.5 min-h-[46px] w-full rounded-xl border border-gray-200 px-4 text-sm focus:border-blue-500 focus:outline-none" autoComplete="off" />
              <button type="button" disabled={!matches} onClick={() => setConfirm(true)} className="mt-5 min-h-[46px] w-full rounded-xl bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-red-300">Hapus permanen</button>
            </>
          ) : (
            <div className="mt-6 rounded-xl bg-gray-50 p-5 text-sm text-gray-700">
              Kamu belum masuk. Data hanya ada saat kamu membuka aplikasi ini di browser yang sama.
              <Link to="/masuk" className="mt-3 block font-semibold text-blue-700">Masuk →</Link>
            </div>
          )}
          <p className="mt-6 text-xs text-gray-500">Ada pertanyaan tentang penghapusan data? Hubungi <a className="text-blue-700" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></p>
        </div>
      </section>
      {confirm && (
        <Confirm
          title="Hapus semua data sekarang?"
          text={`Data milik ${user.name} akan hilang dari browser ini dan tidak bisa dikembalikan.`}
          confirmLabel="Hapus permanen"
          onCancel={() => setConfirm(false)}
          onConfirm={() => { deleteAccount(); navigate('/masuk'); }}
        />
      )}
    </PublicLayout>
  );
}
