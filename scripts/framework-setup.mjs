import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const CONTRACT_PACKAGES = {
  "@app-framework/app-config": "production",
  "@app-framework/dev-tools": "development",
  "@app-framework/ui": "production",
};

const REQUIRED_CAPABILITIES = {
  "application-configuration": "@app-framework/app-config",
  "framework-update-checker": "@app-framework/dev-tools",
  "development-conventions": null,
  ui: "@app-framework/ui",
  "static-deployment": null,
};

const CATALOGUE_LOCATION =
  "https://github.com/Clain-Apps/App-Framework/blob/main/REUSABLE_PATTERNS_CATALOGUE.md";

const NEXT_DEPLOY = {
  nodeVersionFile: ".nvmrc",
  installCommand: "pnpm install --frozen-lockfile",
  buildCommand: "pnpm check",
  outputDirectory: "out",
  entryFile: "index.html",
};

const DEPLOY_SECRETS = ["VPS_HOST", "VPS_USER", "VPS_SSH_KEY", "VPS_KNOWN_HOSTS"];

const RANGE = /^\^(\d+)\.(\d+)\.(\d+)$/;
const VERSION = /^(\d+)\.(\d+)\.(\d+)/;
const AVAILABILITY = new Set(["unpublished", "present", "referenced", "unavailable"]);
const ROLES = new Set(["mandatory", "default", "optional"]);

export function versionSatisfiesRange(version, range) {
  const rangeMatch = RANGE.exec(range);
  const versionMatch = VERSION.exec(version);
  if (!rangeMatch || !versionMatch) return false;
  const required = rangeMatch.slice(1).map(Number);
  const actual = versionMatch.slice(1).map(Number);
  if (actual[0] !== required[0]) return false;
  if (required[0] === 0 && required[1] === 0) {
    return actual[1] === 0 && actual[2] === required[2];
  }
  if (required[0] === 0) {
    if (actual[1] !== required[1]) return false;
    return actual[2] >= required[2];
  }
  if (actual[1] > required[1]) return true;
  if (actual[1] < required[1]) return false;
  return actual[2] >= required[2];
}

export function readFoundationConfig(root) {
  const filePath = path.join(root, "foundation.config.json");
  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : "";
    if (code === "ENOENT") throw new Error("foundation.config.json is missing.");
    throw new Error("foundation.config.json could not be read.");
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("foundation.config.json is not valid JSON.");
  }
}

export function validateFoundationConfig(config) {
  const errors = [];
  if (config === null || typeof config !== "object" || Array.isArray(config)) {
    return ["foundation.config.json must be an object."];
  }
  if (typeof config.identity?.name !== "string" || config.identity.name.trim() === "") {
    errors.push("identity.name is required.");
  }
  if (config.profile !== "next-web") errors.push('profile must be "next-web".');
  if (config.framework?.repository !== "Clain-Apps/App-Framework") {
    errors.push('framework.repository must be "Clain-Apps/App-Framework".');
  }
  if (config.framework?.contract !== "docs/consumer-contract.md") {
    errors.push('framework.contract must be "docs/consumer-contract.md".');
  }
  if (config.framework?.scope !== "@app-framework") {
    errors.push('framework.scope must be "@app-framework".');
  }
  if (config.catalogue?.location !== CATALOGUE_LOCATION) {
    errors.push("catalogue.location must point at the App-Framework catalogue.");
  }
  if (config.catalogue?.availability !== "unavailable") {
    errors.push('catalogue.availability must be "unavailable".');
  }

  const capabilities = config.capabilities;
  if (capabilities === null || typeof capabilities !== "object" || Array.isArray(capabilities)) {
    errors.push("capabilities is required.");
    return errors;
  }

  for (const [id, expectedPackage] of Object.entries(REQUIRED_CAPABILITIES)) {
    if (!capabilities[id]) errors.push(`${id} is required.`);
    if (expectedPackage && capabilities[id]?.source?.package !== expectedPackage) {
      errors.push(`${id} must use ${expectedPackage}.`);
    }
  }

  for (const [id, capability] of Object.entries(capabilities)) {
    errors.push(...validateCapability(id, capability));
  }
  return errors;
}

