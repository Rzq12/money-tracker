import { Link } from 'react-router-dom';
import { ArrowLeft, Camera, Flag, Handshake, MessageCircle, Tag, Target } from 'lucide-react';
import { Toggle } from '../../components/ui.jsx';
import { useStore } from '../../lib/store.jsx';

const items = [
  ['chat', 'Chat', 'Catat lewat chat.', MessageCircle],
  ['struk', 'Foto struk', 'Isi nominal dari foto struk.', Camera],
  ['hutang', 'Hutang piutang', 'Catat siapa berutang dan jatuh temponya.', Handshake],
  ['tujuan', 'Tujuan keuangan', 'Menabung untuk satu tujuan.', Flag],
  ['anggaran', 'Anggaran', 'Batas belanja per bulan.', Target],
  ['tag', 'Tag', 'Kelompokkan catatan, misalnya satu liburan.', Tag],
];

export default function AturFitur() {
  const { features, setFeature } = useStore();
  return (
    <div className="mx-auto max-w-[654px] px-4 py-10">
      <Link to="/akun" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700"><ArrowLeft className="h-4 w-4" /> Akun</Link>
      <h1 className="mt-5 text-2xl font-bold text-gray-900">Fitur</h1>
      <p className="mt-1 text-sm text-gray-600">Yang dimatikan disembunyikan, datanya tetap aman.</p>
      <ul className="mt-6 list-none divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-sm">
        {items.map(([key, name, text, Icon]) => (
          <li key={key} className="flex min-h-[73px] items-center gap-3.5 px-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50"><Icon className="h-5 w-5 text-gray-700" /></span>
            <span className="min-w-0 flex-1"><b className="block text-sm font-medium text-gray-900">{name}</b><span className="block text-xs text-gray-600">{text}</span></span>
            <Toggle label={name} checked={features[key]} onChange={(v) => setFeature(key, v)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
