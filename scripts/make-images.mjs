// Draws the placeholder logo and phone screens as our own SVG pictures (no artwork from the original).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(out, { recursive: true });
const font = 'font-family="ui-sans-serif, system-ui, Segoe UI, sans-serif"';
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" ${font}>${body}</svg>`;
const t = (x, y, size, weight, fill, text, anchor = 'start') => `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${text}</text>`;
const r = (x, y, w, h, rx, fill) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const c = (x, y, radius, fill) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${fill}"/>`;

const miniLogo = (x, y) => c(x + 7, y + 7, 7, '#29b6f6') + c(x + 7, y + 7, 2.8, '#fff') + t(x + 18, y + 12, 14, 700, '#111827', 'uangku');

writeFileSync(join(out, 'logo.svg'), svg(106, 32, c(15, 17, 15, '#29b6f6') + c(15, 17, 6, '#fff') + t(34, 24, 20, 700, '#111827', 'uangku')));

const rows = [
  ['#01478a', 'Warung nasi', 'Makan · dari notifikasi', 'Rp45.000', '#c2410c'],
  ['#01478a', 'Transfer masuk', 'Belum ada kategori', 'Rp250.000', '#0277bd'],
  ['#f59e0b', 'Kopi pagi', 'Makan', 'Rp28.000', '#c2410c'],
  ['#0288d1', 'Bensin', 'Transportasi', 'Rp150.000', '#c2410c'],
];
let body = r(0, 0, 244, 531, 0, '#fff') + miniLogo(11, 40);
body += r(162, 39, 46, 16, 8, '#fef2f2') + t(185, 50, 7, 700, '#b91c1c', '323 hari', 'middle') + c(222, 47, 9, '#f3f4f6') + c(226, 42, 2.5, '#ef4444');
body += t(11, 79, 7, 400, '#6b7280', 'Hai Dina · pengeluaran bulan ini');
body += t(11, 106, 23, 700, '#111827', 'Rp3.120.000');
body += t(11, 120, 6.5, 600, '#2e7d32', '↓ Rp330 rb lebih hemat dari bulan lalu');
body += r(11, 134, 222, 38, 10, '#eef3fb');
[['Hari ini', 'Rp178 rb', 20], ['Total saldo', 'Rp9,55 jt', 89], ['Sisa anggaran', 'Rp880 rb', 163]].forEach(([a, b, x]) => {
  body += t(x, 148, 6.5, 400, '#6b7280', a) + t(x, 162, 8.5, 700, '#111827', b);
});
body += r(11, 178, 222, 26, 10, '#f3f4f6') + c(24, 191, 6, '#fff7ed') + t(36, 194, 7, 400, '#4b5563', 'belum berkategori · Rp1,18 jt') + t(224, 194, 7, 700, '#0277bd', 'Atur ›', 'end');
body += t(11, 224, 8.5, 700, '#111827', 'Terakhir dicatat') + t(233, 224, 7, 400, '#6b7280', 'Semua', 'end');
rows.forEach(([color, name, sub, amount, tone], i) => {
  const y = 256 + i * 34.5;
  body += c(22, y, 11, color) + t(40, y - 3, 8, 600, '#111827', name) + t(40, y + 8, 6.5, 400, i === 1 ? '#b45309' : '#6b7280', sub) + t(233, y + 3, 8, 700, tone, amount, 'end');
});
body += t(11, 394, 8.5, 700, '#111827', 'Saldo') + t(233, 394, 7, 400, '#6b7280', 'Lihat semua', 'end');
[[11, '#eef3fb'], [95, '#e8f5e9'], [179, '#fef2f2']].forEach(([x, f]) => {
  body += r(x, 404, 76, 60, 10, f);
});
writeFileSync(join(out, 'phone-dashboard.svg'), svg(244, 531, body));

let notif = r(0, 0, 224, 488, 0, '#fff') + r(0, 0, 224, 212, 0, '#14447f');
notif += c(18, 30, 8, '#ffffff33');
notif += t(112, 46, 7, 400, '#ffffffcc', 'Sabtu, 26 September', 'middle') + t(112, 80, 32, 300, '#fff', '08.21', 'middle');
notif += r(10, 96, 204, 34, 8, '#ffffffe6') + t(18, 110, 6.5, 700, '#111827', 'm-banking') + t(18, 121, 6.5, 400, '#374151', 'Pembayaran QRIS Rp45.000 berhasil.');
notif += r(10, 133, 204, 32, 8, '#fff') + t(18, 147, 6.5, 700, '#111827', 'Warung nasi') + t(18, 157, 6, 400, '#6b7280', 'Makan · baru saja') + t(206, 152, 7, 700, '#c2410c', 'Rp45.000', 'end');
notif += r(0, 180, 224, 308, 0, '#fff');
notif += t(12, 204, 13, 700, '#111827', 'Kamu bayar, transaksinya') + t(12, 220, 13, 700, '#111827', 'langsung tercatat.');
notif += t(12, 236, 6.5, 400, '#4b5563', 'Notifikasi pembayaran dari aplikasi pilihanmu') + t(12, 245, 6.5, 400, '#4b5563', 'dicatat saat itu juga.');
notif += r(12, 262, 200, 1, 0, '#f3f4f6') + t(12, 280, 8, 600, '#111827', 'Catat dari notifikasi') + r(188, 271, 24, 13, 6.5, '#d1d5db') + c(195, 277.5, 5, '#fff');
notif += t(12, 300, 6, 400, '#6b7280', 'Hanya aplikasi yang kamu pilih. Chat dan kode masuk diabaikan.');
writeFileSync(join(out, 'phone-notif.svg'), svg(224, 488, notif));
console.log('images written');
