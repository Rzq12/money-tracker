import { addDays, addMonths, monthKey, today } from './format.js';
import { DEFAULT_RATES } from './money.js';

export const BRAND = 'uangku';
export const COMPANY = 'Catatan Keuangan Pribadi';
export const CONTACT_EMAIL = 'halo@uangku.app';
export const ADDRESS = 'Data tersimpan di perangkatmu sendiri.';

let counter = 0;
export const uid = (prefix = 'id') => `${prefix}-${Date.now().toString(36)}-${(counter += 1)}`;

const expense = (id, name, icon, group, children = []) => ({ id, name, icon, type: 'expense', group, children });
const income = (id, name, icon) => ({ id, name, icon, type: 'income', group: 'none', children: [] });
const sub = (id, name) => ({ id, name });

export const defaultCategories = () => [
  expense('belanja', 'Belanja', '🛍️', 'wants', [sub('baju', 'Baju'), sub('belanja-online', 'Belanja Online'), sub('gadget', 'Gadget/Elektronik')]),
  expense('groceries', 'Groceries', '🧺', 'needs'),
  expense('hiburan', 'Hiburan', '🎮', 'wants'),
  expense('hutang-piutang', 'Hutang Piutang', '🤝', 'none', [sub('bayar-hutang', 'Bayar Hutang'), sub('beri-pinjaman', 'Beri Pinjaman')]),
  expense('investasi', 'Investasi', '📈', 'savings', [sub('emas', 'Emas'), sub('reksadana', 'Reksadana'), sub('saham', 'Saham'), sub('tabungan', 'Tabungan')]),
  expense('keluarga', 'Keluarga', '👪', 'needs'),
  expense('kesehatan', 'Kesehatan', '❤️', 'needs'),
  expense('lain-lain', 'Lain-lain', '📦', 'wants'),
  expense('makan', 'Makan dan Minum', '🍜', 'needs', [sub('jajan', 'Jajan'), sub('online-delivery', 'Online Delivery'), sub('restoran', 'Restoran')]),
  expense('pekerjaan', 'Pekerjaan', '💼', 'needs'),
  expense('pendidikan', 'Pendidikan', '📚', 'needs'),
  expense('pinjaman', 'Pinjaman', '🗓️', 'needs', [sub('cicilan-mobil', 'Cicilan Mobil'), sub('cicilan-rumah', 'Cicilan Rumah'), sub('hutang', 'Hutang')]),
  expense('sedekah', 'Sedekah', '🤲', 'wants', [sub('infaq', 'Infaq'), sub('sumbangan', 'Sumbangan'), sub('zakat', 'Zakat')]),
  expense('tagihan', 'Tagihan', '⚡', 'needs', [sub('air', 'Air'), sub('gas', 'Gas'), sub('internet', 'Internet'), sub('kartu-kredit', 'Kartu Kredit'), sub('listrik', 'Listrik'), sub('pulsa', 'Pulsa dan Paket Data'), sub('tv-kabel', 'TV Kabel')]),
  expense('transportasi', 'Transportasi', '🚗', 'needs', [sub('bensin', 'Bensin'), sub('parkir', 'Parkir'), sub('ojol', 'Taxi/Ojol')]),
  income('gaji', 'Gaji', '💰'),
  income('bonus', 'Bonus', '🎁'),
  income('hasil-investasi', 'Hasil Investasi', '📊'),
  income('freelance', 'Freelance', '🧑‍💻'),
  income('pemasukan-lain', 'Pemasukan Lain', '💵'),
];

export const defaultWallets = () => [
  { id: 'w-bank-a', name: 'Rekening Utama', type: 'Tabungan', color: '#01478a', initial: 0, currency: 'IDR' },
  { id: 'w-bank-b', name: 'Tabungan', type: 'Tabungan', color: '#0288d1', initial: 0, currency: 'IDR' },
  { id: 'w-cash', name: 'Tunai', type: 'Tunai', color: '#4caf50', initial: 0, currency: 'IDR' },
];

export const sampleWallets = () => [
  { id: 'w-bank-a', name: 'Rekening Utama', type: 'Tabungan', color: '#01478a', initial: 2500000, currency: 'IDR' },
  { id: 'w-bank-b', name: 'Tabungan', type: 'Tabungan', color: '#0288d1', initial: 1200000, currency: 'IDR' },
  { id: 'w-cash', name: 'Tunai', type: 'Tunai', color: '#4caf50', initial: 400000, currency: 'IDR' },
];

