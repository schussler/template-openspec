// Autoteste de guard-archive.mjs: roda o hook num projeto temporário com
// openspec/changes/g/, sem e com review.md APPROVED e verification.md.
// Uso: node .claude/hooks/guard-archive.selftest.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const HOOK = fileURLToPath(new URL("./guard-archive.mjs", import.meta.url));

function project(review) {
  const dir = mkdtempSync(join(tmpdir(), "guard-archive-"));
  const change = join(dir, "openspec", "changes", "g");
  mkdirSync(change, { recursive: true });
  if (review) {
    writeFileSync(join(change, "review.md"), `# Revisão: g\n\nVERDICT: ${review}\n`);
    writeFileSync(join(change, "verification.md"), "# Verificação: g\n");
  }
  return dir;
}

function hook(dir, tool_name, tool_input) {
  const r = spawnSync(process.execPath, [HOOK], {
    input: JSON.stringify({ tool_name, tool_input, cwd: dir }),
    env: { ...process.env, CLAUDE_PROJECT_DIR: dir },
    encoding: "utf8",
  });
  return r.status;
}

const bash = (command) => ["Bash", { command }];
const write = (file_path) => ["Write", { file_path, content: "x" }];

// [descrição, entrada, saída sem review.md, saída com review.md APPROVED e verification.md]
const CASES = [
  ["openspec archive", bash("openspec archive g -y"), 2, 0],
  ["npx openspec archive", bash("npx openspec archive g"), 2, 0],
  ["openspec por caminho absoluto", bash("/usr/local/bin/openspec archive g"), 2, 0],
  ["mv para archive", bash("mv openspec/changes/g openspec/changes/archive/x"), 2, 0],
  ["mv com aspas", bash('mv "openspec/changes/g" "openspec/changes/archive/x"'), 2, 0],
  ["git mv", bash("git mv openspec/changes/g openspec/changes/archive/x"), 2, 0],
  ["sudo -E env FOO=1 mv", bash("sudo -E env FOO=1 mv openspec/changes/g openspec/changes/archive/x"), 2, 0],
  ["mkdir && mv", bash("mkdir -p openspec/changes/archive && mv openspec/changes/g openspec/changes/archive/x"), 2, 0],
  ["Write nas specs", write("openspec/specs/x/spec.md"), 2, 0],
  ["echo com o comando entre aspas", bash('echo "openspec archive g"'), 0, 0],
  ["mensagem de commit com o comando", bash('git commit -m "openspec archive g"'), 0, 0],
  ["ls", bash("ls"), 0, 0],
  ["mv fora do archive", bash("mv a b"), 0, 0],
  ["npm test", bash("npm test"), 0, 0],
  ["Write fora das specs", write("src/a.ts"), 0, 0],
];

for (const [review, column] of [[null, 2], ["APPROVED", 3]]) {
  const label = review ? "com review.md APPROVED e verification.md" : "sem review.md";
  for (const c of CASES) {
    test(`${label}: ${c[0]} → exit ${c[column]}`, () => {
      const dir = project(review);
      try {
        assert.equal(hook(dir, ...c[1]), c[column]);
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    });
  }
}

test("review.md com VERDICT: BLOCKED: openspec archive → exit 2", () => {
  const dir = project("BLOCKED");
  try {
    assert.equal(hook(dir, ...bash("openspec archive g -y")), 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
