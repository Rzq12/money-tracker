import { BRAND } from '../lib/seed.js';

/** A neutral placeholder mark we drew ourselves, not the original's logo. */
export default function Logo({ small = false }) {
  return <img src="/logo.svg" alt={BRAND} width="106" height="32" className={`${small ? 'h-5' : 'h-8'} block w-auto`} />;
}

/** A plain coloured disc with a letter, standing in for a bank or e-wallet logo. */
export const letterIcon = (name, color) => {
  const letter = name.replace(/\s*\(.*/, '').split(' ').pop().slice(0, 1).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44"><circle cx="22" cy="22" r="22" fill="${color}"/><text x="22" y="28" font-family="sans-serif" font-size="17" font-weight="700" fill="#fff" text-anchor="middle">${letter}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};
