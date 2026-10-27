# App-Template

Starting point for a new Next.js application. Shared packages, Cursor standards, and static deployment live in [App-Framework](https://github.com/Clain-Apps/App-Framework). Read [docs/PROJECT-DEFINITION.md](docs/PROJECT-DEFINITION.md) for what this repository owns.

## Create a new application

1. Enable **Template repository** in this repository's GitHub settings. That checkbox is manual.
2. Choose **Use this template**.
3. Set the application name in `foundation.config.json`.
4. Install the selected framework packages and start the app:

```bash
pnpm framework:setup
pnpm install
pnpm dev
```

`pnpm framework:setup` reads `foundation.config.json`. It installs the enabled framework packages when the npm registry has them. While those packages are unpublished, it stops and names what is missing. The page title comes from `APP_NAME` in `.env` (see `.env.example`). An empty value uses `Application`.

Node.js 22 or newer. Continuous integration uses the version in `.nvmrc`. pnpm is pinned to 12.15.0.

## Checks

```bash
pnpm framework:check
pnpm check
```

`pnpm check` typechecks, lints, checks formatting, runs the unit tests, and builds the static site into `out/`.

## Deploy

A generated application deploys on every push to `main` by calling App-Framework's shared workflow. [docs/framework-integration.md](docs/framework-integration.md) describes that caller. Pushing to `main` in `Clain-Apps/App-Template` does not deploy this template.

Add these secrets on the application repository: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, and `VPS_KNOWN_HOSTS`.

## For agents

Read [AGENTS.md](AGENTS.md) before adding a capability.
