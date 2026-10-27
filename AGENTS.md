# App-Template

This repository is an application starter. App-Framework owns reusable packages, shared Cursor standards, the reusable static deploy workflow, and the capability catalogue.

## Enabled capabilities

Read `foundation.config.json` before designing or implementing behaviour.

Use an entry when `enabled` is true and `availability` is `present`, `referenced`, or a package the npm registry can install. Leave an entry unused when `availability` is `unpublished` or `unavailable`. `@app-framework/ui` stays disabled until a registry release exists.

Proposed and deferred patterns stay in App-Framework's [reusable patterns catalogue](https://github.com/Clain-Apps/App-Framework/blob/main/REUSABLE_PATTERNS_CATALOGUE.md). They are unavailable from this repository's configuration.

`pnpm framework:setup` installs enabled packages that resolve on the registry. Read the configuration file as well. The command reports unpublished packages and writes nothing in that case.

## Framework standards

Shared rules are the pinned copy in `.cursor/rules/framework/`. The pin is `.cursor/framework-standards.json`: version, source path, and the App-Framework commit. Read those rules for naming, organisation, separation, TypeScript, testing, and maintainability.

Leave that copy unchanged. Refresh it from an App-Framework checkout:

```bash
node scripts/sync-cursor-standards.mjs --target <application>
```

Commit `.cursor/rules/framework/` and `.cursor/framework-standards.json` after a refresh.

## Application rules

`AGENTS.md`, `.cursor/rules/architecture.mdc`, and `.cursor/rules/planning.mdc` belong to this starter. A generated application adds product rules as further files in `.cursor/rules/`, beside `framework/`.

## Where to put new behaviour

Application screens, data, and business rules stay in the application. Import `@app-framework/app-config` and `@app-framework/dev-tools` from the package root with a semver range.

When another application needs the same behaviour, propose it in App-Framework. Wait for a published package, a standards version, or a callable workflow before consuming it here.

Read [docs/PROJECT-DEFINITION.md](docs/PROJECT-DEFINITION.md) for the ownership split, [docs/framework-integration.md](docs/framework-integration.md) for package and deploy wiring, and [docs/capability-overview.md](docs/capability-overview.md) for the selected slice.
