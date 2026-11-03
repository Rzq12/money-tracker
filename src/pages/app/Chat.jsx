import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store.jsx';
import { understand } from '../../lib/parse.js';
import { rupiah } from '../../lib/format.js';
import { BRAND, uid } from '../../lib/seed.js';

export default function Chat() {
  const { chat, setChat, wallets, transactions, saveTransaction, categories } = useStore();
  const [text, setText] = useState('');
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'nearest' });
  }, [chat]);

  const push = (items) => setChat([...chat, ...items]);

  const send = () => {
    const value = text.trim();
    if (!value) return;
    const result = understand(value, { wallets, transactions });
    const mine = { id: uid('m'), from: 'me', text: value };
    if (result.pending) {
      push([mine, { id: uid('m'), from: 'bot', pending: result.pending }]);
    } else {
      push([mine, { id: uid('m'), from: 'bot', text: result.reply }]);
    }
    setText('');
  };

  const answer = (message, yes) => {
    if (yes) saveTransaction(message.pending);
    setChat(chat.map((m) => (m.id === message.id ? { ...m, pending: null, text: yes ? `✅ Tersimpan: ${message.pending.note} ${rupiah(message.pending.amount)}` : '❌ Dibatalkan.' } : m)));
  };

  const categoryName = (id) => categories.find((c) => c.id === id)?.name || 'Lain-lain';
  const walletName = (id) => wallets.find((w) => w.id === id)?.name;

  return (
    <div className="mx-auto flex h-[calc(100vh-69px)] max-w-[672px] flex-col border-x border-gray-100 bg-gray-50 max-md:h-[calc(100vh-133px)]">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div><h1 className="text-base font-semibold capitalize text-gray-900">Chat {BRAND}</h1><p className="text-xs text-gray-500">Asisten pencatat sederhana</p></div>
        <button type="button" aria-label="Hapus riwayat" title="Hapus riwayat" onClick={() => setChat([])} className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><Trash2 className="h-[18px] w-[18px]" /></button>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {chat.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="text-[44px] leading-[52px]" aria-hidden="true">💬</span>
            <h2 className="mt-3 text-lg font-semibold text-gray-800">Halo! Mau catat apa hari ini?</h2>
            <p className="mt-2 max-w-[320px] text-sm leading-5 text-gray-600">Ketik transaksi seperti <b>"makan siang 25rb"</b>, atau tanya saldo.</p>
          </div>
        )}
        {chat.map((m) => (
          <div key={m.id} className={`flex ${m.from === 'me' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm ${m.from === 'me' ? 'bg-blue-700 text-white' : 'border border-gray-100 bg-white text-gray-800'}`}>
              {m.pending ? (
                <>
                  <b className="block">Konfirmasi Transaksi</b>
                  <span className="mt-1 block">{m.pending.note} · {rupiah(m.pending.amount)}</span>
                  <span className="block text-xs text-gray-500">{categoryName(m.pending.categoryId)} · {walletName(m.pending.walletId)}</span>
                  <span className="mt-2 flex gap-2">
                    <button type="button" onClick={() => answer(m, true)} className="min-h-[36px] rounded-lg bg-blue-700 px-3 text-xs font-semibold text-white">✅ Ya</button>
                    <button type="button" onClick={() => answer(m, false)} className="min-h-[36px] rounded-lg bg-gray-100 px-3 text-xs font-semibold text-gray-700">❌ Tidak</button>
                  </span>
                </>
              ) : m.text}
            </div>
          </div>
        ))}
        {transactions.length > 0 && chat.some((m) => m.text?.startsWith('✅')) && <p className="text-center text-xs text-gray-500"><Link to="/transactions" className="font-semibold text-blue-700">Lihat di Transaksi</Link></p>}
        <div ref={end} />
      </div>
      <div className="flex items-end gap-3 border-t border-gray-200 bg-white p-3">
        <textarea
          aria-label="Ketik pesan"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ketik pesan... (Enter kirim, Shift+Enter baris baru)"
          className="min-h-[44px] flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none"
        />
        <button type="button" aria-label="Kirim" disabled={!text.trim()} onClick={send} className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white disabled:bg-blue-300"><Send className="h-5 w-5" /></button>
      </div>
    </div>
  );
}
