---
name: Minimal starter realignment
overview: Realign App-Template around a short definition, a root capability declaration, and a setup command that fails closed until App-Framework publishes its packages. Replace the copied deploy workflow with a caller of the shared workflow on main.
todos:
  - id: docs
    content: Add PROJECT-DEFINITION.md and align README, AGENTS.md, responsibility docs, architecture rule, and a planning rule. Use Clain-Apps.
    status: completed
  - id: config
    content: Add foundation.config.json for the real supported capabilities, with unpublished and catalogue-only entries marked unavailable.
    status: completed
  - id: setup
    content: Add pnpm framework:setup as a Node script that reads the config, refuses unpublished packages, and does not write application files.
    status: completed
  - id: deploy
    content: Replace deploy.yml with a caller of deploy-static.yml@main, skipping Clain-Apps/App-Template.
    status: completed
  - id: verify
    content: Prove setup, non-overwrite, and the caller on a local copy, and record the install and deploy blockers.
    status: completed
isProject: false
---

# Realign App-Template as a minimal starter

The starter already has a small Next.js App Router app, published-package imports, and a pinned standards copy. This change removes the duplicated deploy implementation, records framework choices in one application file, and makes setup refuse to invent packages or a second installer.

App-Framework’s consumer contract remains the source of package names, the standards sync, and the deploy inputs. There is no `foundation.config.json` reader and no setup command in App-Framework. `@app-framework/app-config`, `@app-framework/dev-tools`, and `@app-framework/ui` all return npm 404, `scopeConfirmed` is false, and there is no `pnpm-lock.yaml`.

## Definition and docs

Add [docs/PROJECT-DEFINITION.md](docs/PROJECT-DEFINITION.md) as the definition of the starter: what it is, why it exists, how a new repository is created, what stays application-specific, and how packages, standards, deployment, and application code update separately. State that later template commits do not change repositories already created from it.

Rewrite these so they match that definition and use `Clain-Apps` (the live owner; `daniel-clain` redirects):

