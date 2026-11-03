#!/usr/bin/env node
// Gate de implementação: roda os comandos de template.json → checks (test, lint e
// typecheck, nessa ordem), cada um com tempo limite, e imprime uma tabela com o resultado.
// Cada comando roda em grupo de processos próprio; no tempo limite, o grupo inteiro é
// encerrado (SIGTERM e, se preciso, SIGKILL).
//
// Check igual a false: "não se aplica", pulado sem afetar a saída. null ou vazio: não
// configurado.
//
// Uso: node scripts/gates/implement-gate.mjs [--timeout-min <minutos>]   (padrão: 10)
// Saída: 0 todos passaram; 1 algum falhou ou estourou o tempo; 2 falta configuração.
// Autoteste: node scripts/gates/implement-gate.selftest.mjs
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CHECKS = ["test", "lint", "typecheck"];
const TAIL_LINES = 40;
const KILL_GRACE_MS = 3000;

function stop(message) {
  console.error(message);
  process.exit(2);
}

function parseTimeoutMs(argv) {
  const i = argv.indexOf("--timeout-min");
  if (i === -1) return 10 * 60_000;
  const minutes = Number(argv[i + 1]);
  if (!(minutes > 0)) stop("--timeout-min precisa de um número de minutos maior que zero");
  return minutes * 60_000;
}

function readChecks(root) {
  let manifest;
  try {
    manifest = JSON.parse(readFileSync(join(root, "template.json"), "utf8"));
  } catch (err) {
    stop(`não foi possível ler template.json: ${err.message}`);
  }
  const checks = manifest.checks ?? {};
  const missing = CHECKS.filter(
    (name) => checks[name] !== false && (typeof checks[name] !== "string" || checks[name].trim() === ""),
  );
  if (missing.length) stop(missing.map((name) => `preencha template.json → checks.${name}`).join("\n"));
  return checks;
}

// Um node --test aninhado que herda NODE_TEST_CONTEXT reporta ao runner pai em vez de
// imprimir o próprio resultado; o gate remove a variável.
function childEnv() {
  const { NODE_TEST_CONTEXT: _ignored, ...env } = process.env;
  return env;
}

function killGroup(pid, signal) {
  try {
    process.kill(-pid, signal);
  } catch {}
}

function run(command, timeoutMs) {
  const started = Date.now();
  return new Promise((resolve) => {
    const child = spawn("sh", ["-c", command], { env: childEnv(), detached: true });
    const chunks = [];
    let timedOut = false;
    let forceKill;
    const timer = setTimeout(() => {
      timedOut = true;
      killGroup(child.pid, "SIGTERM");
      forceKill = setTimeout(() => killGroup(child.pid, "SIGKILL"), KILL_GRACE_MS);
    }, timeoutMs);
    child.stdout.on("data", (c) => chunks.push(c));
    child.stderr.on("data", (c) => chunks.push(c));
    child.on("close", (code) => {
      clearTimeout(timer);
      clearTimeout(forceKill);
      resolve({ code, timedOut, ms: Date.now() - started, output: Buffer.concat(chunks).toString("utf8") });
    });
  });
}

function table(rows) {
  const head = ["check", "comando", "resultado", "tempo"];
  const widths = head.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
  const line = (cells) => "| " + cells.map((c, i) => c.padEnd(widths[i])).join(" | ") + " |";
  return [line(head), "|" + widths.map((w) => "-".repeat(w + 2)).join("|") + "|", ...rows.map(line)].join("\n");
}

const timeoutMs = parseTimeoutMs(process.argv.slice(2));
const checks = readChecks(process.cwd());
const results = [];
for (const name of CHECKS) {
  if (checks[name] === false) results.push({ name, skipped: true });
  else results.push({ name, command: checks[name], ...(await run(checks[name], timeoutMs)) });
}

const minutes = timeoutMs / 60_000;
const verdict = (r) => (r.timedOut ? `timeout (${minutes} min)` : r.code === 0 ? "passou" : `falhou (código ${r.code})`);
const row = (r) =>
  r.skipped ? [r.name, "—", "não se aplica", "—"] : [r.name, r.command, verdict(r), `${(r.ms / 1000).toFixed(1)}s`];
console.log(table(results.map(row)));

const failed = results.filter((r) => !r.skipped && (r.timedOut || r.code !== 0));
for (const r of failed) {
  console.log(`\n--- ${r.name}: últimas ${TAIL_LINES} linhas da saída`);
  if (r.timedOut) console.log(`excedeu o tempo limite de ${minutes} min e foi encerrado`);
  console.log(r.output.trimEnd().split("\n").slice(-TAIL_LINES).join("\n"));
}
process.exit(failed.length ? 1 : 0);
