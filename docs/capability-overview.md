# Capability overview

This file records the slice of the platform that this starter selects in `foundation.config.json`. It is not a second catalogue.

The authoritative list is App-Framework's [reusable patterns catalogue](https://github.com/Clain-Apps/App-Framework/blob/main/REUSABLE_PATTERNS_CATALOGUE.md). Category and status live there. A documented pattern is not an implemented capability. Proposed and deferred rows are unavailable from this starter. They are not copied here.

## Selected for this starter

- **Application configuration.** `@app-framework/app-config` at `^0.1.0`, mandatory and enabled. The only field is public `APP_NAME` in `src/config.ts`. The package is unpublished, so `pnpm framework:setup` reports it and installs nothing.
- **Framework update checker.** `@app-framework/dev-tools` at `^0.1.0`, mandatory and enabled. `framework-check` reports newer published versions. The package is unpublished.
- **Development conventions.** Standard version `1.0.0`, enabled. The copy is `.cursor/rules/framework/`, pinned by `.cursor/framework-standards.json`.
- **Static deployment.** Workflow reference `Clain-Apps/App-Framework/.github/workflows/deploy-static.yml` at `main`, enabled. The caller is `.github/workflows/deploy.yml`. This template repository is skipped.
- **Application structure.** One Next.js App Router project under `src/app`, profile `next-web`, static export to `out/`.
- **Code quality.** TypeScript, ESLint, and Prettier. Pre-commit runs lint-staged on staged files. `pnpm check` and GitHub Actions run the full set.
- **Unit tests.** Vitest covers the default application name. `node --test scripts/framework-setup.test.mjs` covers setup refusal.
- **Landing page.** A single generic page. No product workflow.
- **Responsive behaviour and accessibility.** Global CSS: readable measure, spacing, focus, contrast, and reduced motion. The page uses landmarks, a skip link, and a native disclosure.

## Optional and unavailable

`@app-framework/ui` is implemented in App-Framework and has no registry release. `foundation.config.json` lists it as optional, disabled, and `unpublished`. Setup will not install it. This starter does not vendor it or add a local component library.

Data stores, identity, payments, realtime APIs, observability products, and legal or commercial policy choices are unused. The catalogue marks which of those are optional or still proposals. Enable one in `foundation.config.json` only after App-Framework gives it a package release or a callable workflow.

## How to select something else

Read the catalogue. If the pattern is a released package and the product needs it, set it enabled in `foundation.config.json`, run `pnpm framework:setup`, and commit the lockfile. If the pattern is proposed or deferred, leave it out of the application.
