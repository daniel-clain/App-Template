# Responsibilities

App-Template is the starting point for a new Next.js application. A repository created with GitHub's **Use this template** is a separate application. Later commits here leave it unchanged.

The definition of this split is [PROJECT-DEFINITION.md](PROJECT-DEFINITION.md).

## What this repository owns

- The Next.js application, routes, landing page, and page layout.
- `foundation.config.json` and `pnpm framework:setup`.
- This application's configuration values and the call into `@app-framework/app-config` from `src/config.ts`.
- Default stack pins, `pnpm check`, and this repository's continuous integration.
- The deploy caller in `.github/workflows/deploy.yml`. The shared implementation is App-Framework's `.github/workflows/deploy-static.yml`.
- Starter guidance in `AGENTS.md`, `.cursor/rules/architecture.mdc`, and `.cursor/rules/planning.mdc`.
- A pinned copy of App-Framework's shared Cursor standards.

## What this repository does not own

- The implementation of `@app-framework/app-config`, `@app-framework/dev-tools`, or `@app-framework/ui`.
- The canonical Cursor standards. Those live in App-Framework at `standards/cursor`. This repository commits the synced copy and leaves those rules unchanged.
- The reusable deploy implementation, including transfer, activation, and rollback. That lives in App-Framework at `.github/workflows/deploy-static.yml`.
- A second catalogue. The catalogue is App-Framework's [reusable patterns catalogue](https://github.com/Clain-Apps/App-Framework/blob/main/REUSABLE_PATTERNS_CATALOGUE.md).
- Product behaviour for one generated application, including any extra `.cursor/rules` files.

## How a new application starts

1. Enable **Template repository** by hand, then use **Use this template**.
2. Set `identity.name` in `foundation.config.json`.
3. Run `pnpm framework:setup`. Enable another capability only when its `availability` allows a registry release or a callable workflow.
4. Commit `pnpm-lock.yaml` after a normal install resolves the ranges.

## How an existing application adopts a change

- **Packages.** After a real publish, change the range in `foundation.config.json`, run `pnpm framework:setup`, and commit the lockfile. `framework-check` reports versions and does not edit files.
- **Cursor standards.** From a checkout of App-Framework, run `node scripts/sync-cursor-standards.mjs --target <application>` and commit `.cursor/rules/framework/` plus `.cursor/framework-standards.json`.
- **Static deploy.** The caller tracks `@main`. Move the `uses` reference to `@deploy-static-v1` when that tag exists and the application wants a fixed release. A breaking change uses `deploy-static-v2` and a migration note.
- **Starter structure.** Follow a written migration. Creating an application from this template does not subscribe it to later template commits.

## Manual steps that remain

- Confirm the npm scope `@app-framework` before any publish. `scopeConfirmed` stays false in App-Framework. A registry 404 means those package names are not available to install.
- Publish `@app-framework/app-config` and `@app-framework/dev-tools` before `pnpm install` or continuous integration's frozen install can succeed. There is no lockfile until then.
- Add `@app-framework/ui` only after `npm view @app-framework/ui` resolves, and only by enabling it in `foundation.config.json`.
- Create the tag `deploy-static-v1` on App-Framework when a caller should pin a release. The workflow file is already on `main`.
- For a private App-Framework repository, allow repositories owned by `Clain-Apps` to call its Actions workflows.
- Set `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, and `VPS_KNOWN_HOSTS` on the application.
- Prepare the server as described in App-Framework's consumer contract. The caller does not create users, install a web server, or obtain a certificate.
