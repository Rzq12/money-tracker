import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { defaultCategories, defaultWallets, emptyState, initialState, sampleState, uid } from './seed.js';
import { addDays, addMonths, today } from './format.js';
import { applyRules, normalizeTags } from './rules.js';
import { walletBalance } from './money.js';

const KEY = 'uangku.state.v1';
const StoreContext = createContext(null);

const ARRAY_KEYS = ['transactions', 'budgets', 'contacts', 'goals', 'holdings', 'recurring', 'rules', 'splits', 'chat'];

const withDefaults = (saved) => {
  const base = initialState();
  const merged = {
    ...base,
    ...(saved || {}),
    user: { ...base.user, ...(saved?.user || {}) },
    features: { ...base.features, ...(saved?.features || {}) },
    rates: { ...base.rates, ...(saved?.rates || {}) },
    integrations: { ...base.integrations, ...(saved?.integrations || {}) },
    profileAnswers: { ...base.profileAnswers, ...(saved?.profileAnswers || {}) },
  };
  ARRAY_KEYS.forEach((key) => {
    if (!Array.isArray(merged[key])) merged[key] = base[key];
  });
  if (!Array.isArray(merged.wallets) || merged.wallets.length === 0) merged.wallets = base.wallets;
  if (!Array.isArray(merged.categories) || merged.categories.length === 0) merged.categories = base.categories;
  merged.categories = merged.categories.map((c) => ({ ...c, children: Array.isArray(c.children) ? c.children : [] }));
  merged.contacts = merged.contacts.map((c) => ({ ...c, records: Array.isArray(c.records) ? c.records : [] }));
  merged.budgets = merged.budgets.map((b) => ({ ...b, items: Array.isArray(b.items) ? b.items : [] }));
  merged.splits = merged.splits.map((sp) => ({
    ...sp,
    participants: Array.isArray(sp.participants) ? sp.participants : [],
    items: Array.isArray(sp.items) ? sp.items : [],
  }));
  return merged;
};

const load = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return withDefaults(JSON.parse(raw));
  } catch {
    /* a broken saved copy falls back to a clean start */
  }
  return initialState();
};

const nextRecurringDate = (date, frequency) => {
  if (!date) return today();
  if (frequency === 'daily') return addDays(date, 1);
  if (frequency === 'weekly') return addDays(date, 7);
  return addMonths(date, 1);
};

/** Posts every recurring entry whose next date has arrived. */
const dueRecurring = (state) => {
  const now = today();
  let posted = 0;
  const transactions = [];
  const recurring = state.recurring.map((item) => {
    if (item.active === false) return item;
    let next = item.nextDate || now;
    let itemPosted = 0;
    while (next <= now && itemPosted < 60) {
      transactions.push({
        id: uid('t'),
        type: item.type || 'expense',
        categoryId: item.categoryId || (item.type === 'income' ? 'pemasukan-lain' : 'lain-lain'),
        note: item.title || 'Transaksi berulang',
        amount: Number(item.amount) || 0,
        walletId: item.walletId,
        date: next,
        excluded: false,
        tags: ['berulang'],
        recurringId: item.id,
        createdAt: now,
      });
      next = nextRecurringDate(next, item.frequency);
      itemPosted += 1;
      posted += 1;
    }
    return { ...item, nextDate: next, lastPosted: itemPosted ? now : item.lastPosted };
  });
  if (!posted) return null;
  return {
    posted,
    state: { ...state, recurring, transactions: [...transactions, ...state.transactions] },
  };
};

const cleanTransaction = (tx, rules) => {
  const resolved = tx.type === 'transfer' ? 'transfer' : applyRules(rules, tx.note, tx.categoryId, tx.type);
  return {
    ...tx,
    amount: Number(tx.amount) || 0,
    tags: normalizeTags(tx.tags),
    categoryId: resolved || (tx.type === 'income' ? 'pemasukan-lain' : 'lain-lain'),
    createdAt: tx.createdAt || today(),
  };
};

