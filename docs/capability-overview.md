# Capability overview

This file records the slice of the platform that this starter actually uses. It is not a second catalogue.

The authoritative list is App-Framework's [reusable patterns catalogue](https://github.com/daniel-clain/App-Framework/blob/main/REUSABLE_PATTERNS_CATALOGUE.md). Category and status live there. A documented pattern is not an implemented capability.

## Selected for this starter

- **Application structure.** One Next.js App Router project under `src/app`, with configuration in `src/config.ts`.
- **Type and API contracts.** The starter calls `@app-framework/app-config`. It does not define a new configuration package.
- **Dependency updates.** `framework-check` from `@app-framework/dev-tools` reports newer published versions. It does not apply them.
- **Project bootstrap.** This repository is the bootable application. GitHub's template setting creates an independent repository.
- **Cursor integration.** Shared rules are the pinned copy in `.cursor/rules/framework/`, version `1.0.0`. `AGENTS.md` and `.cursor/rules/architecture.mdc` keep starter-only boundaries. A generated application adds product rules in its own `.cursor/rules`.
- **Code quality.** TypeScript, ESLint, and Prettier. Pre-commit runs lint-staged on staged files. `pnpm check` and GitHub Actions run the full set.
- **Unit tests.** One Vitest test covers the default application name.
- **Landing page.** A single generic page. No product workflow.
- **Responsive behaviour and accessibility.** Global CSS: readable measure, spacing, focus, contrast, and reduced motion. The page uses landmarks, a skip link, and a native disclosure.
- **Build artifacts.** `output: "export"` writes `out/`.
- **Deployment pipelines.** `.github/workflows/deploy.yml` still deploys a generated application and skips this template repository. App Framework's reusable workflow is the intended caller once the tag `deploy-static-v1` exists. This starter does not reference that tag yet.

## How to select something else

Read the catalogue. If the pattern is a released package and the product needs it, install that package and commit the lockfile. If the pattern is proposed or deferred, leave it out. Do not generate a module, a workflow, or a rule for it. A future setup wizard may ask these questions and write a short record of the answers. That wizard is not implemented, and it must not mark a deferred capability as installed.

## Not installed here

`@app-framework/ui` exists in App-Framework and had no registry release on 25 October 2026. This starter does not vendor it or add a local component library.

Data stores, identity, payments, realtime APIs, observability products, and legal or commercial policy choices are unused. The catalogue already marks which of those are optional or policy decisions. This starter does not create empty packages for them.
