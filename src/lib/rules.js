/** Applies keyword rules when a transaction has no meaningful category yet. */
export const applyRules = (rules, note, categoryId, type = 'expense') => {
  if (categoryId && categoryId !== 'lain-lain' && categoryId !== 'other') return categoryId;
  const text = String(note || '').toLowerCase();
  if (!text) return categoryId;
  const hit = (rules || []).find((rule) => {
    if (rule.active === false) return false;
    if (rule.type && rule.type !== type) return false;
    const keyword = String(rule.keyword || '').trim().toLowerCase();
    return keyword && text.includes(keyword);
  });
  return hit?.categoryId || categoryId;
};

export const normalizeTags = (input) => {
  const list = Array.isArray(input) ? input : String(input || '').split(',');
  return [...new Set(list
    .map((tag) => String(tag).trim().replace(/^#+/, '').replace(/\s+/g, ' '))
    .filter(Boolean)
    .map((tag) => tag.slice(0, 24)))]
    .slice(0, 12);
};

export const tagCounts = (transactions) => {
  const map = new Map();
  transactions.forEach((t) => normalizeTags(t.tags).forEach((tag) => map.set(tag, (map.get(tag) || 0) + 1)));
  return [...map].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};
