import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { initialState, sampleState, uid } from './seed.js';

const KEY = 'uangku.state.v1';
const StoreContext = createContext(null);

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initialState(), ...JSON.parse(raw) };
  } catch {
    /* a broken saved copy falls back to a clean start */
  }
  return initialState();
};

/** Everything lives in this browser: nothing is sent anywhere. */
export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const [toast, setToast] = useState('');
  const [catat, setCatat] = useState(null);
  const [premium, setPremium] = useState(false);
  const timer = useRef();

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode: the session still works, it just won't be remembered */
    }
  }, [state]);

  const notify = useCallback((message) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(''), 3200);
  }, []);

  const patch = useCallback((update) => setState((s) => ({ ...s, ...(typeof update === 'function' ? update(s) : update) })), []);

  const actions = useMemo(
    () => ({
      login: () => patch({ loggedIn: true }),
      logout: () => patch({ loggedIn: false }),
      finishOnboarding: () => patch({ onboarded: true }),
      saveTransaction: (tx) =>
        patch((s) => {
          const exists = tx.id && s.transactions.some((t) => t.id === tx.id);
          return {
            transactions: exists
              ? s.transactions.map((t) => (t.id === tx.id ? { ...t, ...tx } : t))
              : [{ ...tx, id: uid('t') }, ...s.transactions],
          };
        }),
      addTransactions: (list) => patch((s) => ({ transactions: [...list.map((t) => ({ ...t, id: uid('t') })), ...s.transactions] })),
      deleteTransaction: (id) => patch((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      saveWallet: (wallet) =>
        patch((s) => ({
          wallets: wallet.id ? s.wallets.map((w) => (w.id === wallet.id ? wallet : w)) : [...s.wallets, { ...wallet, id: uid('w') }],
        })),
      deleteWallet: (id) =>
        patch((s) => ({
          wallets: s.wallets.filter((w) => w.id !== id),
          transactions: s.transactions.filter((t) => t.walletId !== id && t.toWalletId !== id),
        })),
      saveCategory: (category, parentId) =>
        patch((s) => {
          if (category.id) {
            return {
              categories: s.categories.map((c) =>
                c.id === category.id ? { ...c, ...category } : { ...c, children: c.children.map((x) => (x.id === category.id ? { ...x, name: category.name } : x)) },
              ),
            };
          }
          const id = uid('cat');
          if (parentId) {
            return { categories: s.categories.map((c) => (c.id === parentId ? { ...c, children: [...c.children, { id, name: category.name }] } : c)) };
          }
          return { categories: [...s.categories, { ...category, id, children: [] }] };
        }),
      deleteCategory: (id) =>
        patch((s) => ({
          categories: s.categories.filter((c) => c.id !== id).map((c) => ({ ...c, children: c.children.filter((x) => x.id !== id) })),
        })),
      setFeature: (key, value) => patch((s) => ({ features: { ...s.features, [key]: value } })),
      setStartDay: (startDay) => patch({ startDay }),
      saveBudget: (budget) =>
        patch((s) => {
          const others = s.budgets.filter((b) => b.id !== budget.id && b.month !== budget.month);
          return { budgets: [...others, { ...budget, id: budget.id || uid('b') }] };
        }),
      deleteBudget: (id) => patch((s) => ({ budgets: s.budgets.filter((b) => b.id !== id) })),
      saveContact: (contact) =>
        patch((s) => ({
          contacts: contact.id ? s.contacts.map((c) => (c.id === contact.id ? contact : c)) : [...s.contacts, { ...contact, id: uid('c'), records: [] }],
        })),
      deleteContact: (id) => patch((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
      addDebtRecord: (contactId, record) =>
        patch((s) => ({
          contacts: s.contacts.map((c) => (c.id === contactId ? { ...c, records: [{ ...record, id: uid('r'), paid: false }, ...c.records] } : c)),
        })),
      toggleDebtPaid: (contactId, recordId) =>
        patch((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === contactId ? { ...c, records: c.records.map((r) => (r.id === recordId ? { ...r, paid: !r.paid } : r)) } : c,
          ),
        })),
      setIntegration: (key, value) => patch((s) => ({ integrations: { ...s.integrations, [key]: value } })),
      setChat: (chat) => patch({ chat }),
      setPremiumPlan: () => patch((s) => ({ user: { ...s.user, premium: true } })),
      resetData: () => patch({ transactions: [], budgets: [], contacts: [], chat: [], integrations: { whatsapp: false, telegram: false } }),
      restoreSample: () => patch(sampleState()),
      deleteAccount: () => setState(initialState()),
    }),
    [patch],
  );

  const value = useMemo(
    () => ({ ...state, ...actions, notify, toast, catat, openCatat: setCatat, closeCatat: () => setCatat(null), premiumOpen: premium, setPremiumOpen: setPremium }),
    [state, actions, notify, toast, catat, premium],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);

/** Finds a top-level category or sub-category, with its parent. */
export const findCategory = (categories, id) => {
  for (const c of categories) {
    if (c.id === id) return { ...c, parent: null };
    const child = c.children.find((x) => x.id === id);
    if (child) return { ...child, icon: c.icon, type: c.type, group: c.group, children: [], parent: c };
  }
  return { id, name: 'Belum Terkategori', icon: '❔', type: 'expense', group: 'none', children: [], parent: null };
};

export const rootCategoryId = (categories, id) => findCategory(categories, id).parent?.id ?? id;

/** A wallet's balance: opening balance plus everything recorded against it. */
export const walletBalance = (wallet, transactions) =>
  transactions.reduce((sum, t) => {
    if (t.type === 'income' && t.walletId === wallet.id) return sum + t.amount;
    if (t.type === 'expense' && t.walletId === wallet.id) return sum - t.amount;
    if (t.type === 'transfer') {
      if (t.walletId === wallet.id) return sum - t.amount;
      if (t.toWalletId === wallet.id) return sum + t.amount;
    }
    return sum;
  }, wallet.initial || 0);

export const inRange = (t, from, to) => t.date >= from && t.date <= to;
export const counted = (t) => !t.excluded;