- [README.md](README.md) — short start path: template use, `foundation.config.json`, `pnpm framework:setup`, `pnpm dev`, and a link to the definition. Drop the copied server-setup and SSH narrative.
- [AGENTS.md](AGENTS.md) — agent entry: read the config to see enabled capabilities, ignore entries marked unavailable, then read [.cursor/framework-standards.json](.cursor/framework-standards.json) and [.cursor/rules/framework/](.cursor/rules/framework/). Do not edit that copy. Product rules stay beside it. Propose a repeated pattern to App-Framework instead of copying it here.
- [docs/RESPONSIBILITIES.md](docs/RESPONSIBILITIES.md), [docs/framework-integration.md](docs/framework-integration.md), [docs/capability-overview.md](docs/capability-overview.md) — ownership, the real package wiring, and the selected slice only. Link [App-Framework’s catalogue](https://github.com/Clain-Apps/App-Framework/blob/main/REUSABLE_PATTERNS_CATALOGUE.md). Do not copy it.
- [.cursor/rules/architecture.mdc](.cursor/rules/architecture.mdc) — same boundaries, including the new caller. Leave [.cursor/rules/framework/](.cursor/rules/framework/) unchanged.

Add a project rule, [.cursor/rules/planning.mdc](.cursor/rules/planning.mdc), telling Cursor to inspect `foundation.config.json` and the enabled capabilities before designing or implementing product behaviour.

## Root configuration

Add [foundation.config.json](foundation.config.json) as this application’s declaration, not a second catalogue. It records:

- identity `app-template` (a generated app replaces this with its own name)
- profile `next-web` (App Router, static export, Node from `.nvmrc`, pnpm)
- framework reference `Clain-Apps/App-Framework` and consumer contract `docs/consumer-contract.md`
- mandatory and default-enabled: `@app-framework/app-config` `^0.1.0`, `@app-framework/dev-tools` `^0.1.0`, development conventions `1.0.0` (already pinned)
- optional `@app-framework/ui` `^0.1.0` disabled, with availability `unpublished` so it is not installable
- static deployment as a workflow reference, not a package: `Clain-Apps/App-Framework/.github/workflows/deploy-static.yml` at `main`, with the published inputs (`.nvmrc`, `pnpm install --frozen-lockfile`, `pnpm check`, `out`, `index.html`) and the four secret names
- app-config’s only field stays in [src/config.ts](src/config.ts); the config points at that module

Proposed and deferred catalogue rows are not copied in. The file points at the catalogue and says those entries are unavailable.

The existing Next.js app stays as it is: [src/app/](src/app/), [src/config.ts](src/config.ts), and the current check scripts. Do not add UI elements, auth, data stores, or other product features. Do not add a `file:` or `git` dependency.

## Setup command

Add `framework:setup` in [package.json](package.json) as `node scripts/framework-setup.mjs`. The script uses only Node built-ins so a new repository can run it before any framework package is installed.

It reads `foundation.config.json`, checks that enabled packages use the published names and semver ranges, and queries the npm registry. It does not download or execute a remote installer. It does not call `pnpm add` unless every enabled package resolves. Today they do not, so the command exits non-zero before it writes anything and explains the real blockers: unconfirmed scope, npm 404s, no published setup binary (`framework-check` only compares versions and is itself unpublished), and no lockfile.

Standards stay the committed pin. The script reports version `1.0.0` and that a refresh is `node scripts/sync-cursor-standards.mjs --target <app>` from an App-Framework checkout. It does not fetch that script. It never edits `src/`, product rules, or `.cursor/rules/framework/`.

Repeated runs and a capability edit that selects `@app-framework/ui` fail the same way and leave application files untouched. A node:test file proves the refusal and the non-write behaviour without Vitest, because Vitest cannot be installed until the lockfile exists.

## Deployment caller

Replace [.github/workflows/deploy.yml](.github/workflows/deploy.yml) with the caller below. This removes the SSH, rsync, release, and rollback steps from this repository.

```yaml
uses: Clain-Apps/App-Framework/.github/workflows/deploy-static.yml@main
with:
  rollback: ${{ github.event_name == 'workflow_dispatch' && inputs.rollback }}
  node_version_file: .nvmrc
  install_command: pnpm install --frozen-lockfile
  build_command: pnpm check
  output_directory: out
  entry_file: index.html
secrets:
  VPS_HOST: ${{ secrets.VPS_HOST }}
  VPS_USER: ${{ secrets.VPS_USER }}
  VPS_SSH_KEY: ${{ secrets.VPS_SSH_KEY }}
  VPS_KNOWN_HOSTS: ${{ secrets.VPS_KNOWN_HOSTS }}
```

The job runs on pushes to `main` and on manual rollback, with `contents: read`, and only when `github.repository != 'Clain-Apps/App-Template'`. The repository name used on the server still comes from `github.repository` inside the shared workflow.

Document in the definition and framework-integration doc:

- `@main` follows later edits to that workflow file.
- `deploy-static-v1` is the stable pin in the consumer contract. That tag is not on GitHub, so this caller cannot use it yet.
- The shared workflow publishes to `/root/apps/<repository-name>/`. It has no destination input. `/all-apps/` is not what the workflow does. This repository will not copy the script to change the path.
- The shared workflow still skips `daniel-clain/App-Template`. After the rename, that condition does not protect this repository. The caller condition above does.

Do not deploy and do not push.

## Verification

Use a temporary copy of the repository, not a GitHub create and not a server deploy.

1. The copy contains `foundation.config.json` and the caller workflow.
2. `pnpm framework:setup` exits non-zero, names the unpublished packages, and does not change `src/` or `.cursor/rules/`.
3. Enabling `@app-framework/ui` in the copy and rerunning still changes no application source.
4. The caller contains no `rsync`, SSH key setup, or `/root/apps` script, and it skips `Clain-Apps/App-Template`.
5. `pnpm install` / `pnpm check` / `pnpm dev` remain blocked by the missing registry releases and lockfile. Record that instead of claiming the app builds.

## Blockers left outside this repository

- Confirm and publish the npm scope before setup can install anything or CI’s frozen install can pass.
- App-Framework still hardcodes the deploy skip `daniel-clain/App-Template` and the path `/root/apps/`.
- Tag `deploy-static-v1` does not exist, so the stable pin cannot be selected yet.
- GitHub’s “Template repository” setting stays a manual checkbox.
- `gh` is not authenticated here, so this pass will not open a GitHub test repository.