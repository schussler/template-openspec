#!/usr/bin/env node
// Guarda de PR: se o PR muda openspec/specs/, ele precisa adicionar ao menos uma pasta em
// openspec/changes/archive/ com review.md contendo "VERDICT: APPROVED" e um verification.md.
// Sem dependências. Sai com 1 se a regra for violada.
//   node scripts/check-specs-archived.mjs --base <ref>   (no CI: origin/<branch base do PR>)
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const args = process.argv.slice(2);
const bi = args.indexOf("--base");
const base = bi >= 0 ? args[bi + 1] : null;
if (!base) { console.error("Uso: node scripts/check-specs-archived.mjs --base <ref>"); process.exit(2); }

const git = (...a) => execFileSync("git", a, { encoding: "utf8" }).trim();
let mergeBase;
try { mergeBase = git("merge-base", base, "HEAD"); }
catch { console.error(`Não achei a base "${base}". No CI, faça o checkout com fetch-depth: 0.`); process.exit(2); }

const changes = git("diff", "--name-status", "--no-renames", `${mergeBase}..HEAD`)
  .split("\n").filter(Boolean).map((l) => { const [status, ...p] = l.split("\t"); return { status, path: p.join("\t") }; });

const specs = changes.filter(({ path }) => path.startsWith("openspec/specs/") && !path.endsWith("/.gitkeep"));
if (specs.length === 0) { console.log("Nenhuma alteração em openspec/specs/."); process.exit(0); }

// Pastas de archive que o PR adicionou (não existiam na base)
const ARCHIVE = "openspec/changes/archive/";
const added = new Set(
  changes.filter(({ status, path }) => status === "A" && path.startsWith(ARCHIVE) && path.slice(ARCHIVE.length).includes("/"))
    .map(({ path }) => path.slice(ARCHIVE.length).split("/")[0])
);
// Variante sem stderr: o cat-file de uma pasta nova escreveria "fatal: path ... exists on disk".
const gitQuiet = (...a) => execFileSync("git", a, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
const existedAtBase = (dir) => { try { gitQuiet("cat-file", "-e", `${mergeBase}:${ARCHIVE}${dir}`); return true; } catch { return false; } };

const problems = [];
let ok = false;
for (const dir of added) {
  if (existedAtBase(dir)) continue;
  const review = `${ARCHIVE}${dir}/review.md`;
  const missing = [];
  if (!existsSync(review) || !/^VERDICT:\s*APPROVED\b/m.test(readFileSync(review, "utf8"))) missing.push('review.md com "VERDICT: APPROVED"');
  if (!existsSync(`${ARCHIVE}${dir}/verification.md`)) missing.push("verification.md");
  if (missing.length === 0) ok = true;
  else problems.push(`  ${ARCHIVE}${dir}/: falta ${missing.join(" e ")}`);
}
if (ok) { console.log(`openspec/specs/ mudou (${specs.length} arquivo(s)) e o PR arquiva uma change revisada e verificada.`); process.exit(0); }

console.error("Este PR altera openspec/specs/ sem arquivar uma change revisada e verificada:");
for (const { path } of specs) console.error(`  ${path}`);
console.error(problems.length
  ? `Pastas adicionadas em ${ARCHIVE} que não servem:\n${problems.join("\n")}`
  : `Nenhuma pasta nova em ${ARCHIVE}.`);
console.error("As specs principais só mudam no archive de uma change com review.md (VERDICT: APPROVED) e verification.md. Veja AGENTS.md.");
process.exit(1);
