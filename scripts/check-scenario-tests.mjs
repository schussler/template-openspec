#!/usr/bin/env node
// Confere se cada cenário tem um teste cujo texto contém "<capability> / <nome do cenário>".
// Sem dependências. Sai com código 1 se faltar algum.
//   node scripts/check-scenario-tests.mjs                  specs principais (openspec/specs/)
//   node scripts/check-scenario-tests.mjs --change <nome>  cenários ADDED/MODIFIED da change
// Os testes são procurados no repositório todo, exceto as pastas em SKIP.
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const SKIP = new Set([".git", "node_modules", "openspec", ".claude", ".agents", "dist", "build", "coverage", ".next", "vendor"]);
const args = process.argv.slice(2);
const ci = args.indexOf("--change");
const change = ci >= 0 ? args[ci + 1] : null;
const specsDir = change ? join(root, "openspec", "changes", change, "specs") : join(root, "openspec", "specs");
if (change && !existsSync(specsDir)) { console.error(`Change sem specs: ${relative(root, specsDir)}`); process.exit(2); }

function walk(dir, onFile, skip = SKIP) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { if (!skip.has(e.name)) walk(p, onFile, skip); }
    else if (e.isFile()) onFile(p);
  }
}

// 1. Cenários (num delta, os de REMOVED não precisam de teste)
const scenarios = [];
if (existsSync(specsDir)) {
  walk(specsDir, (p) => {
    if (!p.endsWith(`${sep}spec.md`)) return;
    const capability = relative(specsDir, p).split(sep).slice(0, -1).join("/");
    let removed = false;
    for (const line of readFileSync(p, "utf8").split("\n")) {
      const sec = line.match(/^##\s+(ADDED|MODIFIED|REMOVED|RENAMED)\s+Requirements/i);
      if (sec) { removed = /REMOVED/i.test(sec[1]); continue; }
      const m = line.match(/^####\s+Scenario:\s*(.+?)\s*$/);
      if (m && !removed) scenarios.push({ capability, scenario: m[1], file: relative(root, p) });
    }
  }, new Set());
}
if (scenarios.length === 0) { console.log(`Nenhum cenário em ${relative(root, specsDir)}/. Nada a conferir.`); process.exit(0); }

// 2. Texto dos arquivos onde podem estar os testes
let corpus = "";
walk(root, (p) => { try { if (statSync(p).size < 1_000_000) corpus += readFileSync(p, "utf8") + "\n"; } catch {} });

// 3. Cenários sem teste
const missing = scenarios.filter(({ capability, scenario }) => !corpus.includes(`${capability} / ${scenario}`));
for (const s of missing) console.log(`SEM TESTE  ${s.capability} / ${s.scenario}   (${s.file})`);
console.log(`${scenarios.length - missing.length}/${scenarios.length} cenários com teste.`);
process.exit(missing.length ? 1 : 0);
