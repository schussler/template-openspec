// Autoteste de implement-gate.mjs: roda o gate em projetos temporários com template.json.
// Uso: node scripts/gates/implement-gate.selftest.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const GATE = fileURLToPath(new URL("./implement-gate.mjs", import.meta.url));
const OK = `node -e "process.exit(0)"`;

function gate(checks, args = []) {
  const dir = mkdtempSync(join(tmpdir(), "implement-gate-"));
  try {
    writeFileSync(join(dir, "template.json"), JSON.stringify({ checks }));
    const started = Date.now();
    const r = spawnSync(process.execPath, [GATE, ...args], { cwd: dir, encoding: "utf8" });
    return { code: r.status, out: r.stdout + r.stderr, ms: Date.now() - started };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("todos os checks passam: sai com 0", () => {
  const r = gate({ test: OK, lint: OK, typecheck: OK });
  assert.equal(r.code, 0, r.out);
  for (const name of ["test", "lint", "typecheck"]) assert.match(r.out, new RegExp(`\\| ${name}\\s+\\|.*\\| passou`));
});

test("um check falha: sai com 1 e mostra as últimas 40 linhas", () => {
  const noisy = `node -e "for (let i = 1; i <= 50; i++) console.log('linha-' + i); process.exit(3)"`;
  const r = gate({ test: OK, lint: noisy, typecheck: OK });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\| lint\s+\|.*\| falhou \(código 3\)/);
  assert.match(r.out, /\| typecheck\s+\|.*\| passou/);
  assert.match(r.out, /--- lint: últimas 40 linhas/);
  assert.match(r.out, /^linha-11$/m);
  assert.match(r.out, /^linha-50$/m);
  assert.doesNotMatch(r.out, /^linha-10$/m);
});

test("check null ou vazio: sai com 2 e pede para preencher", () => {
  const r = gate({ test: OK, lint: null, typecheck: "  " });
  assert.equal(r.code, 2, r.out);
  assert.match(r.out, /preencha template\.json → checks\.lint/);
  assert.match(r.out, /preencha template\.json → checks\.typecheck/);
  assert.doesNotMatch(r.out, /\| test /);
});

test("check false (não se aplica): é pulado e não afeta a saída", () => {
  const r = gate({ test: OK, lint: OK, typecheck: false });
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /\| typecheck\s+\|.*\| não se aplica/);
  assert.match(r.out, /\| test\s+\|.*\| passou/);
});

test("timeout: sai com 1, com a mensagem de timeout, sem esperar o comando", () => {
  const slow = `node -e "setTimeout(() => {}, 60000)"`;
  const r = gate({ test: slow, lint: OK, typecheck: OK }, ["--timeout-min", "0.02"]);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /\| test\s+\|.*\| timeout \(0\.02 min\)/);
  assert.match(r.out, /excedeu o tempo limite de 0\.02 min/);
  assert.ok(r.ms < 20_000, `demorou ${r.ms} ms`);
});
