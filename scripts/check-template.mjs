#!/usr/bin/env node
// Confere o manifesto template.json:
// - é JSON válido, com managed, owned e template_only como listas;
// - todo caminho das três listas existe (exceto os de owned que nascem no projeto);
// - nenhum caminho aparece em duas listas, nem dentro de um caminho de outra lista;
// - nenhum arquivo de managed contém caminho pessoal ou algo com cara de token.
//
// Uso: node scripts/check-template.mjs        (na raiz do repositório)
// Saída: 0 ok; 1 algum problema.
// Autoteste: node scripts/check-template.selftest.mjs
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const LISTS = ["managed", "owned", "template_only"];
const BORN_IN_PROJECT = new Set(["GLOSSARY.md", "docs/adr"]);
const SKIP_DIRS = new Set([".git", "node_modules"]);
const SUSPECT = [
  { what: "caminho pessoal", re: /\/(?:Users|home)\/[A-Za-z0-9._-]+/ },
  { what: "token", re: /\b(?:ghp|npm)_[A-Za-z0-9]{20,}/ },
  { what: "token", re: /\bsk-[A-Za-z0-9_-]{20,}/ },
];

const root = process.cwd();
const problems = [];
const norm = (p) => p.replace(/\/+$/, "");

function files(path) {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path, { withFileTypes: true })
    .filter((e) => !SKIP_DIRS.has(e.name))
    .flatMap((e) => files(join(path, e.name)));
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(join(root, "template.json"), "utf8"));
} catch (err) {
  console.error(`template.json inválido ou ausente: ${err.message}`);
  process.exit(1);
}

const entries = [];
for (const list of LISTS) {
  if (!Array.isArray(manifest[list])) {
    problems.push(`${list} precisa ser uma lista`);
    continue;
  }
  for (const raw of manifest[list]) entries.push({ list, path: norm(String(raw)) });
}

for (const { list, path } of entries) {
  if (list === "owned" && BORN_IN_PROJECT.has(path)) continue;
  if (!existsSync(join(root, path))) problems.push(`${list}: ${path} não existe`);
}

for (const [i, a] of entries.entries()) {
  for (const b of entries.slice(i + 1)) {
    if (a.list === b.list) continue;
    if (a.path === b.path) problems.push(`${a.path} aparece em ${a.list} e em ${b.list}`);
    else if (b.path.startsWith(a.path + "/")) problems.push(`${b.path} (${b.list}) fica dentro de ${a.path} (${a.list})`);
    else if (a.path.startsWith(b.path + "/")) problems.push(`${a.path} (${a.list}) fica dentro de ${b.path} (${b.list})`);
  }
}

for (const { list, path } of entries) {
  if (list !== "managed" || !existsSync(join(root, path))) continue;
  for (const file of files(join(root, path))) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, n) => {
      for (const { what, re } of SUSPECT) {
        if (re.test(line)) problems.push(`${relative(root, file)}:${n + 1}: ${what} em arquivo managed`);
      }
    });
  }
}

if (problems.length) {
  console.error(`template.json: ${problems.length} problema(s)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`template.json ok: ${entries.length} caminhos em ${LISTS.join(", ")}`);
