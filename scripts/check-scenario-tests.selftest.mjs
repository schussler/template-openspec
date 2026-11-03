#!/usr/bin/env node
// Autoteste de check-scenario-tests.mjs. Sem dependências: monta repositórios temporários e
// confere o código de saída e a saída do script. Uso: node scripts/check-scenario-tests.selftest.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), "check-scenario-tests.mjs");

function repo(files) {
  const dir = mkdtempSync(join(tmpdir(), "cst-"));
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, path)), { recursive: true });
    writeFileSync(join(dir, path), content);
  }
  return dir;
}

function run(dir, ...args) {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: dir, encoding: "utf8" });
  rmSync(dir, { recursive: true, force: true });
  return { code: r.status, out: r.stdout + r.stderr };
}

const SPEC = `# teste Specification

## Purpose

Capability fictícia para o autoteste.

## Requirements

### Requirement: Algo
O sistema SHALL fazer algo.

#### Scenario: Código expirado
- **WHEN** x
- **THEN** y
`;

const DELTA = `## ADDED Requirements

### Requirement: Novo
O sistema SHALL fazer algo novo.

#### Scenario: Cenário novo
- **WHEN** a
- **THEN** b

## REMOVED Requirements

### Requirement: Velho
**Reason**: x
**Migration**: y

#### Scenario: Cenário removido
- **WHEN** a
- **THEN** b
`;

test("sem specs: sai com 0", () => {
  const { code } = run(repo({ "package.json": "{}" }));
  assert.equal(code, 0);
});

test("cenário citado só num README: sai com 1", () => {
  const { code, out } = run(repo({
    "openspec/specs/teste/spec.md": SPEC,
    "README.md": "Exemplo: `teste / Código expirado`.",
  }));
  assert.equal(code, 1);
  assert.match(out, /SEM TESTE {2}teste \/ Código expirado/);
});

test("cenário citado num .md dentro de test/: sai com 1", () => {
  const { code } = run(repo({
    "openspec/specs/teste/spec.md": SPEC,
    "test/notas.md": "teste / Código expirado",
  }));
  assert.equal(code, 1);
});

test("cenário citado num arquivo de teste: sai com 0", () => {
  for (const arquivo of ["test/a.js", "tests/a.js", "src/__tests__/a.js", "spec/a.rb", "src/a.test.ts", "src/a.spec.js", "pkg/a_test.go", "test_a.py"]) {
    const { code } = run(repo({
      "openspec/specs/teste/spec.md": SPEC,
      [arquivo]: "test('teste / Código expirado', () => {})",
    }));
    assert.equal(code, 0, arquivo);
  }
});

test("--change com ADDED e REMOVED: só o ADDED é cobrado", () => {
  const sem = run(repo({ "openspec/changes/mud/specs/teste/spec.md": DELTA }), "--change", "mud");
  assert.equal(sem.code, 1);
  assert.match(sem.out, /teste \/ Cenário novo/);
  assert.doesNotMatch(sem.out, /Cenário removido/);

  const com = run(repo({
    "openspec/changes/mud/specs/teste/spec.md": DELTA,
    "test/a.test.js": "test('teste / Cenário novo', () => {})",
  }), "--change", "mud");
  assert.equal(com.code, 0);
});

test("change inexistente: sai com 2", () => {
  const { code, out } = run(repo({ "package.json": "{}" }), "--change", "nao-existe");
  assert.equal(code, 2);
  assert.match(out, /Change sem specs/);
});
