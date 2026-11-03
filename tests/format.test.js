import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addMonths, compactRupiah, decimal, digits, groupDecimal, monthLabel, parseAmount, periodOf, rupiah, shiftPeriod,
} from '../src/lib/format.js';

test('rupiah formats whole amounts and negatives', () => {
  assert.equal(rupiah(1234567), 'Rp 1.234.567');
  assert.equal(rupiah(-1000), '-Rp 1.000');
  assert.equal(rupiah(0), 'Rp 0');
});

test('compactRupiah shortens large amounts', () => {
  assert.equal(compactRupiah(1500000), 'Rp1,5jt');
  assert.equal(compactRupiah(250000), 'Rp250rb');
  assert.equal(compactRupiah(1200000000), 'Rp1,2M');
});

test('digits and decimal read Indonesian input', () => {
  assert.equal(digits('Rp 25.000'), 25000);
  assert.equal(decimal('1.234,56'), 1234.56);
  assert.equal(decimal('12,5'), 12.5);
  assert.equal(groupDecimal(1234.5), '1.234,5');
});

test('addMonths clamps to the last day of short months', () => {
  assert.equal(addMonths('2026-01-31', 1), '2026-02-28');
  assert.equal(addMonths('2024-01-31', 1), '2024-02-29');
  assert.equal(addMonths('2026-03-15', -1), '2026-02-15');
});

test('periodOf survives day 29-31 start dates', () => {
  for (const day of [1, 15, 28, 29, 30, 31]) {
    const period = periodOf('2026-02-15', day);
    assert.match(period.from, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(period.from <= period.to, `period ${day} is ordered`);
  }
  const late = periodOf('2026-01-31', 31);
  assert.equal(late.from, '2026-01-31');
});

test('shiftPeriod moves whole periods without breaking', () => {
  const start = periodOf('2026-01-31', 31);
  const next = shiftPeriod(start, 31, 1);
  assert.ok(next.from > start.to);
  const back = shiftPeriod(next, 31, -1);
  assert.equal(back.from, start.from);
});

test('parseAmount understands everyday shorthand', () => {
  assert.equal(parseAmount('makan 25rb'), 25000);
  assert.equal(parseAmount('kopi 1,5jt'), 1500000);
  assert.equal(parseAmount('bayar Rp 18.000'), 18000);
});

test('monthLabel renders Indonesian month names', () => {
  assert.equal(monthLabel('2026-03'), 'Maret 2026');
});
