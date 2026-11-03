import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_RATES, fromIdr, formatMoney, toIdr, walletBalance,
} from '../src/lib/money.js';

const rates = { ...DEFAULT_RATES, USD: 16000 };

test('toIdr and fromIdr round-trip', () => {
  assert.equal(toIdr(10, 'USD', rates), 160000);
  assert.equal(fromIdr(160000, 'USD', rates), 10);
  assert.equal(toIdr(50000, 'IDR', rates), 50000);
});

test('formatMoney displays foreign currency', () => {
  assert.equal(formatMoney(160000, 'USD', rates), '$ 10');
  assert.equal(formatMoney(1500, 'IDR', rates), 'Rp 1.500');
});

test('walletBalance includes opening balance and transfers', () => {
  const wallet = { id: 'w1', initial: 100000 };
  const other = { id: 'w2', initial: 0 };
  const transactions = [
    { type: 'income', walletId: 'w1', amount: 50000 },
    { type: 'expense', walletId: 'w1', amount: 20000 },
    { type: 'transfer', walletId: 'w1', toWalletId: 'w2', amount: 30000 },
  ];
  assert.equal(walletBalance(wallet, transactions), 100000);
  assert.equal(walletBalance(other, transactions), 30000);
});

test('walletBalance ignores other wallets', () => {
  const wallet = { id: 'w1', initial: 0 };
  assert.equal(walletBalance(wallet, [{ type: 'expense', walletId: 'w2', amount: 999 }]), 0);
});
