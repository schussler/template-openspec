#!/usr/bin/env node
// Confere se cada cenário tem um teste cujo texto contém "<capability> / <nome do cenário>".
// Sem dependências. Sai com código 1 se faltar algum.
//   node scripts/check-scenario-tests.mjs                  specs principais (openspec/specs/)
//   node scripts/check-scenario-tests.mjs --change <nome>  cenários ADDED/MODIFIED da change
// Os testes são procurados só em arquivos de teste (ver isTestFile), fora das pastas em SKIP.
// Autoteste: node scripts/check-scenario-tests.selftest.mjs
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const SKIP = new Set([".git", "node_modules", "openspec", ".claude", ".agents", "dist", "build", "coverage", ".next", "vendor"]);
const args = process.argv.slice(2);
const ci = args.indexOf("--change");
const change = ci >= 0 ? args[ci + 1] : null;
const specsDir = change ? join(root, "openspec", "changes", change, "specs") : join(root, "openspec", "specs");
// Change sem delta (stack, tooling, refatoração) declara skip_specs: true no .openspec.yaml.
const meta = change ? join(root, "openspec", "changes", change, ".openspec.yaml") : null;
if (meta && existsSync(meta) && /^skip_specs:\s*true\s*(#.*)?$/m.test(readFileSync(meta, "utf8"))) {
  console.log("change declara skip_specs: sem cenários a conferir");
  process.exit(0);
}
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

// 2. Texto dos arquivos de teste: caminho com diretório test/, tests/, __tests__/ ou spec/,
//    ou nome *.test.*, *.spec.*, *_test.* ou test_*. Arquivos .md nunca contam.
const TEST_DIRS = new Set(["test", "tests", "__tests__", "spec"]);
function isTestFile(p) {
  const parts = relative(root, p).split(sep);
  const name = parts.at(-1);
  if (name.endsWith(".md")) return false;
  if (parts.slice(0, -1).some((d) => TEST_DIRS.has(d))) return true;
  return /\.(test|spec)\./.test(name) || /_test\./.test(name) || name.startsWith("test_");
}
let corpus = "";
walk(root, (p) => { try { if (isTestFile(p) && statSync(p).size < 1_000_000) corpus += readFileSync(p, "utf8") + "\n"; } catch {} });

// 3. Cenários sem teste
const missing = scenarios.filter(({ capability, scenario }) => !corpus.includes(`${capability} / ${scenario}`));
for (const s of missing) console.log(`SEM TESTE  ${s.capability} / ${s.scenario}   (${s.file})`);
console.log(`${scenarios.length - missing.length}/${scenarios.length} cenários com teste.`);
process.exit(missing.length ? 1 : 0);
