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

`next.config.ts` sets `output: "export"`. `pnpm build` writes the site to `out/`. The deployment workflow copies that directory and does not run Node.js on the server.

This profile cannot host Route Handlers, server-side rendering, WebSockets, or other processes that must stay running. Those need another application profile and another deployment workflow.

## Before the packages are published

App-Framework keeps the packages private until its npm scope is confirmed and the first versions are published. Wait for those versions. Do not commit a path, tarball, or git dependency as a stand-in. `pnpm-lock.yaml` is added only after a normal install resolves the ranges.
