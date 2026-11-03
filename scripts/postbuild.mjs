// Gives every page its own folder so the site works from any static file host.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const routes = [
  'masuk', 'fitur', 'catat-otomatis', 'syarat-ketentuan', 'kebijakan-privasi', 'harga', 'panduan', 'keamanan', 'tentang', 'tools', 'e-statement',
  'fitur/catat-otomatis-notifikasi', 'fitur/catat-dari-email-bank', 'fitur/impor-mutasi-bank', 'fitur/catat-lewat-chat', 'fitur/catat-pakai-suara',
  'fitur/foto-struk', 'fitur/split-bill', 'fitur/hutang-piutang', 'fitur/anggaran', 'fitur/multi-mata-uang',
  'dashboard', 'onboarding', 'transactions', 'laporan', 'anggaran', 'anggaran/buat', 'aset', 'akun', 'akun/fitur', 'pengaturan',
  'integrasi', 'import', 'referral', 'chat', 'debt', 'hapus-akun', 'tools/kalkulator-kpr',
];
for (const route of routes) {
  const folder = join(dist, route);
  mkdirSync(folder, { recursive: true });
  copyFileSync(join(dist, 'index.html'), join(folder, 'index.html'));
}
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
console.log(`Wrote ${routes.length} page folders`);
