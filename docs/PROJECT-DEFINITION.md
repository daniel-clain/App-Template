# Project definition

## What App-Template is

App-Template is the starting point for a new Next.js application. It is a GitHub template. A repository created with **Use this template** is a separate application with its own history.

## Why it exists

A new application needs a working page, project checks, and a clear list of the App-Framework capabilities it uses. Shared behaviour stays in [App-Framework](https://github.com/Clain-Apps/App-Framework), so an improvement there can be adopted by many applications from one place. This repository should change only when the starter itself, or the way an application asks for those capabilities, changes.

## How developers start a new application

1. On GitHub, open this repository's Settings → General and enable **Template repository**. That checkbox is manual.
2. Choose **Use this template** and create the new repository.
3. Set `identity.name` in `foundation.config.json` to the application's name.
4. Run `pnpm framework:setup`.
5. When the setup report says the selected packages are on the npm registry, run `pnpm install` and commit `pnpm-lock.yaml`.
6. Run `pnpm dev`.

Later commits in App-Template leave existing applications as they are. Adopting a newer starter layout is a deliberate change in that application.

## Relationship to App-Framework

App-Framework owns reusable packages, shared Cursor standards, the reusable static deploy workflow, and the capability catalogue. The consumer contract is [docs/consumer-contract.md](https://github.com/Clain-Apps/App-Framework/blob/main/docs/consumer-contract.md) in that repository.

This starter declares what it needs, installs published packages by name, and calls the shared deploy workflow. The package implementations, the standards text, and the deploy steps stay in App-Framework.

## Responsibilities

App-Template owns:

- The Next.js application, routes, landing page, and layout.
- `foundation.config.json`, the values in `src/config.ts`, and `pnpm framework:setup`.
- Default stack pins, `pnpm check`, and this repository's continuous integration.
- The deploy caller in `.github/workflows/deploy.yml`.
- Starter guidance in `AGENTS.md`, `.cursor/rules/architecture.mdc`, and `.cursor/rules/planning.mdc`.
- The pinned copy of shared Cursor standards.

App-Framework owns:

- `@app-framework/app-config`, `@app-framework/dev-tools`, and `@app-framework/ui`.
- `standards/cursor`, copied by `scripts/sync-cursor-standards.mjs`.
- `.github/workflows/deploy-static.yml`.
- `REUSABLE_PATTERNS_CATALOGUE.md`.

An application owns its screens, data, and business rules, and the optional capabilities it turns on.

## What remains application-specific

Routes, page copy, styling beyond the starter layout, environment values, product rules under `.cursor/rules/`, and the selections in `foundation.config.json`. A generated application can replace `identity.name` and enable a capability that has a registry release.

## Framework configuration and setup

`foundation.config.json` is this application's declaration of its framework requirements. It names the application, the `next-web` profile, the App-Framework repository, and each capability this starter knows how to consume.

`pnpm framework:setup` reads that file. It asks the npm registry for every enabled package. It runs `pnpm add` only when every enabled package resolves inside the selected version range. It leaves application source, product rules, and `.cursor/rules/framework/` unchanged.

`@app-framework/app-config` and `@app-framework/dev-tools` are enabled. They are unpublished: the npm scope in App-Framework is still unconfirmed, and the registry returns 404 for those names. Setup then exits with that explanation and writes nothing. There is no published setup package to download, and this command does not run a remote installer.

Shared standards at version `1.0.0` are already committed. A later refresh is run from an App-Framework checkout:

```bash
node scripts/sync-cursor-standards.mjs --target <application>
```

Commit the updated `.cursor/rules/framework/` directory and `.cursor/framework-standards.json`. Setup does not fetch that script.

## How capabilities and standards receive updates

- **Packages.** Change the version range in `foundation.config.json`, run `pnpm framework:setup` after the version is on the registry, and commit the lockfile. `framework-check` reports a newer published release and does not edit files.
- **Standards.** Rerun the sync script from App-Framework at the new `standards/cursor` version and commit the copy and the pin.
- **Deployment.** The caller references `Clain-Apps/App-Framework/.github/workflows/deploy-static.yml@main`, so a later edit on that branch is used on the next run. The consumer contract's stable pin is the tag `deploy-static-v1`. That tag is not on GitHub yet. When it exists, an application that wants a fixed release changes `@main` to `@deploy-static-v1`. A breaking caller contract uses a new tag, such as `deploy-static-v2`.
- **Application code.** Edit it in the application repository.

Publishing a package, syncing standards, or moving a workflow tag does not change an application by itself.

## What the template provides by default

- Next.js with the App Router, TypeScript, and a static export to `out/`.
- One landing page with a skip link, landmarks, and minimal global styles.
- Public `APP_NAME` through `@app-framework/app-config`, defaulting to `Application`.
- `framework-check` from `@app-framework/dev-tools` on `pnpm dev` and `pnpm framework:check`.
- ESLint, Prettier, Vitest, lint-staged, and `pnpm check`.
- Shared Cursor rules at version `1.0.0`.
- A deploy caller for generated applications. `Clain-Apps/App-Template` is skipped, so this template does not deploy.

`@app-framework/ui` is listed and disabled. It has no registry release, so setup will not install it.

Proposed and deferred catalogue patterns are unavailable from this file. The catalogue in App-Framework is the list of those patterns. Install one only after it has a registry release or a callable workflow.

## Deployment destination

The shared workflow takes the repository name from the GitHub repository and publishes that application under `/root/apps/<repository-name>/`. The workflow has no destination input. This caller passes the Next.js profile (`.nvmrc`, `pnpm install --frozen-lockfile`, `pnpm check`, `out`, `index.html`) and the secrets `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, and `VPS_KNOWN_HOSTS`.

The shared workflow still contains a skip for `daniel-clain/App-Template`. GitHub now reports this repository as `Clain-Apps/App-Template`. The caller skips that current name.
