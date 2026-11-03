import { addDays, monthKey, today } from './format.js';

export const BRAND = 'uangku';
export const COMPANY = 'PT Contoh Karya';
export const CONTACT_EMAIL = 'halo@contoh.id';
export const ADDRESS = 'Gedung Contoh lt. 10, Jl. Contoh No. 1, Jakarta 10000.';

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
  { id: 'w-bank-a', name: 'Bank Satu', type: 'Tabungan', color: '#01478a', initial: 2500000 },
  { id: 'w-bank-b', name: 'Bank Dua', type: 'Tabungan', color: '#0288d1', initial: 1200000 },
  { id: 'w-cash', name: 'Tunai', type: 'Tunai', color: '#4caf50', initial: 400000 },
];

const sampleRows = [
  [0, 'expense', 'makan', 'Warung nasi', 45000, 'w-bank-a'],
  [0, 'expense', 'makan', 'Kopi pagi', 28000, 'w-cash'],
  [1, 'expense', 'transportasi', 'Bensin', 150000, 'w-bank-a'],
  [1, 'expense', 'groceries', 'Belanja mingguan', 320000, 'w-bank-b'],
  [2, 'income', 'freelance', 'Proyek desain', 750000, 'w-bank-a'],
  [2, 'expense', 'hiburan', 'Nonton film', 75000, 'w-bank-b'],
  [3, 'expense', 'tagihan', 'Listrik', 280000, 'w-bank-a'],
  [4, 'expense', 'kesehatan', 'Vitamin', 95000, 'w-bank-b'],
  [5, 'expense', 'makan', 'Makan malam keluarga', 210000, 'w-bank-a'],
  [6, 'expense', 'belanja', 'Kemeja kerja', 185000, 'w-bank-b'],
  [8, 'expense', 'transportasi', 'Ojek ke kantor', 32000, 'w-cash'],
  [9, 'expense', 'tagihan', 'Internet rumah', 350000, 'w-bank-a'],
  [11, 'expense', 'makan', 'Makan siang', 38000, 'w-cash'],
  [14, 'expense', 'pendidikan', 'Kursus daring', 250000, 'w-bank-b'],
  [18, 'income', 'gaji', 'Gaji bulanan', 7500000, 'w-bank-a'],
  [19, 'expense', 'investasi', 'Reksadana rutin', 1000000, 'w-bank-a'],
  [22, 'expense', 'groceries', 'Belanja bulanan', 640000, 'w-bank-b'],
  [25, 'expense', 'keluarga', 'Kirim untuk orang tua', 1000000, 'w-bank-a'],
  [29, 'expense', 'makan', 'Restoran akhir pekan', 265000, 'w-bank-b'],
  [33, 'expense', 'transportasi', 'Servis motor', 420000, 'w-bank-a'],
  [38, 'expense', 'tagihan', 'Listrik', 265000, 'w-bank-a'],
  [48, 'income', 'gaji', 'Gaji bulanan', 7500000, 'w-bank-a'],
  [52, 'expense', 'groceries', 'Belanja bulanan', 590000, 'w-bank-b'],
  [58, 'expense', 'hiburan', 'Liburan singkat', 1250000, 'w-bank-a'],
  [78, 'income', 'gaji', 'Gaji bulanan', 7500000, 'w-bank-a'],
  [82, 'expense', 'groceries', 'Belanja bulanan', 610000, 'w-bank-b'],
  [90, 'expense', 'belanja', 'Peralatan rumah', 880000, 'w-bank-a'],
  [108, 'income', 'gaji', 'Gaji bulanan', 7500000, 'w-bank-a'],
  [112, 'expense', 'tagihan', 'Internet rumah', 350000, 'w-bank-a'],
  [120, 'expense', 'makan', 'Makan bersama teman', 340000, 'w-bank-b'],
  [138, 'income', 'gaji', 'Gaji bulanan', 7000000, 'w-bank-a'],
  [145, 'expense', 'kesehatan', 'Periksa gigi', 450000, 'w-bank-b'],
  [168, 'income', 'gaji', 'Gaji bulanan', 7000000, 'w-bank-a'],
  [175, 'expense', 'transportasi', 'Tiket kereta', 390000, 'w-bank-a'],
];

export const sampleState = () => {
  const now = today();
  const transactions = sampleRows.map(([ago, type, categoryId, note, amount, walletId], index) => ({
    id: `t-${index + 1}`,
    type,
    categoryId,
    note,
    amount,
    walletId,
    date: addDays(now, -ago),
    excluded: false,
  }));
  return {
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
  };
};

export const initialState = () => ({
  loggedIn: false,
  onboarded: false,
  user: { name: 'Pengguna Contoh', email: 'contoh@uangku.id', premium: false },
  wallets: defaultWallets(),
  categories: defaultCategories(),
  features: { chat: true, struk: true, hutang: true, tujuan: true, anggaran: true, tag: true },
  startDay: 1,
  integrations: { whatsapp: false, telegram: false },
  chat: [],
  ...sampleState(),
});

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