const sampleRows = [
  [0, 'expense', 'makan', 'Warung nasi', 45000, 'w-bank-a', ['makan']],
  [0, 'expense', 'makan', 'Kopi pagi', 28000, 'w-cash', ['kopi']],
  [1, 'expense', 'transportasi', 'Bensin', 150000, 'w-bank-a', []],
  [1, 'expense', 'groceries', 'Belanja mingguan', 320000, 'w-bank-b', ['rumah']],
  [2, 'income', 'freelance', 'Proyek desain', 750000, 'w-bank-a', ['kerja']],
  [2, 'expense', 'hiburan', 'Nonton film', 75000, 'w-bank-b', ['akhir-pekan']],
  [3, 'expense', 'tagihan', 'Listrik', 280000, 'w-bank-a', ['rumah']],
  [4, 'expense', 'kesehatan', 'Vitamin', 95000, 'w-bank-b', []],
  [5, 'expense', 'makan', 'Makan malam keluarga', 210000, 'w-bank-a', ['keluarga']],
  [6, 'expense', 'belanja', 'Kemeja kerja', 185000, 'w-bank-b', ['kerja']],
  [8, 'expense', 'transportasi', 'Ojek ke kantor', 32000, 'w-cash', []],
  [9, 'expense', 'tagihan', 'Internet rumah', 350000, 'w-bank-a', ['rumah']],
  [11, 'expense', 'makan', 'Makan siang', 38000, 'w-cash', []],
  [14, 'expense', 'pendidikan', 'Kursus daring', 250000, 'w-bank-b', ['belajar']],
  [18, 'income', 'gaji', 'Gaji bulanan', 7500000, 'w-bank-a', ['gaji']],
  [19, 'expense', 'investasi', 'Reksadana rutin', 1000000, 'w-bank-a', ['investasi']],
  [22, 'expense', 'groceries', 'Belanja bulanan', 640000, 'w-bank-b', ['rumah']],
  [25, 'expense', 'keluarga', 'Kirim untuk orang tua', 1000000, 'w-bank-a', ['keluarga']],
  [29, 'expense', 'makan', 'Restoran akhir pekan', 265000, 'w-bank-b', ['akhir-pekan']],
  [33, 'expense', 'transportasi', 'Servis motor', 420000, 'w-bank-a', []],
  [38, 'expense', 'tagihan', 'Listrik', 265000, 'w-bank-a', ['rumah']],
  [48, 'income', 'gaji', 'Gaji bulanan', 7500000, 'w-bank-a', ['gaji']],
  [52, 'expense', 'groceries', 'Belanja bulanan', 590000, 'w-bank-b', ['rumah']],
  [58, 'expense', 'hiburan', 'Liburan singkat', 1250000, 'w-bank-a', []],
  [78, 'income', 'gaji', 'Gaji bulanan', 7500000, 'w-bank-a', ['gaji']],
  [82, 'expense', 'groceries', 'Belanja bulanan', 610000, 'w-bank-b', ['rumah']],
  [90, 'expense', 'belanja', 'Peralatan rumah', 880000, 'w-bank-a', ['rumah']],
  [108, 'income', 'gaji', 'Gaji bulanan', 7500000, 'w-bank-a', ['gaji']],
  [112, 'expense', 'tagihan', 'Internet rumah', 350000, 'w-bank-a', ['rumah']],
  [120, 'expense', 'makan', 'Makan bersama teman', 340000, 'w-bank-b', []],
  [138, 'income', 'gaji', 'Gaji bulanan', 7000000, 'w-bank-a', ['gaji']],
  [145, 'expense', 'kesehatan', 'Periksa gigi', 450000, 'w-bank-b', []],
  [168, 'income', 'gaji', 'Gaji bulanan', 7000000, 'w-bank-a', ['gaji']],
  [175, 'expense', 'transportasi', 'Tiket kereta', 390000, 'w-bank-a', ['liburan']],
];

