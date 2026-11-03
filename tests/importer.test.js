import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPreview, duplicateKey, guess, inferType, markDuplicates, normalizeDate, parseAmountText,
  parseCSV, parsePasted,
} from '../src/lib/importer.js';

const categories = [
  { id: 'makan', name: 'Makan dan Minum', children: [{ id: 'jajan', name: 'Jajan' }] },
  { id: 'gaji', name: 'Gaji', children: [] },
];

test('parseCSV handles quotes and separators', () => {
  assert.deepEqual(parseCSV('a,b\n"x,1",2'), [['a', 'b'], ['x,1', '2']]);
  assert.deepEqual(parseCSV('a;b\n1;2'), [['a', 'b'], ['1', '2']]);
});

test('normalizeDate reads common formats', () => {
  assert.equal(normalizeDate('2026-9-6'), '2026-09-06');
  assert.equal(normalizeDate('26/09/2026'), '2026-09-26');
  assert.equal(normalizeDate('26-09-26'), '2026-09-26');
  assert.equal(normalizeDate('26 Sep 2026'), '2026-09-26');
  assert.equal(normalizeDate('bukan tanggal'), '');
});

test('parseAmountText reads Rupiah text', () => {
  assert.equal(parseAmountText('Rp45.000'), 45000);
  assert.equal(parseAmountText('1,5jt'), 1500000);
  assert.equal(parseAmountText('25rb'), 25000);
});

test('inferType uses labels and signs', () => {
  assert.equal(inferType('debit', ''), 'expense');
  assert.equal(inferType('kredit', ''), 'income');
  assert.equal(inferType('', -500), 'expense');
  assert.equal(inferType('', 500), 'income');
  assert.equal(inferType('', '-500'), 'expense');
  assert.equal(inferType('', '+500'), 'income');
  assert.equal(inferType('', ''), 'expense');
});

test('guess finds a header by keyword', () => {
  assert.equal(guess(['Tanggal', 'Nominal'], ['tanggal']), '0');
  assert.equal(guess(['Tanggal', 'Nominal'], ['amount']), '');
});

test('buildPreview maps rows into transactions', () => {
  const rows = [
    ['Tanggal', 'Catatan', 'Nominal', 'Jenis'],
    ['2026-09-26', 'Warung nasi', '45.000', 'debit'],
    ['2026-09-27', 'Gaji', '7.500.000', 'kredit'],
  ];
  const preview = buildPreview({ rows, map: { date: '0', note: '1', amount: '2', type: '3', category: '' }, categories });
  assert.equal(preview.length, 2);
  assert.equal(preview[0].amount, 45000);
  assert.equal(preview[0].type, 'expense');
  assert.equal(preview[1].type, 'income');
});

test('buildPreview matches category names including children', () => {
  const rows = [['Tanggal', 'Nominal', 'Kategori'], ['2026-09-26', '10000', 'Jajan']];
  const preview = buildPreview({ rows, map: { date: '0', amount: '1', type: '', category: '2', note: '' }, categories });
  assert.equal(preview[0].categoryId, 'jajan');
  assert.equal(preview[0].type, 'expense');
});

test('parsePasted makes one transaction per line', () => {
  const parsed = parsePasted('26/09/2026 QRIS Warung nasi Rp45.000\n27/09/2026 Gaji masuk Rp7.500.000');
  assert.equal(parsed.rows.length, 3);
  const preview = buildPreview({ rows: parsed.rows, map: parsed.map, categories });
  assert.equal(preview[0].amount, 45000);
  assert.equal(preview[0].date, '2026-09-26');
  assert.equal(preview[0].type, 'expense');
  assert.equal(preview[1].amount, 7500000);
  assert.equal(preview[1].type, 'income');
});

test('duplicates are detected by date, amount and note', () => {
  const tx = { date: '2026-09-26', amount: 45000, note: 'Warung nasi' };
  assert.equal(duplicateKey(tx), '2026-09-26|45000|warung nasi');
  const marked = markDuplicates([{ ...tx }, { ...tx, amount: 5000 }], [tx]);
  assert.equal(marked[0].duplicate, true);
  assert.equal(marked[1].duplicate, false);
});
