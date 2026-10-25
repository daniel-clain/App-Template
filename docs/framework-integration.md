# Framework integration

App-Template follows [App-Framework's consumer contract](https://github.com/daniel-clain/App-Framework/blob/main/docs/consumer-contract.md). It does not redefine those packages.

## Packages

| Package                     | Role in this starter                                           |
| --------------------------- | -------------------------------------------------------------- |
| `@app-framework/app-config` | Typed public configuration                                     |
| `@app-framework/dev-tools`  | `framework-check` during `pnpm dev` and `pnpm framework:check` |

`package.json` lists both under `appFramework.required`. The ranges are `^0.1.0`. There is no database setting: the landing page has to render with an empty environment. The only field is optional public `APP_NAME`, defined in `src/config.ts`.

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

## Update check

```json
{
  "scripts": {
    "framework:check": "framework-check",
    "dev": "framework-check && next dev"
  }
}
```

Warnings and an unavailable registry exit 0, so the development server still starts. Exit 1 is reserved for unreadable local input, such as a broken `package.json`. Successful checks that have nothing to report print nothing. Results are cached for 12 hours under `node_modules/.cache/framework-check.json`.

The checker does not upgrade dependencies. Changing a version remains a commit in the application.

## Static export

`next.config.ts` sets `output: "export"`. `pnpm build` writes the site to `out/`. [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) copies that directory and does not run Node.js on the server.

This profile cannot host Route Handlers, server-side rendering, WebSockets, or other processes that must stay running. Those need another application profile and another deployment workflow. App Framework's reusable workflow can take a different static build through caller inputs. It does not add a server deploy. The Next.js inputs are `.nvmrc`, `pnpm install --frozen-lockfile`, `pnpm check`, `out`, and `index.html`.

This repository keeps its current deploy workflow. The caller in App Framework's consumer contract stays unused until the tag `deploy-static-v1` exists on GitHub.

## Shared standards

`.cursor/framework-standards.json` pins App Framework `standards/cursor` version `1.0.0`. The rules are in `.cursor/rules/framework/`. Update them by rerunning `scripts/sync-cursor-standards.mjs` from App Framework and committing the result. Do not fetch the rules from a URL, and do not edit the copied files in place.

The pin records the framework HEAD at sync time. Rerun the sync after App Framework commits `standards/cursor` if the pin must identify a commit that already contains those files.

## Before the packages are published

App-Framework keeps the packages private until its npm scope is confirmed and the first versions are published. The scope name matches `@app-framework/app-config` and `@app-framework/dev-tools`. `@app-framework/ui` uses the same scope and is not installed here. A lookup on 26 October 2026 returned 404 for all three names. That 404 does not prove the scope is owned or free, and `scopeConfirmed` stays false.

Wait for registry versions. Do not commit a path, tarball, or git dependency as a stand-in. `pnpm-lock.yaml` is added only after a normal install resolves the ranges. Do not add `@app-framework/ui` before `npm view @app-framework/ui` succeeds.
