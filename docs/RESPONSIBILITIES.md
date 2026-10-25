# Responsibilities

App Template is the starting point for a new Next.js application. A repository created with GitHub's **Use this template** is a separate application. Later commits here do not change it.

## What this repository owns

- The Next.js application, routes, landing page, and page layout.
- Default stack pins, `pnpm check`, and this repository's continuous integration.
- This application's configuration values and the call into `@app-framework/app-config`.
- The current static deploy workflow, until App Framework's tag `deploy-static-v1` exists. The caller to switch to is in App Framework's consumer contract. This file does not point at that tag before the tag exists.
- Starter-only guidance in `AGENTS.md` and `.cursor/rules/architecture.mdc`.
- A pinned copy of App Framework's shared Cursor standards.

## What this repository does not own

- The implementation of `@app-framework/app-config`, `@app-framework/dev-tools`, or `@app-framework/ui`.
- The canonical Cursor standards. Those live in App Framework at `standards/cursor`. This repository commits the synced copy and does not edit those rules in place.
- The reusable deploy implementation. That lives in App Framework at `.github/workflows/deploy-static.yml`.
- A second catalogue. The catalogue is App Framework's [reusable patterns catalogue](https://github.com/daniel-clain/App-Framework/blob/main/REUSABLE_PATTERNS_CATALOGUE.md).
- Product behaviour for one generated application. That belongs in the generated repository, including any extra `.cursor/rules` files.

## How a new application starts

1. On GitHub, enable **Template repository** by hand, then use **Use this template**.
2. Read the catalogue. Install a framework package only when a registry release exists and the product needs it. Do not generate a module for a pattern that is not released.
3. A future setup wizard may record those choices. It is not implemented, and it must not pretend a deferred capability is installed.

## How an existing application adopts a change

There is no second update system. `framework-check` reports package versions and does not edit files.

- Framework packages: after a real publish, bump the range and lockfile in the application.
- Cursor standards: from a checkout of App Framework, run `node scripts/sync-cursor-standards.mjs --target <application>` and commit `.cursor/rules/framework/` plus `.cursor/framework-standards.json`.
- Static deploy: after `deploy-static-v1` exists, point the caller at that tag. A breaking change uses `deploy-static-v2` and a migration note.
- Structural starter changes: follow a written migration. Creating an application from this template does not subscribe it to later template commits.

## Manual steps that remain

- Confirm the npm scope `@app-framework` in npm's UI before any publish. `scopeConfirmed` stays false. A registry 404 on 26 October 2026 does not prove the scope is free or owned.
- Do not add `@app-framework/ui` until `npm view @app-framework/ui` resolves. This starter also cannot install `@app-framework/app-config` or `@app-framework/dev-tools` until those names resolve, so there is no lockfile yet.
- Push App Framework's deploy workflow to its default branch and create the tag `deploy-static-v1`.
- For a private App Framework repository, allow repositories owned by `daniel-clain` to call its Actions workflows.
- Set `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, and `VPS_KNOWN_HOSTS` on the application.
- Prepare the server as described in the README. The workflow does not create users, install a web server, or obtain a certificate.
