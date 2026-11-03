import { Link } from 'react-router-dom';
import { Mail, MessageCircle, Send, Users } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';

const channels = [
  { key: 'whatsapp', name: 'WhatsApp', Icon: MessageCircle, chip: 'bg-green-100 text-green-700', main: 'bg-green-500 hover:bg-green-600', action: 'Tambah Nomor Personal' },
  { key: 'telegram', name: 'Telegram', Icon: Send, chip: 'bg-blue-100 text-blue-700', main: 'bg-blue-700 hover:bg-blue-800', action: 'Hubungkan Akun Pribadi' },
];

const Heading = ({ children }) => <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">{children}</h3>;

export default function Integrasi() {
  const { integrations, setIntegration, notify } = useStore();
  const connect = (key, name) => {
    const next = !integrations[key];
    setIntegration(key, next);
    notify(next ? `Mode contoh: ${name} ditandai terhubung, tidak ada pesan sungguhan.` : `${name} diputuskan.`);
  };
  return (
    <div className="mx-auto max-w-[896px] px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Integrasi</h1>
      <p className="mt-1 max-w-[640px] text-sm text-gray-600">Versi lokal ini tidak mengirim pesan atau membaca kotak masuk. Toggle di bawah hanya menyimpan preferensi. Untuk email bank, tempel isinya lewat Import.</p>
      <Link to="/import" className="mt-5 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-5 hover:bg-blue-100">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700"><Mail className="h-5 w-5" /></span>
        <span className="min-w-0 flex-1">
          <b className="block text-sm font-semibold text-gray-900">Email bank</b>
          <span className="block text-sm text-gray-600">Salin isi email transaksi, lalu tempel di Import → Tempel teks.</span>
        </span>
        <span className="text-sm font-semibold text-blue-700">Buka →</span>
      </Link>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {channels.map(({ key, name, Icon, chip, main, action }) => {
          const on = integrations[key];
          return (
            <article key={key} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 p-5">
                <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${chip}`}><Icon className="h-5 w-5" /></span>
                <h2 className="flex-1 text-base font-medium text-gray-900">{name}</h2>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${on ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{on ? 'Terhubung' : 'Belum terhubung'}</span>
              </div>
              <div className="divide-y divide-gray-100 px-5">
                <div className="py-5">
                  <Heading>Akun pribadi</Heading>
                  <p className="mt-2 text-sm text-gray-600">{on ? `${name} ditandai terhubung sebagai preferensi.` : `Tandai ${name} sebagai kanal pilihanmu.`}</p>
                </div>
                <div className="py-5">
                  <Heading>Group terhubung</Heading>
                  <p className="mt-2 text-sm italic text-gray-600">{on ? 'Belum ada group.' : 'Hubungkan akun pribadi dulu.'}</p>
                </div>
                <div className="py-5">
                  <Heading>Tambah koneksi</Heading>
                  <button type="button" onClick={() => connect(key, name)} className={`mt-2.5 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white ${main}`}>
                    <Icon className="h-4 w-4" /> {on ? 'Putuskan' : action}
                  </button>
                  <button type="button" disabled={!on} onClick={() => notify('Mode contoh: group tidak benar-benar ditambahkan.')} className="mt-2 flex min-h-[40px] w-full items-center justify-center gap-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:text-gray-400">
                    <Users className="h-4 w-4" /> Tambah Bot ke Group
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
