import { parseAmount, today } from './format.js';
import { walletBalance } from './money.js';

const KEYWORDS = [
  [/kopi|makan|minum|jajan|nasi|bakso|sarapan|warung|resto/, 'makan'],
  [/bensin|ojek|ojol|grab|taksi|parkir|tol|kereta|bus/, 'transportasi'],
  [/listrik|internet|pulsa|air|tagihan|wifi/, 'tagihan'],
  [/belanja|baju|sepatu/, 'belanja'],
  [/sayur|sembako|groceries|pasar/, 'groceries'],
  [/nonton|game|film|hiburan/, 'hiburan'],
  [/obat|dokter|vitamin|sakit/, 'kesehatan'],
  [/kursus|buku|sekolah/, 'pendidikan'],
];
const INCOME = /gaji|bonus|terima|dapat|masuk|honor|transferan|refund|cashback/i;

export const parseEntry = (text) => {
  const lower = String(text || '').toLowerCase();
  const amount = parseAmount(lower);
  if (!amount) return null;
  const income = INCOME.test(lower);
  const hit = KEYWORDS.find(([re]) => re.test(lower));
  const note = String(text)
    .replace(/(\d+(?:[.,]\d+)*)\s*(rb|ribu|k|jt|juta)?\b/i, '')
    .replace(/\bpakai\b.*$/i, '')
    .replace(/[|;,]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    type: income ? 'income' : 'expense',
    categoryId: income ? 'pemasukan-lain' : hit?.[1] || 'lain-lain',
    amount,
    note: note || (income ? 'Pemasukan' : 'Pengeluaran'),
    date: today(),
    excluded: false,
  };
};

/** Chat's rule-based reader. The original app used an AI service for this. */
export const understand = (text, { wallets, transactions }) => {
  const lower = String(text || '').toLowerCase();
  if (/saldo|balance/.test(lower)) {
    const list = wallets.map((w) => `${w.name}: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(walletBalance(w, transactions))}`).join('\n');
    return { reply: `Saldo kamu saat ini:\n${list}` };
  }
  const entry = parseEntry(text);
  if (!entry) return { reply: 'Aku belum paham. Coba tulis seperti "makan siang 25rb" atau tanya "saldo".' };
  const wallet = wallets.find((w) => lower.includes(w.name.toLowerCase())) || wallets[0];
  return { pending: { ...entry, walletId: wallet?.id } };
};
