import { digits, pad, parseAmount, today, toISO } from './format.js';

const MONTH_NAMES = {
  jan: 1, januari: 1, feb: 2, februari: 2, mar: 3, maret: 3, apr: 4, april: 4,
  mei: 5, may: 5, jun: 6, juni: 6, jul: 7, juli: 7, agu: 8, agt: 8, agustus: 8, aug: 8,
  sep: 9, september: 9, okt: 10, oktober: 10, oct: 10, nov: 11, november: 11, des: 12, desember: 12, dec: 12,
};

export const parseCSV = (text) => {
  const source = String(text || '').replace(/^\uFEFF/, '');
  const first = source.split(/\r?\n/, 1)[0] || '';
  const sep = (first.match(/;/g) || []).length > (first.match(/,/g) || []).length ? ';' : ',';
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < source.length; i += 1) {
    const c = source[i];
    if (quoted) {
      if (c === '"' && source[i + 1] === '"') { cell += '"'; i += 1; } else if (c === '"') quoted = false; else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === sep) { row.push(cell); cell = ''; } else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; } else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => String(x).trim()));
};

export const normalizeDate = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return toISO(value);
  if (typeof value === 'number' && value > 20000) {
    // Excel stores dates as days since 1899-12-30.
    const d = new Date(Math.round((value - 25569) * 86400000));
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  }
  const s = String(value || '').trim();
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return `${m[1]}-${pad(m[2])}-${pad(m[3])}`;
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/);
  if (m) return `${m[3].length === 2 ? `20${m[3]}` : m[3]}-${pad(m[2])}-${pad(m[1])}`;
  m = s.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (m && MONTH_NAMES[m[2].toLowerCase()]) return `${m[3]}-${pad(MONTH_NAMES[m[2].toLowerCase()])}-${pad(m[1])}`;
  return '';
};

export const guess = (headers, words) => {
  const i = headers.findIndex((h) => words.some((w) => String(h).toLowerCase().includes(w)));
  return i >= 0 ? String(i) : '';
};

/** Reads "Rp45.000", "45rb", "1,5jt", or a bare number. */
export const parseAmountText = (text) => {
  const source = String(text ?? '').toLowerCase();
  let m = source.match(/rp\.?\s*([\d.,]+)\s*(rb|ribu|k|jt|juta)?/i);
  if (m) return parseAmount(`${m[1]}${m[2] || ''}`);
  m = source.match(/([\d.,]+)\s*(rb|ribu|k|jt|juta)\b/i);
  if (m) return parseAmount(`${m[1]}${m[2]}`);
  const candidates = [...source.matchAll(/\d[\d.,]*/g)].map((x) => x[0]);
  const chosen = [...candidates].reverse().find((c) => digits(c) >= 100) || candidates[0];
  return chosen ? parseAmount(chosen) : 0;
};

export const inferType = (typeText, raw) => {
  const text = String(typeText || '').toLowerCase();
  if (/masuk|income|kredit|\bcr\b|credit/.test(text)) return 'income';
  if (/keluar|expense|debit|\bdb\b|debet/.test(text)) return 'expense';
  if (typeof raw === 'number') return raw < 0 ? 'expense' : raw > 0 ? 'income' : 'expense';
  const t = String(raw ?? '').trim();
  if (/^-\s*/.test(t)) return 'expense';
  if (/^\+\s*/.test(t)) return 'income';
  return 'expense';
};

export const buildPreview = ({ rows, map, categories }) => {
  if (map.date === '' || map.amount === '' || map.date === undefined) return [];
  return rows.slice(1).map((r) => {
    const raw = r[Number(map.amount)];
    const amount = typeof raw === 'number' ? Math.abs(raw) : parseAmountText(raw);
    const typeText = map.type !== '' ? String(r[Number(map.type)] || '') : '';
    const catText = map.category !== '' ? String(r[Number(map.category)] || '').toLowerCase() : '';
    const parent = categories.find((c) => c.name.toLowerCase() === catText || c.children?.some((x) => x.name.toLowerCase() === catText));
    const child = parent?.children?.find((x) => x.name.toLowerCase() === catText);
    return {
      date: normalizeDate(r[Number(map.date)]),
      note: map.note !== '' ? String(r[Number(map.note)] || '') : '',
      amount,
      type: inferType(typeText, raw),
      categoryId: child?.id || parent?.id,
    };
  });
};

const cleanNote = (line) => line
  .replace(/\b(?:rp\.?\s*)?[\d.,]+\s*(?:rb|ribu|k|jt|juta)?\b/gi, ' ')
  .replace(/\b(?:pada|tanggal|tgl|date|nominal|jumlah|sebesar)\b/gi, ' ')
  .replace(/[|•·;]+/g, ' ')
  .replace(/\s{2,}/g, ' ')
  .replace(/^[\s\-–—:]+|[\s\-–—:]+$/g, '')
  .trim();

/**
 * One transaction per line, e.g. bank notification or email text:
 * "26/09/2026 QRIS Warung nasi Rp45.000"
 */
export const parsePasted = (text) => {
  const lines = String(text || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const data = lines.map((line) => {
    const date = normalizeDate(line.match(/\b(20\d{2}-\d{1,2}-\d{1,2}|\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4})\b/)?.[0]) || today();
    const amount = parseAmountText(line);
    const note = cleanNote(line) || 'Transaksi';
    const type = /masuk|terima|gaji|bonus|kredit|refund|cashback|top up|topup/i.test(line) ? 'income' : 'expense';
    return [date, note, amount, type];
  }).filter((row) => row[2] > 0);
  return {
    rows: [['Tanggal', 'Catatan', 'Nominal', 'Jenis'], ...data],
    map: { date: '0', note: '1', amount: '2', type: '3', category: '' },
  };
};

export const duplicateKey = (tx) => `${tx.date}|${Math.round(Number(tx.amount) || 0)}|${String(tx.note || '').trim().toLowerCase()}`;
export const markDuplicates = (candidates, transactions) => {
  const existing = new Set(transactions.map(duplicateKey));
  return candidates.map((candidate) => ({ ...candidate, duplicate: existing.has(duplicateKey(candidate)) }));
};
