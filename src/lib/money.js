import { round2, rupiah } from './format.js';

export const CURRENCIES = [
  { code: 'IDR', label: 'Rupiah Indonesia', symbol: 'Rp' },
  { code: 'USD', label: 'Dolar Amerika', symbol: '$' },
  { code: 'SGD', label: 'Dolar Singapura', symbol: 'S$' },
  { code: 'MYR', label: 'Ringgit Malaysia', symbol: 'RM' },
  { code: 'EUR', label: 'Euro', symbol: '€' },
  { code: 'GBP', label: 'Pound Sterling', symbol: '£' },
  { code: 'JPY', label: 'Yen Jepang', symbol: '¥' },
  { code: 'AUD', label: 'Dolar Australia', symbol: 'A$' },
];

export const DEFAULT_RATES = {
  IDR: 1,
  USD: 16000,
  SGD: 12000,
  MYR: 3600,
  EUR: 17500,
  GBP: 20500,
  JPY: 105,
  AUD: 10500,
};

export const currencyInfo = (code = 'IDR') => CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
export const currencySymbol = (code = 'IDR') => currencyInfo(code).symbol;
export const rateOf = (code = 'IDR', rates = DEFAULT_RATES) => Math.max(0.000001, Number(rates?.[code]) || (code === 'IDR' ? 1 : 0) || 1);

/** Amounts are stored in IDR internally; foreign wallets convert at entry time. */
export const toIdr = (amount, code = 'IDR', rates = DEFAULT_RATES) => Math.round((Number(amount) || 0) * rateOf(code, rates));
export const fromIdr = (amountIdr, code = 'IDR', rates = DEFAULT_RATES) => round2((Number(amountIdr) || 0) / rateOf(code, rates));

export const formatMoney = (amountIdr, code = 'IDR', rates = DEFAULT_RATES) => {
  if (!code || code === 'IDR') return rupiah(amountIdr);
  const value = fromIdr(amountIdr, code, rates);
  return `${currencySymbol(code)} ${value.toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;
};

/** A wallet's balance in IDR: opening balance plus everything recorded against it. */
export const walletBalance = (wallet, transactions) =>
  transactions.reduce((sum, t) => {
    if (t.type === 'income' && t.walletId === wallet.id) return sum + t.amount;
    if (t.type === 'expense' && t.walletId === wallet.id) return sum - t.amount;
    if (t.type === 'transfer') {
      if (t.walletId === wallet.id) return sum - t.amount;
      if (t.toWalletId === wallet.id) return sum + t.amount;
    }
    return sum;
  }, Number(wallet.initial) || 0);

export const formatWalletAmount = (wallet, transactions, rates) =>
  formatMoney(walletBalance(wallet, transactions), wallet?.currency || 'IDR', rates);

/** Amount as originally entered, with the IDR equivalent available to reports. */
export const formatTransactionAmount = (tx) => {
  if (tx.currency && tx.currency !== 'IDR' && tx.originalAmount !== undefined && tx.originalAmount !== null) {
    return `${currencySymbol(tx.currency)} ${Number(tx.originalAmount).toLocaleString('id-ID', { maximumFractionDigits: 2 })}`;
  }
  return rupiah(tx.amount);
};

export const transactionCurrencyNote = (tx) =>
  tx.currency && tx.currency !== 'IDR' && tx.originalAmount !== undefined ? ` ≈ ${rupiah(tx.amount)}` : '';
