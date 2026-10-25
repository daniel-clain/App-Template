# App-Template

Starting point for a new Next.js application. This repository assembles a static site, project checks, and a deployment workflow. Shared capabilities live in [App-Framework](https://github.com/daniel-clain/App-Framework). Read [docs/RESPONSIBILITIES.md](docs/RESPONSIBILITIES.md) before adding anything here.

## Run locally

Node.js 22 or newer. Continuous integration uses Node.js 24 (`.nvmrc`). pnpm is pinned to 12.15.0. `pnpm-workspace.yaml` only lists dependency build scripts pnpm is allowed to run. This repository is not a monorepo and has no `packages/` directory.

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs `framework-check`, then the Next.js development server. The landing page is served from the App Router and does not need a database or any other service.

Optional public name, in `.env` (see `.env.example`):

```bash
APP_NAME=Application
```

When `APP_NAME` is unset or empty, the page uses `Application`.

Other commands:

```bash
pnpm framework:check
pnpm check
```

`pnpm check` typechecks, lints, checks formatting, runs the unit test, and builds the static export into `out/`.

Before each commit, lint-staged formats and lints the staged files. It does not run the test or the production build. Those run in GitHub Actions.

## Framework packages

The starter depends on the published packages named in App-Framework's consumer contract:

- `@app-framework/app-config` — `defineConfig` and `loadPublicConfig` in `src/config.ts`
- `@app-framework/dev-tools` — the `framework-check` command

Both are declared as `^0.1.0`. This repository does not vendor their source and does not use a `file:` or `git` dependency.

`framework-check` prints nothing when the installed framework packages match the latest stable release. When they do not, the report looks like this:

```text
framework-check
  @app-framework/app-config  0.1.0 → 0.2.0  compatible update
  @app-framework/dev-tools  0.1.0 → 1.0.0  major update
```

A registry timeout or network failure prints one warning and exits 0, so `pnpm dev` still starts Next.js. The command never edits `package.json` or the lockfile. Install an upgrade only by changing the version in this application.

`@app-framework/ui` is the shared interface package. It is not installed in this starter while it is unpublished. The landing page is ordinary HTML and `src/app/globals.css`.

The packages stay unpublished while App-Framework's npm scope is unconfirmed. Until `pnpm install` can resolve them, do not invent a local substitute. This repository has no lockfile until that install succeeds. After the first successful install, commit `pnpm-lock.yaml`. Continuous integration uses `pnpm install --frozen-lockfile` and cannot pass before that file exists.

## Create a new application

1. On GitHub, open this repository's Settings → General and enable **Template repository**. That checkbox is manual. Nothing in the files turns it on.
2. Use **Use this template** to create a new repository. The new repository is independent. Later commits here do not change it.
3. Publish, or wait for, the App-Framework packages, then run `pnpm install` in the new repository and commit its lockfile.
4. Add that repository's Actions secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, and `VPS_KNOWN_HOSTS`.
5. Build the product in the new repository. Keep reusable behaviour in App-Framework.

Pushing to `main` in `daniel-clain/App-Template` runs validation only. The deploy job is skipped here so the template itself is not published to the server.

## Deploy

A generated application deploys on every push to `main`. This repository still runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). That file installs from the lockfile, runs `pnpm check`, and uploads the static `out/` directory.

App Framework's reusable workflow is `.github/workflows/deploy-static.yml`. Callers are meant to pin `deploy-static-v1` and pass the Next.js profile (`.nvmrc`, `pnpm install --frozen-lockfile`, `pnpm check`, `out`, `index.html`), `rollback`, and the four secrets. This repository does not use that caller yet. GitHub cannot resolve the tag until the workflow file is on App Framework's default branch and the tag exists. The exact caller is in App Framework's consumer contract.

These steps are still manual:

- Push the workflow and create the tag `deploy-static-v1`.
- If App Framework is private, allow repositories owned by `daniel-clain` to call its Actions workflows.
- Confirm the npm scope before any package publish.
- Set the four deployment secrets below, and complete the one-time server setup.

The remote layout is:

```text
/root/apps/<repository-name>/releases/<id>/
/root/apps/<repository-name>/current    → releases/<id>
/root/apps/<repository-name>/previous   → the prior release
```

The SSH user is `VPS_USER`. The job refuses to continue when that account is root. Host keys come from `VPS_KNOWN_HOSTS`; verification stays on. The upload goes to a new release directory. `current` is switched only after `index.html` is present and the release contains no environment files. `current` is replaced only when it is a symlink, so an existing directory is left alone. The workflow does not install server software, create users, or change ownership.

To roll back, run the Deploy workflow manually and set **rollback** to true. That points `current` at `previous` when the previous release still has `index.html`.

Copying files into `/root/apps/<repository-name>` does not serve them. HTTPS, domain names, and the web server are a separate hosting decision. API routes, server rendering, WebSockets, and any application that must keep a process running need a different deployment profile. This one is a static export and does not need Node.js on the server.

### One-time server setup

Do this by hand on the Ubuntu server before the first deploy. The workflow will not do it.

- Install `rsync` if it is not already there.
- Create a non-root deploy user and install the GitHub Actions public key for that user only. The private key has no passphrase.
- Create `/root/apps` and give that user write access to it.
- Store one verified `known_hosts` line in `VPS_KNOWN_HOSTS`. `ssh-keyscan -H <host>` can produce it. The workflow does not scan the host itself.

## Standards

Shared Cursor rules are copied from App Framework `standards/cursor` at version `1.0.0`. The pin is [`.cursor/framework-standards.json`](.cursor/framework-standards.json). The rules are in `.cursor/rules/framework/`. Starter-only guidance stays in `AGENTS.md` and `.cursor/rules/architecture.mdc`. A generated application can add its own rules beside that copy.

To take a later version, check out App Framework and run:

```bash
node scripts/sync-cursor-standards.mjs --target <this-repository>
```

Commit the updated rules and pin. This template does not update applications created from it. The pin records the framework commit used at sync time. Rerun the sync after that commit contains `standards/cursor` if a later checkout must reproduce the same files from the pin alone.

## Optional capabilities

The catalogue is App Framework's `REUSABLE_PATTERNS_CATALOGUE.md`. This repository does not keep a copy. Read it when a product needs something this starter does not include. Install only a package that has a registry release. A future setup wizard may record those choices. It is not implemented.

`@app-framework/ui` exists in App Framework and is unpublished. It is not installed here. Databases, identity, payments, realtime behaviour, observability, and web serving are not part of this starter.