function validateCapability(id, capability) {
  const errors = [];
  if (!ROLES.has(capability?.role)) {
    errors.push(`${id} needs a role of mandatory, default, or optional.`);
  }
  if (typeof capability?.enabled !== "boolean") errors.push(`${id}.enabled must be a boolean.`);
  if (!AVAILABILITY.has(capability?.availability)) {
    errors.push(`${id}.availability is not a known value.`);
  }
  if (capability?.role === "mandatory" && capability.enabled !== true) {
    errors.push(`${id} is mandatory and stays enabled.`);
  }
  if (capability?.enabled === true && capability?.availability === "unavailable") {
    errors.push(`${id} is unavailable and cannot be enabled.`);
  }

  const source = capability?.source;
  if (capability?.availability === "unavailable" && capability?.enabled === false && !source) {
    return errors;
  }
  if (source?.package) {
    errors.push(...validatePackageSource(id, capability, source));
    return errors;
  }
  if (source?.kind === "standard") {
    if (!/^\d+\.\d+\.\d+$/.test(source.version ?? "")) {
      errors.push(`${id} needs a numeric standards version.`);
    }
    if (source.pin !== ".cursor/framework-standards.json") {
      errors.push(`${id} pin must be .cursor/framework-standards.json.`);
    }
    return errors;
  }
  if (source?.kind === "workflow") {
    errors.push(...validateWorkflowSource(id, capability, source));
    return errors;
  }
  errors.push(`${id} needs a package, standard, or workflow source.`);
  return errors;
}

function validatePackageSource(id, capability, source) {
  const errors = [];
  const dependency = CONTRACT_PACKAGES[source.package];
  if (!dependency) {
    errors.push(`${id} names ${source.package}, which is outside the consumer contract.`);
    return errors;
  }
  if (!RANGE.test(source.version ?? "")) {
    errors.push(`${id} needs a caret version range such as ^0.1.0.`);
  }
  if (source.dependency !== undefined && source.dependency !== dependency) {
    errors.push(`${id} dependency must be ${dependency}.`);
  }
  if (id === "application-configuration" && capability.config?.module !== "src/config.ts") {
    errors.push("application-configuration config.module must be src/config.ts.");
  }
  if (capability.availability !== "unpublished" && capability.availability !== "present") {
    errors.push(`${id} package availability must be unpublished or present.`);
  }
  return errors;
}

function validateWorkflowSource(id, capability, source) {
  const errors = [];
  if (source.repository !== "Clain-Apps/App-Framework") {
    errors.push(`${id} must call Clain-Apps/App-Framework.`);
  }
  if (source.workflow !== ".github/workflows/deploy-static.yml") {
    errors.push(`${id} must call .github/workflows/deploy-static.yml.`);
  }
  if (source.ref !== "main" && source.ref !== "deploy-static-v1") {
    errors.push(`${id} ref must be main or deploy-static-v1.`);
  }
  if (capability.availability !== "referenced") {
    errors.push(`${id} availability must be referenced.`);
  }
  if (id !== "static-deployment") return errors;
  for (const [key, value] of Object.entries(NEXT_DEPLOY)) {
    if (capability.config?.[key] !== value) {
      errors.push(`static-deployment config.${key} must be ${value}.`);
    }
  }
  const secrets = capability.config?.secrets;
  if (!Array.isArray(secrets) || secrets.join(",") !== DEPLOY_SECRETS.join(",")) {
    errors.push(
      "static-deployment secrets must be VPS_HOST, VPS_USER, VPS_SSH_KEY, and VPS_KNOWN_HOSTS.",
    );
  }
  return errors;
}

export function collectEnabledPackages(config) {
  const selected = [];
  for (const [id, capability] of Object.entries(config.capabilities)) {
    if (!capability.enabled || !capability.source?.package) continue;
    selected.push({
      id,
      name: capability.source.package,
      range: capability.source.version,
      dependency: CONTRACT_PACKAGES[capability.source.package],
    });
  }
  return selected;
}

