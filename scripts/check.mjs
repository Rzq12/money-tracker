// A dependency-free sanity check: every relative import must resolve on disk.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'src');
const problems = [];
const warnings = [];

const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) walk(full);
    else if (/\.(jsx?|mjs)$/.test(entry)) check(full);
  }
};

const candidates = (target) => [
  target,
  `${target}.js`,
  `${target}.jsx`,
  `${target}.json`,
  join(target, 'index.js'),
  join(target, 'index.jsx'),
];

const check = (file) => {
  const code = readFileSync(file, 'utf8');
  const imports = [...code.matchAll(/(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g)];
  for (const [, spec] of imports) {
    if (!spec.startsWith('.')) continue;
    const target = resolve(dirname(file), spec);
    if (!candidates(target).some((candidate) => existsSync(candidate))) {
      problems.push(`${file.replace(root, '.')}: tidak menemukan ${spec}`);
    }
  }
  if (/href="#"/.test(code)) warnings.push(`${file.replace(root, '.')}: tautan href="#" mati`);
};

walk(src);

for (const warning of warnings) console.warn(`warn  ${warning}`);
for (const problem of problems) console.error(`error ${problem}`);
if (problems.length) {
  console.error(`\n${problems.length} import bermasalah.`);
  process.exit(1);
}
console.log(`OK: semua import relatif ditemukan${warnings.length ? ` (${warnings.length} peringatan)` : ''}.`);
