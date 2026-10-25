# Capability overview

This file records the slice of the platform that this starter actually uses. It is not a second catalogue.

The authoritative list is App-Framework's [capability catalogue](https://github.com/daniel-clain/App-Framework/blob/main/docs/capability-catalogue.md). Classifications and status live there.

## Selected for this starter

- **Application structure.** One Next.js App Router project under `src/app`, with configuration in `src/config.ts`.
- **Type and API contracts.** The starter calls `@app-framework/app-config`. It does not define a new configuration package.
- **Dependency updates.** `framework-check` from `@app-framework/dev-tools` reports newer published versions. It does not apply them.
- **Project bootstrap.** This repository is the bootable application. GitHub's template setting creates an independent repository.
- **Cursor integration.** `AGENTS.md` and `.cursor/rules/architecture.mdc` keep the ownership boundaries in later sessions.
- **Code quality.** TypeScript, ESLint, and Prettier. Pre-commit runs lint-staged on staged files. `pnpm check` and GitHub Actions run the full set.
- **Unit tests.** One Vitest test covers the default application name.
- **Landing page.** A single generic page. No product workflow.
- **Responsive behaviour and accessibility.** Global CSS: readable measure, spacing, focus, contrast, and reduced motion. The page uses landmarks, a skip link, and a native disclosure.
- **Build artifacts.** `output: "export"` writes `out/`.
- **Deployment pipelines.** A generated application uploads that directory to `/root/apps/<repository-name>` with a release symlink and a file check. The template repository does not deploy.

## Proposed, not built here

Shared UI primitives are not published by App-Framework. Several applications would need them before a package is justified. That package would be owned and named in App-Framework. This starter does not add a local component library, design-token package, or placeholder widgets.

## Not selected

Data stores, identity, payments, realtime APIs, observability products, and legal or commercial policy choices are unused. The catalogue already marks which of those are optional or policy decisions. This starter does not create empty packages for them.