export async function lookupNpmPackage(name) {
  if (!Object.hasOwn(CONTRACT_PACKAGES, name)) return { ok: false, status: 404 };
  const url = `https://registry.npmjs.org/${encodeURIComponent(name)}`;
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (response.status === 404) return { ok: false, status: 404 };
  if (!response.ok) return { ok: false, status: response.status };
  const body = await response.json();
  const version = body?.["dist-tags"]?.latest;
  if (typeof version !== "string") return { ok: false, status: response.status };
  return { ok: true, version };
}

export function runPnpmAdd(root, packages) {
  const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
  const production = packages.filter((entry) => entry.dependency === "production");
  const development = packages.filter((entry) => entry.dependency === "development");
  addGroup(pnpm, root, production, []);
  addGroup(pnpm, root, development, ["-D"]);
}

function addGroup(pnpm, root, packages, flags) {
  if (packages.length === 0) return;
  const args = ["add", ...flags, ...packages.map((entry) => `${entry.name}@${entry.range}`)];
  const result = spawnSync(pnpm, args, { cwd: root, stdio: "inherit" });
  if (result.error) throw new Error(`Could not run ${pnpm}. ${result.error.message}`);
  if (result.status !== 0) {
    throw new Error(`${pnpm} add exited ${result.status}. Check package.json before retrying.`);
  }
}

export async function setupFoundation({ root, lookupPackage, installPackages }) {
  let config;
  try {
    config = readFoundationConfig(root);
  } catch (error) {
    const message = error instanceof Error ? error.message : "foundation.config.json could not be read.";
    return failure(message);
  }

  const errors = validateFoundationConfig(config);
  if (errors.length > 0) {
    return {
      ok: false,
      wrote: false,
      report: formatReport({ config, errors, warnings: [], unresolved: [] }),
    };
  }

  const unresolved = [];
  const resolved = [];
  for (const entry of collectEnabledPackages(config)) {
    let lookup;
    try {
      lookup = await lookupPackage(entry.name);
    } catch {
      unresolved.push({
        name: entry.name,
        range: entry.range,
        detail: "The npm registry could not be reached.",
      });
      continue;
    }
    if (!lookup?.ok) {
      unresolved.push({
        name: entry.name,
        range: entry.range,
        detail: registryDetail(lookup?.status),
      });
      continue;
    }
    if (!versionSatisfiesRange(lookup.version, entry.range)) {
      unresolved.push({
        name: entry.name,
        range: entry.range,
        detail: `Latest ${lookup.version} is outside ${entry.range}.`,
      });
      continue;
    }
    resolved.push(entry);
  }

  const warnings = buildWarnings(root, config);
  if (unresolved.length > 0) {
    return {
      ok: false,
      wrote: false,
      report: formatReport({ config, errors: [], warnings, unresolved }),
    };
  }

  if (resolved.length > 0) {
    try {
      installPackages(root, resolved);
    } catch (error) {
      const message = error instanceof Error ? error.message : "pnpm add failed.";
      return {
        ok: false,
        wrote: false,
        report: formatReport({ config, errors: [message], warnings, unresolved: [] }),
      };
    }
  }

  return {
    ok: true,
    wrote: resolved.length > 0,
    report: formatReport({ config, errors: [], warnings, unresolved: [], installed: resolved }),
  };
}

function failure(message) {
  return {
    ok: false,
    wrote: false,
    report: formatReport({ errors: [message], warnings: [], unresolved: [] }),
  };
}

function registryDetail(status) {
  if (status === 404) return "The npm registry has no release for this package.";
  return `The npm registry returned ${status ?? "an unexpected response"}.`;
}

