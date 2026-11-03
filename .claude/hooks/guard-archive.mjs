#!/usr/bin/env node
// Hook PreToolUse do Claude Code. Bloqueia o archive de uma change do OpenSpec (e a escrita
// nas specs principais) sem review.md com "VERDICT: APPROVED" e sem verification.md.
// exit 2 = bloqueia a ferramenta e envia o stderr ao agente.
// O comando Bash é separado em palavras respeitando aspas e sem os corpos de heredoc: texto
// entre aspas ou num heredoc nunca é lido como comando, mas argumentos entre aspas (como os
// caminhos do `mv` da skill de archive) continuam sendo lidos.
// Limitações conhecidas: barra o caminho normal da skill de archive, não um contorno
// deliberado. Não detecta `cd` antes do `mv`, `cp -r` para archive/, escrita nas specs pelo
// Bash (echo, sed, cat >, python), nem comandos dentro de `bash -c`, `eval` ou de scripts.
// Não detecta `git -C <dir> mv`.
// Vale só no Claude Code; o CI (scripts/check-specs-archived.mjs) cobre os PRs.
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
// Separa um comando Bash em comandos simples (listas de palavras). Remove os corpos de heredoc,
// junta o conteúdo entre aspas à palavra em que está e divide em ; & | ( ) e quebras de linha.
// Atribuições iniciais (VAR=valor) são descartadas, para que a primeira palavra seja o comando.
function simpleCommands(cmd) {
  cmd = cmd.replace(/<<-?[ \t]*(['"]?)([A-Za-z_][\w-]*)\1[^\n]*\n[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$)/g, (m) => m.slice(0, m.indexOf("\n")));
  const cmds = [];
  let words = [], cur = "", has = false;
  const endWord = () => { if (has) words.push(cur); cur = ""; has = false; };
  const endCmd = () => { endWord(); if (words.length) cmds.push(words); words = []; };
  for (let i = 0; i < cmd.length; i++) {
    const c = cmd[i];
    if (c === "'") { const j = cmd.indexOf("'", i + 1); const e = j < 0 ? cmd.length : j; cur += cmd.slice(i + 1, e); has = true; i = e; }
    else if (c === '"') { let j = i + 1; for (; j < cmd.length && cmd[j] !== '"'; j++) cur += cmd[j] === "\\" ? cmd[++j] ?? "" : cmd[j]; has = true; i = j; }
    else if (c === "\\") { cur += cmd[++i] ?? ""; has = true; }
    else if (c === "&" && /[<>]$/.test(cur)) { cur += c; has = true; } // 2>&1
    else if (";&|()\n".includes(c)) endCmd();
    else if (/\s/.test(c)) endWord();
    else { cur += c; has = true; }
  }
  endCmd();
  return cmds
    .map((w) => { const k = w.findIndex((x) => !/^[A-Za-z_]\w*=/.test(x)); return k < 0 ? [] : w.slice(k); })
    .filter((w) => w.length);
}

// Remove redireções (>, >>, <, <<, 2>&1) e, quando o operador vem solto, o alvo dele.
function withoutRedirects(words) {
  const out = [];
  for (let i = 0; i < words.length; i++) {
    const m = words[i].match(/^\d*(?:>>?|<<?-?)(&?)(.*)$/);
    if (!m) out.push(words[i]);
    else if (!m[1] && m[2] === "") i++;
  }
  return out;
}

const tool = input.tool_name;
const ti = input.tool_input ?? {};

if (tool === "Bash") {
  // Tira prefixos que só repassam o comando (sudo, env, npx...), o caminho do executável
  // (/usr/bin/mv → mv) e trata `git mv` como `mv`.
  const WRAPPERS = new Set(["sudo", "env", "command", "exec", "nohup", "time", "npx", "pnpm", "yarn", "bunx", "pnpx"]);
  const normalize = (w) => {
    w = [...w];
    while (w.length && (WRAPPERS.has(w[0].split("/").at(-1)) || /^-/.test(w[0]) || /^[A-Za-z_]\w*=/.test(w[0]))) w.shift();
    if (w.length) w[0] = w[0].split("/").at(-1);
    if (w[0] === "git" && w[1] === "mv") w.shift();
    return w;
  };
  for (const [name, ...rest] of simpleCommands(ti.command ?? "").map(normalize).filter((w) => w.length)) {
    const args = withoutRedirects(rest).filter((a) => a && !a.startsWith("-"));
    // 1. openspec archive <nome>
    if (name === "openspec" && args[0] === "archive") {
      const names = args.slice(1);
      if (names.length !== 1) block("Use `openspec archive <nome-da-change>` com exatamente uma change, para que review.md e verification.md possam ser conferidos.");
      const why = notReady(names[0]); if (why) block(why);
    }
    // 2. mv openspec/changes/<nome> .../archive/... (é assim que a skill de archive move a change)
    if (name !== "mv" || args.length < 2 || !/(^|\/)archive(\/|$)/.test(args.at(-1))) continue;
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
