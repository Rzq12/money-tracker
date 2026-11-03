import test from 'node:test';
import assert from 'node:assert/strict';
import { applyRules, normalizeTags, tagCounts } from '../src/lib/rules.js';

const rules = [
  { keyword: 'kopi', categoryId: 'makan', type: 'expense', active: true },
  { keyword: 'gaji', categoryId: 'gaji', type: 'income', active: true },
  { keyword: 'listrik', categoryId: 'tagihan', type: 'expense', active: false },
];

test('applyRules fills an empty category from a keyword', () => {
  assert.equal(applyRules(rules, 'Kopi susu pagi', '', 'expense'), 'makan');
  assert.equal(applyRules(rules, 'Lain-lain', 'lain-lain', 'expense'), 'lain-lain');
});

test('applyRules keeps explicit categories', () => {
  assert.equal(applyRules(rules, 'Kopi susu', 'hiburan', 'expense'), 'hiburan');
});

test('applyRules respects type and active flags', () => {
  assert.equal(applyRules(rules, 'Kopi susu', '', 'income'), '');
  assert.equal(applyRules(rules, 'Tagihan listrik', '', 'expense'), '');
});

test('normalizeTags trims, dedupes and strips hashes', () => {
  assert.deepEqual(normalizeTags(' #liburan, Liburan ,kerja '), ['liburan', 'kerja']);
  assert.deepEqual(normalizeTags(['a', 'a', ' b ']), ['a', 'b']);
});

test('tagCounts sorts by frequency', () => {
  const counts = tagCounts([
    { tags: ['rumah', 'kerja'] },
    { tags: ['rumah'] },
  ]);
  assert.deepEqual(counts[0], { name: 'rumah', count: 2 });
});