export const sampleState = () => {
  const now = today();
  const transactions = sampleRows.map(([ago, type, categoryId, note, amount, walletId, tags], index) => ({
    id: `t-${index + 1}`,
    type,
    categoryId,
    note,
    amount,
    walletId,
    date: addDays(now, -ago),
    excluded: false,
    tags,
    createdAt: addDays(now, -ago),
  }));
  return {
    wallets: sampleWallets(),
    transactions,
    budgets: [
      {
        id: 'b-1',
        month: monthKey(now),
        template: 'seimbang',
        split: { needs: 50, wants: 30, savings: 20 },
        income: 7500000,
        items: [
          { categoryId: 'makan', amount: 1500000 },
          { categoryId: 'groceries', amount: 1000000 },
          { categoryId: 'tagihan', amount: 800000 },
          { categoryId: 'transportasi', amount: 450000 },
          { categoryId: 'hiburan', amount: 500000 },
          { categoryId: 'belanja', amount: 800000 },
          { categoryId: 'investasi', amount: 1500000 },
        ],
      },
    ],
    contacts: [
      {
        id: 'c-1',
        name: 'Teman Satu',
        kind: 'Perorangan',
        due: addDays(now, 14),
        records: [{ id: 'r-1', direction: 'owed-to-me', amount: 300000, note: 'Pinjam untuk tiket', date: addDays(now, -6), paid: false }],
      },
      {
        id: 'c-2',
        name: 'Saudara Dua',
        kind: 'Perorangan',
        due: '',
        records: [{ id: 'r-2', direction: 'i-owe', amount: 150000, note: 'Patungan makan', date: addDays(now, -2), paid: false }],
      },
    ],
    goals: [
      { id: 'g-1', name: 'Dana Darurat', target: 10000000, walletId: 'w-bank-b', deadline: addMonths(now, 6), note: 'Enam bulan biaya hidup.', created: now },
    ],
    holdings: [
      { id: 'h-1', name: 'Reksadana Indeks', kind: 'Reksadana', units: 100, buyPrice: 10000, currentPrice: 11500, note: '' },
      { id: 'h-2', name: 'Emas Antam 5g', kind: 'Emas', units: 5, buyPrice: 1200000, currentPrice: 1350000, note: '' },
    ],
    recurring: [
      { id: 'rec-1', title: 'Internet rumah', amount: 350000, type: 'expense', categoryId: 'tagihan', walletId: 'w-bank-a', frequency: 'monthly', nextDate: addDays(now, 5), active: true },
    ],
    rules: [
      { id: 'rule-1', keyword: 'kopi', categoryId: 'makan', type: 'expense', active: true },
    ],
    splits: [
      {
        id: 'split-1',
        title: 'Makan malam bareng',
        date: addDays(now, -3),
        taxPct: 10,
        servicePct: 0,
        note: '',
        participants: [{ id: 'p-1', name: 'Aku', paid: false }, { id: 'p-2', name: 'Teman', paid: false }],
        items: [{ id: 'i-1', name: 'Nasi goreng', amount: 90000, sharedBy: ['p-1', 'p-2'] }],
      },
    ],
    chat: [],
  };
};

export const emptyState = () => ({
  loggedIn: false,
  onboarded: false,
  user: { name: 'Pengguna', email: 'pengguna@lokal', premium: true },
  profileAnswers: {},
  wallets: defaultWallets(),
  categories: defaultCategories(),
  features: { chat: true, struk: true, hutang: true, tujuan: true, anggaran: true, tag: true, split: true, portofolio: true, berulang: true, aturan: true },
  startDay: 1,
  rates: { ...DEFAULT_RATES },
  currency: 'IDR',
  integrations: { whatsapp: false, telegram: false, email: false },
  chat: [],
  transactions: [],
  budgets: [],
  contacts: [],
  goals: [],
  holdings: [],
  recurring: [],
  rules: [],
  splits: [],
});

export const initialState = emptyState;

export const templates = [
  { id: 'seimbang', name: 'Seimbang', split: { needs: 50, wants: 30, savings: 20 }, text: 'Aturan klasik 50/30/20. Cocok untuk kebanyakan orang.' },
  { id: 'biaya-tinggi', name: 'Biaya Tinggi', split: { needs: 70, wants: 20, savings: 10 }, text: 'Untuk yang tinggal di kota besar atau punya cicilan besar.' },
  { id: 'rajin-menabung', name: 'Rajin Menabung', split: { needs: 40, wants: 20, savings: 40 }, text: 'Untuk yang ingin agresif menabung dan membangun dana darurat.' },
  { id: 'pemula', name: 'Pemula', split: { needs: 80, wants: 10, savings: 10 }, text: 'Untuk yang baru mulai mengatur keuangan atau penghasilan terbatas.' },
];

export const GROUPS = {
  needs: { label: 'Kebutuhan', hint: 'makan, transport, listrik', bar: 'bg-blue-500', text: 'text-blue-600' },
  wants: { label: 'Keinginan', hint: 'belanja, hiburan, jajan', bar: 'bg-purple-500', text: 'text-purple-600' },
  savings: { label: 'Tabungan', hint: 'investasi, dana darurat', bar: 'bg-green-500', text: 'text-green-700' },
};
