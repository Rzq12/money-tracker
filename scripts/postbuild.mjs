// Gives every public route its own folder so the site works on static hosts
// that do not support SPA rewrites. Dynamic routes still rely on 404.html.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const routes = [
  'masuk', 'fitur', 'catat-otomatis', 'syarat-ketentuan', 'kebijakan-privasi', 'harga', 'panduan', 'keamanan', 'tentang', 'tools', 'e-statement',
  'tools/kalkulator-kpr', 'tools/kalkulator-pajak',
  'fitur/catat-otomatis-notifikasi', 'fitur/catat-dari-email-bank', 'fitur/impor-mutasi-bank', 'fitur/catat-lewat-chat', 'fitur/catat-pakai-suara',
  'fitur/foto-struk', 'fitur/split-bill', 'fitur/hutang-piutang', 'fitur/anggaran', 'fitur/multi-mata-uang', 'fitur/tujuan-keuangan',
  'fitur/transaksi-berulang', 'fitur/aturan-otomatis', 'fitur/portofolio', 'fitur/backup-data', 'fitur/tag',
  'catat-otomatis/bank-satu', 'catat-otomatis/bank-dua', 'catat-otomatis/bank-tiga', 'catat-otomatis/bank-empat', 'catat-otomatis/bank-lima',
  'catat-otomatis/bank-enam', 'catat-otomatis/bank-tujuh', 'catat-otomatis/bank-delapan', 'catat-otomatis/bank-sembilan', 'catat-otomatis/bank-sepuluh',
  'catat-otomatis/dompet-a', 'catat-otomatis/dompet-b', 'catat-otomatis/dompet-c', 'catat-otomatis/dompet-d',
  'catat-otomatis/toko-a', 'catat-otomatis/toko-b', 'catat-otomatis/toko-c',
  'dashboard', 'onboarding', 'transactions', 'laporan', 'anggaran', 'anggaran/buat', 'aset', 'akun', 'akun/fitur', 'akun/profil',
  'pengaturan', 'integrasi', 'import', 'referral', 'chat', 'debt', 'hapus-akun', 'backup', 'tujuan', 'portofolio', 'berulang', 'aturan', 'split',
];
for (const route of routes) {
  const folder = join(dist, route);
  mkdirSync(folder, { recursive: true });
  copyFileSync(join(dist, 'index.html'), join(folder, 'index.html'));
}
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
console.log(`Wrote ${routes.length} page folders`);