function buildWarnings(root, config) {
  const warnings = [];
  for (const [id, capability] of Object.entries(config.capabilities)) {
    if (capability.enabled) continue;
    if (capability.availability === "unpublished" && capability.source?.package) {
      warnings.push(
        `${capability.source.package} (${id}) is disabled and unpublished. Setup leaves it uninstalled.`,
      );
    }
    if (capability.availability === "unavailable") {
      warnings.push(`${id} is unavailable and stays disabled.`);
    }
  }
  if (!existsSync(path.join(root, "pnpm-lock.yaml"))) {
    warnings.push("pnpm-lock.yaml is absent, so a frozen install cannot run.");
  }
  warnings.push(...standardsWarnings(root, config));
  warnings.push(...deploymentWarnings(config));
  return warnings;
}

function standardsWarnings(root, config) {
  const standards = config.capabilities["development-conventions"];
  if (!standards?.enabled) return [];
  const warnings = [];
  const pinPath = path.join(root, ".cursor", "framework-standards.json");
  if (!existsSync(pinPath)) {
    warnings.push(
      "Development conventions are enabled and .cursor/framework-standards.json is missing. Setup does not write that pin.",
    );
  } else {
    try {
      const pin = JSON.parse(readFileSync(pinPath, "utf8"));
      const pinVersion = typeof pin.version === "string" ? pin.version : "unknown";
      warnings.push(
        `Development conventions ${pinVersion} are pinned in .cursor/framework-standards.json.`,
      );
      if (pinVersion !== standards.source.version) {
        warnings.push(
          `The pin version ${pinVersion} differs from foundation.config.json version ${standards.source.version}.`,
        );
      }
    } catch {
      warnings.push(".cursor/framework-standards.json could not be parsed. Setup leaves it unchanged.");
    }
  }
  warnings.push(
    "Refresh standards from an App-Framework checkout: node scripts/sync-cursor-standards.mjs --target <application>",
  );
  return warnings;
}

function deploymentWarnings(config) {
  const deploy = config.capabilities["static-deployment"];
  if (!deploy?.enabled || deploy.source?.kind !== "workflow") return [];
  const warnings = [
    `Static deployment calls ${deploy.source.repository}/${deploy.source.workflow}@${deploy.source.ref}.`,
  ];
  if (deploy.source.ref === "main") {
    warnings.push(
      "This ref follows App-Framework's default branch. The stable pin deploy-static-v1 is not selected.",
    );
  }
  return warnings;
}

function formatReport({ config, errors, warnings, unresolved, installed = [] }) {
  const lines = ["framework:setup", ""];
  if (typeof config?.identity?.name === "string") {
    lines.push(`Application: ${config.identity.name}`, `Profile: ${config.profile}`, "");
  }
  if (errors.length > 0) {
    lines.push("The foundation configuration is invalid.");
    for (const error of errors) lines.push(`  ${error}`);
    lines.push("");
  }
  if (unresolved.length > 0) {
    lines.push("Unresolved requirements");
    for (const item of unresolved) lines.push(`  ${item.name}  ${item.range}  ${item.detail}`);
    lines.push("");
  }
  if (installed.length > 0) {
    lines.push("Installed packages");
    for (const item of installed) lines.push(`  ${item.name}@${item.range}`);
    lines.push("");
  }
  if (warnings.length > 0) {
    lines.push("Warnings");
    for (const warning of warnings) lines.push(`  ${warning}`);
    lines.push("");
  }
  if (errors.length > 0 || unresolved.length > 0) {
    lines.push(
      "No files were changed.",
      "App-Framework does not publish a setup command. framework-check, from @app-framework/dev-tools, compares versions after that package is published.",
      "Install enabled packages from the npm registry after they are published. The @app-framework scope stays unconfirmed until App-Framework publishes, and a 404 leaves the owner of that scope unknown.",
    );
  } else {
    lines.push("Setup finished.");
  }
  return `${lines.join("\n")}\n`;
}

async function main() {
  const outcome = await setupFoundation({
    root: process.cwd(),
    lookupPackage: lookupNpmPackage,
    installPackages: runPnpmAdd,
  });
  process.stdout.write(outcome.report);
  process.exitCode = outcome.ok ? 0 : 1;
}

function isDirectRun() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(entry).href;
}

if (isDirectRun()) {
  main().catch((error) => {
    const message = error instanceof Error ? error.message : "framework:setup failed.";
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
