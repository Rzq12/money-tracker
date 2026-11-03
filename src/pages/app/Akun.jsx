import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, CalendarClock, ChevronRight, CircleHelp, Crown, Download, FileText, Flag, HardDrive,
  Handshake, LineChart, LogOut, MessageSquare, Plug, RotateCcw, Shapes, SlidersHorizontal,
  Sparkles, Upload, UserRound, Users, Wallet, MessageCircle,
} from 'lucide-react';
import { GhostButton, Modal, PrimaryButton, inputClass } from '../../components/ui.jsx';
import { findCategory, useStore } from '../../lib/store.jsx';
import { BRAND } from '../../lib/seed.js';
import { downloadText, toCSV } from '../../lib/format.js';

const rowClass = 'flex min-h-[61px] w-full items-center gap-3 px-4 text-left hover:bg-gray-50';

const Row = ({ to, onClick, icon: Icon, label, value, danger }) => {
  const inner = (
    <>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50"><Icon className={`h-5 w-5 ${danger ? 'text-red-600' : 'text-gray-700'}`} /></span>
      <span className={`flex-1 text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-900'}`}>{label}</span>
      {value && <span className="text-sm text-gray-500">{value}</span>}
      <ChevronRight className="h-4 w-4 text-gray-500" />
    </>
  );
  return to ? <Link to={to} className={rowClass}>{inner}</Link> : <button type="button" onClick={onClick} className={rowClass}>{inner}</button>;
};

const Group = ({ title, children }) => (
  <section className="mt-7">
    {title && <h2 className="mb-2.5 px-1 text-xs font-semibold tracking-wide text-gray-600">{title}</h2>}
    <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">{children}</div>
  </section>
);

export default function Akun() {
  const { user, startDay, transactions, categories, wallets, features, logout, notify } = useStore();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState(false);
  const [message, setMessage] = useState('');

  const exportAll = () => {
    const rows = [
      ['Tanggal', 'Jenis', 'Kategori', 'Dompet', 'Catatan', 'Nominal', 'Tag'],
      ...transactions.map((t) => [
        t.date, t.type, findCategory(categories, t.categoryId).name,
        wallets.find((w) => w.id === t.walletId)?.name || '', t.note, t.amount, (t.tags || []).join(' '),
      ]),
    ];
    downloadText(`${BRAND}-transaksi.csv`, toCSV(rows));
    notify('Data transaksi diunduh.');
  };

  return (
    <div className="mx-auto max-w-[560px] px-4 py-10">
      <h1 className="mb-5 text-2xl font-bold text-gray-900">Akun</h1>
      <Link to="/akun/profil" className="block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:border-blue-200">
        <div className="flex items-center gap-4 p-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-base font-semibold text-gray-700">{user.name.slice(0, 1)}</span>
          <span className="min-w-0 flex-1"><b className="block truncate text-lg font-bold text-gray-900">{user.name}</b><span className="block truncate text-sm text-gray-600">{user.email || 'Belum ada email'}</span></span>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3.5 text-sm">
          <span className="flex items-center gap-2 text-gray-700"><Crown className="h-4 w-4 text-orange-500" /> {BRAND} pribadi</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-gray-500"><UserRound className="h-3.5 w-3.5" /> Edit profil</span>
        </div>
      </Link>

      <Group title="FITUR">
        {features.tujuan && <Row to="/tujuan" icon={Flag} label="Tujuan keuangan" />}
        {features.portofolio && <Row to="/portofolio" icon={LineChart} label="Portofolio" />}
        {features.berulang && <Row to="/berulang" icon={CalendarClock} label="Transaksi berulang" />}
        {features.aturan && <Row to="/aturan" icon={Sparkles} label="Aturan otomatis" />}
        {features.split && <Row to="/split" icon={Users} label="Split bill" />}
        {features.hutang && <Row to="/debt" icon={Handshake} label="Hutang piutang" />}
        {features.chat && <Row to="/chat" icon={MessageCircle} label="Chat pencatat" />}
      </Group>

      <Group title="PENGATURAN">
        <Row to="/akun/fitur" icon={SlidersHorizontal} label="Atur fitur" />
        <Row to="/pengaturan?tab=dompet" icon={Wallet} label="Dompet" />
        <Row to="/pengaturan?tab=kategori" icon={Shapes} label="Kategori" />
        <Row to="/pengaturan?tab=mata-uang" icon={Download} label="Kurs mata uang" />
        <Row to="/pengaturan?tab=tanggal" icon={Calendar} label="Awal bulan" value={`Tanggal ${startDay >= 28 ? 'akhir' : startDay}`} />
      </Group>

      <Group title="DATA">
        <Row to="/backup" icon={HardDrive} label="Backup & pemulihan" />
        <Row to="/integrasi" icon={Plug} label="Integrasi" />
        <Row to="/import" icon={Upload} label="Import data" />
        <Row onClick={exportAll} icon={Download} label="Ekspor transaksi (CSV)" value={`${transactions.length} baris`} />
        <Row to="/pengaturan?tab=reset" icon={RotateCcw} label="Reset data" />
      </Group>

      <Group title="BANTUAN">
        <Row to="/panduan" icon={CircleHelp} label="Pertanyaan umum" />
        <Row onClick={() => setFeedback(true)} icon={MessageSquare} label="Kirim saran" />
        <Row to="/kebijakan-privasi" icon={FileText} label="Privasi & ketentuan" />
      </Group>

      <Group>
        <Row onClick={() => { logout(); navigate('/masuk'); }} icon={LogOut} label="Keluar" danger />
      </Group>

      {feedback && (
        <Modal title="Kirim saran" onClose={() => setFeedback(false)}>
          <h2 className="text-lg font-bold text-gray-900">Kirim saran</h2>
          <p className="mt-1 text-sm text-gray-600">Ceritakan apa yang bisa dibuat lebih baik.</p>
          <textarea aria-label="Saran" rows={4} className={`${inputClass} mt-4`} value={message} onChange={(e) => setMessage(e.target.value)} />
          <div className="mt-4 flex justify-end gap-3">
            <GhostButton onClick={() => setFeedback(false)}>Batal</GhostButton>
            <PrimaryButton
              disabled={!message.trim()}
              onClick={() => {
                setFeedback(false);
                setMessage('');
                notify('Saran disimpan di perangkat ini. Isinya tidak dikirim ke mana pun.');
              }}
            >
              Kirim
            </PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  );
}
