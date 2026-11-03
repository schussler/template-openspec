#!/usr/bin/env node
// Hook PreToolUse do Claude Code. Bloqueia o archive de uma change do OpenSpec (e a escrita
// nas specs principais) sem review.md com "VERDICT: APPROVED" e sem verification.md.
// exit 2 = bloqueia a ferramenta e envia o stderr ao agente.
// Limitações conhecidas: barra o caminho normal da skill de archive, não um contorno
// deliberado. Não detecta `cd` antes do `mv`, `cp -r` para archive/, nem escrita nas
// specs pelo Bash (echo, sed, cat >). Comandos que só citam "openspec archive" num texto
// são bloqueados por engano. Vale só no Claude Code.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve, relative, sep } from "node:path";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;
let input;
try { input = JSON.parse(raw); } catch { process.exit(0); }

const root = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd();
const changesDir = join(root, "openspec", "changes");
const block = (msg) => { console.error(`[guard-archive] ${msg}`); process.exit(2); };

// Retorna o motivo pelo qual a change não pode ser arquivada, ou null se pode.
function notReady(name) {
  const dir = join(changesDir, name);
  if (!existsSync(dir)) return null; // nome desconhecido: deixe a própria ferramenta reclamar
  const review = join(dir, "review.md");
  if (!existsSync(review) || !/^VERDICT:\s*APPROVED\b/m.test(readFileSync(review, "utf8")))
    return `openspec/changes/${name}/review.md não existe ou não contém "VERDICT: APPROVED". Rode a skill review-change antes de arquivar.`;
  if (!existsSync(join(dir, "verification.md")))
    return `openspec/changes/${name}/verification.md não existe. Escreva-o antes de arquivar.`;
  return null;
}
const activeChanges = () =>
  existsSync(changesDir)
    ? readdirSync(changesDir, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== "archive").map((d) => d.name)
    : [];
const unquote = (s) => s.replace(/^["']|["']$/g, "");

const tool = input.tool_name;
const ti = input.tool_input ?? {};

if (tool === "Bash") {
  const cmd = ti.command ?? "";
  // 1. openspec archive <nome>
  const cli = cmd.match(/\bopenspec\s+archive\b([^;&|]*)/);
  if (cli) {
    const names = cli[1].trim().split(/\s+/).map(unquote).filter((a) => a && !a.startsWith("-"));
    if (names.length !== 1) block("Use `openspec archive <nome-da-change>` com exatamente uma change, para que review.md e verification.md possam ser conferidos.");
    const why = notReady(names[0]); if (why) block(why);
  }
  // 2. mv openspec/changes/<nome> .../archive/... (é assim que a skill de archive move a change)
  for (const m of cmd.matchAll(/\bmv\b([^;&|]*)/g)) {
    const args = m[1].trim().split(/\s+/).map(unquote).filter((a) => a && !a.startsWith("-"));
    if (args.length < 2 || !/(^|\/)archive(\/|$)/.test(args.at(-1))) continue;
    for (const src of args.slice(0, -1)) {
      const rel = relative(changesDir, resolve(input.cwd || root, src));
      if (rel && !rel.startsWith("..") && !rel.includes(sep) && rel !== "archive") {
        const why = notReady(rel); if (why) block(why);
      }
    }
  }
  process.exit(0);
}

// 3. Escrita nas specs principais (a skill de archive sincroniza as specs antes de mover a change)
if (["Write", "Edit", "MultiEdit"].includes(tool) && ti.file_path) {
  const rel = relative(join(root, "openspec", "specs"), resolve(root, ti.file_path));
  if (!rel.startsWith("..")) {
    const ready = activeChanges().filter((n) => !notReady(n));
    if (ready.length === 0)
      block("openspec/specs/ só é alterado ao arquivar uma change com review.md APPROVED e verification.md. Nenhuma change ativa está pronta. Para mudar comportamento, abra uma change.");
  }
}
process.exit(0);