/** Everything lives in this browser: nothing is sent anywhere. */
export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const [toast, setToast] = useState('');
  const [catat, setCatat] = useState(null);
  const [premium, setPremium] = useState(false);
  const timer = useRef();
  const postedOnce = useRef(false);
  const pendingNotice = useRef(0);

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

  useEffect(() => {
    if (postedOnce.current) return;
    postedOnce.current = true;
    setState((current) => {
      const result = dueRecurring(current);
      if (!result) return current;
      pendingNotice.current = result.posted;
      return result.state;
    });
    const id = setTimeout(() => {
      if (pendingNotice.current) {
        notify(`${pendingNotice.current} transaksi berulang otomatis dicatat.`);
        pendingNotice.current = 0;
      }
    }, 60);
    return () => clearTimeout(id);
  }, [notify]);

  const patch = useCallback((update) => setState((s) => ({ ...s, ...(typeof update === 'function' ? update(s) : update) })), []);

  const actions = useMemo(
    () => ({
      login: () => patch({ loggedIn: true }),
      logout: () => patch({ loggedIn: false }),
      finishOnboarding: (answers = {}) => patch((s) => ({ onboarded: true, profileAnswers: { ...s.profileAnswers, ...answers } })),
      saveProfile: (profile) => patch((s) => ({ user: { ...s.user, ...profile } })),
      saveTransaction: (tx) =>
        patch((s) => {
          const clean = cleanTransaction(tx, s.rules);
          const exists = tx.id && s.transactions.some((t) => t.id === tx.id);
          return {
            transactions: exists
              ? s.transactions.map((t) => (t.id === tx.id ? { ...t, ...clean } : t))
              : [{ ...clean, id: uid('t') }, ...s.transactions],
          };
        }),
      addTransactions: (list) => patch((s) => ({ transactions: [...list.map((t) => ({ ...cleanTransaction(t, s.rules), id: uid('t') })), ...s.transactions] })),
      deleteTransaction: (id) => patch((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
      saveWallet: (wallet) =>
        patch((s) => ({
          wallets: wallet.id
            ? s.wallets.map((w) => (w.id === wallet.id ? { ...w, ...wallet, currency: wallet.currency || w.currency || 'IDR' } : w))
            : [...s.wallets, { ...wallet, id: uid('w'), currency: wallet.currency || 'IDR' }],
        })),
      deleteWallet: (id) =>
        patch((s) => ({
          wallets: s.wallets.filter((w) => w.id !== id),
          transactions: s.transactions.filter((t) => t.walletId !== id && t.toWalletId !== id),
          goals: s.goals.map((g) => (g.walletId === id ? { ...g, walletId: '' } : g)),
        })),
      setRate: (code, value) => patch((s) => ({ rates: { ...s.rates, [code]: Math.max(0.000001, Number(value) || 1) } })),
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
      setStartDay: (startDay) => patch({ startDay: Math.min(31, Math.max(1, Number(startDay) || 1)) }),
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
      saveGoal: (goal) =>
        patch((s) => ({
          goals: goal.id
            ? s.goals.map((g) => (g.id === goal.id ? { ...g, ...goal } : g))
            : [...s.goals, { ...goal, id: uid('g'), created: today() }],
        })),
      deleteGoal: (id) => patch((s) => ({
        goals: s.goals.filter((g) => g.id !== id),
        transactions: s.transactions.map((t) => (t.goalId === id ? { ...t, goalId: null } : t)),
      })),
      addGoalContribution: (goalId, { walletId, amount, date = today() }) => patch((s) => {
        const goal = s.goals.find((g) => g.id === goalId);
        const value = Number(amount) || 0;
        if (!goal || !goal.walletId || !walletId || walletId === goal.walletId || value <= 0) return {};
        return {
          transactions: [{
            id: uid('t'),
            type: 'transfer',
            categoryId: 'transfer',
            note: `Tabungan: ${goal.name}`,
            amount: value,
            walletId,
            toWalletId: goal.walletId,
            date,
            excluded: false,
            tags: ['tujuan'],
            goalId,
            createdAt: date,
          }, ...s.transactions],
        };
      }),
      saveHolding: (holding) =>
        patch((s) => ({
          holdings: holding.id
            ? s.holdings.map((h) => (h.id === holding.id ? { ...h, ...holding } : h))
            : [...s.holdings, { ...holding, id: uid('h') }],
        })),
      deleteHolding: (id) => patch((s) => ({ holdings: s.holdings.filter((h) => h.id !== id) })),
      saveRecurring: (item) =>
        patch((s) => ({
          recurring: item.id
            ? s.recurring.map((r) => (r.id === item.id ? { ...r, ...item } : r))
            : [...s.recurring, { ...item, id: uid('rec'), active: true, nextDate: item.nextDate || today() }],
        })),
      deleteRecurring: (id) => patch((s) => ({ recurring: s.recurring.filter((r) => r.id !== id) })),
      postRecurringNow: (id) =>
        patch((s) => {
          const item = s.recurring.find((r) => r.id === id);
          if (!item) return s;
          const date = today();
          const tx = {
            id: uid('t'),
            type: item.type || 'expense',
            categoryId: item.categoryId || (item.type === 'income' ? 'pemasukan-lain' : 'lain-lain'),
            note: item.title || 'Transaksi berulang',
            amount: Number(item.amount) || 0,
            walletId: item.walletId,
            date,
            excluded: false,
            tags: ['berulang'],
            recurringId: item.id,
            createdAt: date,
          };
          return {
            transactions: [tx, ...s.transactions],
            recurring: s.recurring.map((r) => (r.id === id ? { ...r, nextDate: nextRecurringDate(date, r.frequency), lastPosted: date } : r)),
          };
        }),
      saveRule: (rule) =>
        patch((s) => ({
          rules: rule.id
            ? s.rules.map((r) => (r.id === rule.id ? { ...r, ...rule } : r))
            : [...s.rules, { ...rule, id: uid('rule'), active: true }],
        })),
      deleteRule: (id) => patch((s) => ({ rules: s.rules.filter((r) => r.id !== id) })),
      saveSplit: (split) =>
        patch((s) => {
          const exists = split.id && s.splits.some((x) => x.id === split.id);
          return {
            splits: exists
              ? s.splits.map((x) => (x.id === split.id ? { ...x, ...split } : x))
              : [...s.splits, { ...split, id: split.id || uid('split') }],
          };
        }),
      deleteSplit: (id) => patch((s) => ({ splits: s.splits.filter((x) => x.id !== id) })),
      toggleSplitPaid: (splitId, participantId) =>
        patch((s) => ({
          splits: s.splits.map((x) => (x.id === splitId
            ? { ...x, participants: x.participants.map((p) => (p.id === participantId ? { ...p, paid: !p.paid } : p)) }
            : x)),
        })),
      setIntegration: (key, value) => patch((s) => ({ integrations: { ...s.integrations, [key]: value } })),
      setChat: (chat) => patch({ chat }),
      setPremiumPlan: () => patch((s) => ({ user: { ...s.user, premium: true } })),
      resetData: () => patch({
        transactions: [], budgets: [], contacts: [], goals: [], holdings: [], recurring: [], rules: [], splits: [],
        chat: [], integrations: { whatsapp: false, telegram: false, email: false },
      }),
      restoreSample: () => patch((s) => ({
        ...sampleState(),
        categories: s.categories?.length ? s.categories : defaultCategories(),
        features: s.features,
        rates: s.rates,
        user: s.user,
        startDay: s.startDay,
        loggedIn: s.loggedIn,
        onboarded: s.onboarded,
      })),
      replaceState: (backup) => setState(withDefaults({ ...backup, loggedIn: Boolean(backup?.loggedIn) })),
      deleteAccount: () => setState(emptyState()),
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

export { walletBalance };

export const inRange = (t, from, to) => t.date >= from && t.date <= to;
export const counted = (t) => !t.excluded;
export const goalSaved = (goal, transactions) => transactions
  .filter((t) => t.goalId === goal.id && t.type === 'transfer')
  .reduce((sum, t) => sum + t.amount, 0);
