// Autoteste de check-template.mjs: roda a checagem em repositórios temporários.
// Uso: node scripts/check-template.selftest.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("./check-template.mjs", import.meta.url));

const BASE = {
  managed: ["scripts/", ".claude/hooks/"],
  owned: ["AGENTS.md", "template.json", "GLOSSARY.md", "docs/adr/"],
  template_only: ["README.md"],
};
const BASE_FILES = {
  "scripts/a.mjs": "console.log(1)\n",
  ".claude/hooks/h.mjs": "// hook\n",
  "AGENTS.md": "# AGENTS\n",
  "README.md": "# README\n",
};

function check({ manifest = BASE, files = BASE_FILES, raw } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "check-template-"));
  try {
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, path)), { recursive: true });
      writeFileSync(join(dir, path), content);
    }
    writeFileSync(join(dir, "template.json"), raw ?? JSON.stringify(manifest));
    const r = spawnSync(process.execPath, [SCRIPT], { cwd: dir, encoding: "utf8" });
    return { code: r.status, out: r.stdout + r.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("manifesto coerente: sai com 0, mesmo sem GLOSSARY.md e docs/adr/", () => {
  const r = check();
  assert.equal(r.code, 0, r.out);
});

test("JSON inválido: sai com 1", () => {
  const r = check({ raw: "{ managed: [" });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /template\.json inválido/);
});

test("caminho inexistente: sai com 1 e cita o caminho", () => {
  const r = check({ manifest: { ...BASE, managed: [...BASE.managed, "docs/prompts/"] } });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /managed: docs\/prompts não existe/);
});

test("caminho em duas listas, ou dentro de outra lista: sai com 1", () => {
  const r = check({ manifest: { ...BASE, owned: [...BASE.owned, "scripts/", ".claude/hooks/h.mjs"] } });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /scripts aparece em managed e em owned/);
  assert.match(r.out, /\.claude\/hooks\/h\.mjs \(owned\) fica dentro de \.claude\/hooks \(managed\)/);
});

test("caminho pessoal ou token em arquivo managed: sai com 1 e cita arquivo e linha", () => {
  const home = "/Us" + "ers/fulano/projeto";
  const linux = "/ho" + "me/fulano";
  const gh = "gh" + "p_" + "a".repeat(36);
  const npm = "np" + "m_" + "B".repeat(36);
  const sk = "s" + "k-proj-" + "c".repeat(40);
  const files = { ...BASE_FILES, "scripts/a.mjs": `ok\nconst p = "${home}";\n${linux}\n${gh}\n${npm}\n${sk}\n` };
  const r = check({ files });
  assert.equal(r.code, 1, r.out);
  assert.match(r.out, /scripts\/a\.mjs:2: caminho pessoal/);
  assert.match(r.out, /scripts\/a\.mjs:3: caminho pessoal/);
  assert.match(r.out, /scripts\/a\.mjs:4: token/);
  assert.match(r.out, /scripts\/a\.mjs:5: token/);
  assert.match(r.out, /scripts\/a\.mjs:6: token/);
});

test("exemplos curtos (sk-abc123) e arquivos fora de managed não contam", () => {
  const files = { ...BASE_FILES, "scripts/a.mjs": 'const apiKey = "sk-abc123"; // exemplo\n', "AGENTS.md": "/Us" + "ers/fulano\n" };
  const r = check({ files });
  assert.equal(r.code, 0, r.out);
});
