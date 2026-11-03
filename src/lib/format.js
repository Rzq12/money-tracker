export const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
export const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const rupiah = (n) => {
  const value = Math.round(Number(n) || 0);
  return `${value < 0 ? '-' : ''}Rp ${Math.abs(value).toLocaleString('id-ID')}`;
};

export const compactRupiah = (n) => {
  const value = Math.abs(Number(n) || 0);
  const sign = n < 0 ? '-' : '';
  const trim = (x) => String(Number(x.toFixed(2))).replace('.', ',');
  if (value >= 1e9) return `${sign}Rp${trim(value / 1e9)}M`;
  if (value >= 1e6) return `${sign}Rp${trim(value / 1e6)}jt`;
  if (value >= 1e3) return `${sign}Rp${trim(value / 1e3)}rb`;
  return `${sign}Rp${trim(value)}`;
};

export const digits = (text) => Number(String(text ?? '').replace(/\D/g, '')) || 0;
export const groupDigits = (n) => (n ? Number(n).toLocaleString('id-ID') : '');

/** Parses a decimal amount typed as "1.234,56" or "1234,56". */
export const decimal = (text) => {
  const clean = String(text ?? '').replace(/\./g, '').replace(/[^\d,]/g, '').replace(/,/g, '.');
  const value = Number(clean);
  return Number.isFinite(value) ? value : 0;
};
export const groupDecimal = (n) => (n || n === 0 ? Number(n).toLocaleString('id-ID', { maximumFractionDigits: 2 }) : '');
export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export const pad = (n) => String(n).padStart(2, '0');
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromISO = (s) => {
  const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
export const today = () => toISO(new Date());
export const addDays = (iso, n) => {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
};
export const monthKey = (iso) => String(iso).slice(0, 7);
export const lastDayOfMonth = (year, month) => new Date(year, month + 1, 0).getDate();
export const addMonths = (iso, n) => {
  const d = fromISO(iso);
  const year = d.getFullYear();
  const month = d.getMonth() + n;
  return toISO(new Date(year, month, Math.min(d.getDate(), lastDayOfMonth(year, month))));
};
export const longDate = (iso) => {
  const d = fromISO(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const shortDate = (iso) => {
  const d = fromISO(iso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
};
export const slashDate = (iso) => {
  const d = fromISO(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
export const rangeLabel = (from, to) => {
  const a = fromISO(from);
  const b = fromISO(to);
  if (a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]} ${b.getFullYear()}`;
  }
  return `${a.getDate()} ${MONTHS_SHORT[a.getMonth()]} – ${b.getDate()} ${MONTHS_SHORT[b.getMonth()]} ${b.getFullYear()}`;
};

/** Day-of-month clamped to the real length of that month (29–31 safe). */
const periodStart = (year, month, startDay) => new Date(year, month, Math.min(Math.max(1, Number(startDay) || 1), lastDayOfMonth(year, month)));

/** The budgeting period containing `iso`, given the day of the month a period starts on. */
export const periodOf = (iso, startDay = 1) => {
  const d = fromISO(iso);
  let year = d.getFullYear();
  let month = d.getMonth();
  let start = periodStart(year, month, startDay);
  if (d < start) {
    month -= 1;
    start = periodStart(year, month, startDay);
  }
  const next = periodStart(start.getFullYear(), start.getMonth() + 1, startDay);
  const end = new Date(next);
  end.setDate(end.getDate() - 1);
  return { from: toISO(start), to: toISO(end) };
};
export const shiftPeriod = (period, startDay, months) => {
  const a = fromISO(period.from);
  const start = periodStart(a.getFullYear(), a.getMonth() + months, startDay);
  const next = periodStart(start.getFullYear(), start.getMonth() + 1, startDay);
  const end = new Date(next);
  end.setDate(end.getDate() - 1);
  return { from: toISO(start), to: toISO(end) };
};

/** "2026-03" -> "Maret 2026". */
export const monthLabel = (key) => {
  const [year, month] = String(key).split('-').map(Number);
  return `${MONTHS[(month || 1) - 1]} ${year || ''}`.trim();
};

export const downloadText = (filename, text, type = 'text/csv;charset=utf-8') => {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const toCSV = (rows) =>
  rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

/** Understands everyday amounts such as 25rb, 1,5jt, 18.000 or 25000. */
export const parseAmount = (text) => {
  const match = String(text).toLowerCase().match(/(\d+(?:[.,]\d+)*)\s*(rb|ribu|k|jt|juta)?\b/);
  if (!match) return 0;
  const raw = match[1];
  const unit = match[2];
  if (unit) {
    const base = Number(raw.replace(',', '.'));
    return Math.round(base * (['jt', 'juta'].includes(unit) ? 1e6 : 1e3));
  }
  return Number(raw.replace(/[.,]/g, ''));
};
