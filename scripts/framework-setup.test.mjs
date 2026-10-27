import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  readFoundationConfig,
  setupFoundation,
  versionSatisfiesRange,
} from "./framework-setup.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("a caret range accepts the matching 0.1 release", () => {
  assert.equal(versionSatisfiesRange("0.1.0", "^0.1.0"), true);
  assert.equal(versionSatisfiesRange("0.1.4", "^0.1.0"), true);
  assert.equal(versionSatisfiesRange("0.2.0", "^0.1.0"), false);
  assert.equal(versionSatisfiesRange("1.0.0", "^0.1.0"), false);
});

test("setup names unpublished enabled packages and skips install", async () => {
  const pagePath = path.join(root, "src", "app", "page.tsx");
  const rulePath = path.join(root, ".cursor", "rules", "framework", "naming.mdc");
  const before = {
    page: await readFile(pagePath, "utf8"),
    rule: await readFile(rulePath, "utf8"),
  };
  const calls = [];
  const outcome = await setupFoundation({
    root,
    lookupPackage: async () => ({ ok: false, status: 404 }),
    installPackages: () => {
      calls.push("install");
    },
  });

  assert.equal(outcome.ok, false);
  assert.equal(outcome.wrote, false);
  assert.match(outcome.report, /@app-framework\/app-config/);
  assert.match(outcome.report, /@app-framework\/dev-tools/);
  assert.match(outcome.report, /No files were changed/);
  assert.equal(calls.length, 0);
  assert.equal(await readFile(pagePath, "utf8"), before.page);
  assert.equal(await readFile(rulePath, "utf8"), before.rule);
});

test("enabling the unpublished interface package still leaves application files unchanged", async () => {
  const config = readFoundationConfig(root);
  config.capabilities.ui.enabled = true;
  const directory = await mkdtemp(path.join(tmpdir(), "framework-setup-"));
  const pagePath = path.join(directory, "src", "app", "page.tsx");
  const productRulePath = path.join(directory, ".cursor", "rules", "product.mdc");
  const frameworkRulePath = path.join(directory, ".cursor", "rules", "framework", "naming.mdc");
  const page = 'export const marker = "application page";\n';
  const productRule = "# Product rule\n\nLeave this file alone.\n";
  const frameworkRule = "# Naming\n\nLeave this copy alone.\n";
  await mkdir(path.dirname(pagePath), { recursive: true });
  await mkdir(path.dirname(frameworkRulePath), { recursive: true });
  await writeFile(
    path.join(directory, "foundation.config.json"),
    `${JSON.stringify(config, null, 2)}\n`,
  );
  await writeFile(pagePath, page);
  await writeFile(productRulePath, productRule);
  await writeFile(frameworkRulePath, frameworkRule);

  const calls = [];
  const outcome = await setupFoundation({
    root: directory,
    lookupPackage: async () => ({ ok: false, status: 404 }),
    installPackages: () => {
      calls.push("install");
    },
  });

  assert.equal(outcome.ok, false);
  assert.match(outcome.report, /@app-framework\/ui/);
  assert.match(outcome.report, /@app-framework\/app-config/);
  assert.equal(calls.length, 0);
  assert.equal(await readFile(pagePath, "utf8"), page);
  assert.equal(await readFile(productRulePath, "utf8"), productRule);
  assert.equal(await readFile(frameworkRulePath, "utf8"), frameworkRule);
});

test("a resolved registry result installs only the enabled contract packages", async () => {
  const manifestPath = path.join(root, "package.json");
  const before = await readFile(manifestPath, "utf8");
  const calls = [];
  const outcome = await setupFoundation({
    root,
    lookupPackage: async () => ({ ok: true, version: "0.1.0" }),
    installPackages(_root, packages) {
      calls.push(packages.map((entry) => entry.name));
    },
  });
  assert.equal(await readFile(manifestPath, "utf8"), before);

  assert.equal(outcome.ok, true);
  assert.deepEqual(calls, [["@app-framework/app-config", "@app-framework/dev-tools"]]);
  assert.doesNotMatch(outcome.report, /@app-framework\/ui@/);
});

test("a newer major stays unresolved and does not install", async () => {
  const calls = [];
  const outcome = await setupFoundation({
    root,
    lookupPackage: async () => ({ ok: true, version: "1.0.0" }),
    installPackages: () => {
      calls.push("install");
    },
  });

  assert.equal(outcome.ok, false);
  assert.match(outcome.report, /outside \^0\.1\.0/);
  assert.equal(calls.length, 0);
});
