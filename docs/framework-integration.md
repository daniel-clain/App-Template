# Framework integration

App-Template follows [App-Framework's consumer contract](https://github.com/Clain-Apps/App-Framework/blob/main/docs/consumer-contract.md). Package implementations stay in that repository.

## Declaration

`foundation.config.json` lists the capabilities this application enables, the version range for each package, and the deploy caller. `pnpm framework:setup` reads it.

```bash
pnpm framework:setup
```

The command uses Node.js only, so it runs before the framework packages are installed. It queries the npm registry for each enabled package. `pnpm add` runs only when every enabled package resolves inside its range. A 404, a network failure, or a version outside the range stops the command before any write.

App-Framework does not publish a setup command. `@app-framework/dev-tools` provides `framework-check`, which compares installed versions and edits nothing. That package is unpublished, so this starter cannot shell out to it during setup. The command also refuses a git or `file:` install. Wait for registry versions.

On 27 October 2026 the registry returned 404 for `@app-framework/app-config`, `@app-framework/dev-tools`, and `@app-framework/ui`. Setup exits non-zero and names those enabled packages. `pnpm-lock.yaml` is absent until a later successful install.

## Packages

| Package                     | Role in this starter                                           |
| --------------------------- | -------------------------------------------------------------- |
| `@app-framework/app-config` | Typed public configuration                                     |
| `@app-framework/dev-tools`  | `framework-check` during `pnpm dev` and `pnpm framework:check` |

`package.json` lists both under `appFramework.required`. The ranges are `^0.1.0`. The same ranges are in `foundation.config.json`. The landing page has to render with an empty environment. The only field is optional public `APP_NAME`, defined in `src/config.ts`.

```ts
import { defineConfig, loadPublicConfig } from "@app-framework/app-config";

const appConfig = defineConfig({
  public: {
    APP_NAME: { kind: "string", default: "Application" },
  },
});

const publicConfig = loadPublicConfig(appConfig, process.env);
```

`loadPublicConfig` reads public keys only. Server-only values are not declared. A missing or empty `APP_NAME` uses the default. `ConfigError` is thrown for a definition or value this schema rejects, and the Next.js error page is the application boundary for an unexpected render failure.

`@app-framework/ui` is optional, disabled, and unpublished. The landing page is ordinary HTML and `src/app/globals.css`.

## Update check

```json
{
  "scripts": {
    "framework:check": "framework-check",
    "dev": "framework-check && next dev"
  }
}
```

Warnings and an unavailable registry exit 0, so the development server still starts once the package is installed. Exit 1 is reserved for unreadable local input, such as a broken `package.json`. Successful checks that have nothing to report print nothing. Results are cached for 12 hours under `node_modules/.cache/framework-check.json`.

The checker does not upgrade dependencies. Changing a version remains a commit in the application, after `pnpm framework:setup` can see the release.

## Static export

`next.config.ts` sets `output: "export"`. `pnpm build` writes the site to `out/`.

[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) calls:

`Clain-Apps/App-Framework/.github/workflows/deploy-static.yml@main`

The inputs are the Next.js profile from the consumer contract: `.nvmrc`, `pnpm install --frozen-lockfile`, `pnpm check`, `out`, and `index.html`. The job also passes `rollback` and the four secrets by name. It requests `contents: read`.

`@main` follows later edits to that workflow file. `@deploy-static-v1` is the stable pin in the consumer contract. That tag is not on GitHub, so this caller uses `@main` until an application chooses the tag.

The shared workflow publishes under `/root/apps/<repository-name>/`. The repository name comes from `github.repository` inside that workflow. There is no destination input, and this repository does not keep its own transfer script. Server preparation stays in the consumer contract.

The caller runs on pushes to `main` and on a manual rollback, and only when `github.repository` is not `Clain-Apps/App-Template`. The shared workflow still skips the previous owner name `daniel-clain/App-Template`. The caller condition is what skips this repository.

This profile cannot host Route Handlers, server-side rendering, WebSockets, or other processes that must stay running. Those need another application profile and another deployment workflow.

## Shared standards

`.cursor/framework-standards.json` pins App-Framework `standards/cursor` version `1.0.0`. The rules are in `.cursor/rules/framework/`. Update them by rerunning `scripts/sync-cursor-standards.mjs` from App-Framework and committing the result. Setup does not fetch the rules, and the copied files stay as committed.

The pin records the framework commit at sync time. Rerun the sync after App-Framework commits `standards/cursor` if the pin must identify a commit that already contains those files.
