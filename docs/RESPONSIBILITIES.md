# Responsibilities

## What this repository is

App-Template is the starting point for a new application.

It provides a Next.js project, a generic first page, base styling, typed public configuration, development checks, continuous integration, and a static-file deployment workflow.

A repository created with GitHub's **Use this template** is a separate application. It keeps the dependencies and workflows it was given. Later changes to App-Template do not flow into it.

## What this repository is not

- The implementation of reusable framework modules.
- A library of optional business capabilities.
- A package registry or a dependency-upgrade service.
- A production product with its own business logic.
- A process that updates applications created earlier.

## What belongs here

- The application entry point, routes, and the global stylesheet.
- This application's configuration values and the call into `@app-framework/app-config`.
- The `dev` script that calls `framework-check`.
- Editor guidance, the README, and these documents.
- The GitHub Actions workflows that validate this starter and deploy a generated application.

## What belongs in App-Framework

Reusable behaviour that more than one application needs: shared contracts, published packages, and the capability catalogue.

Today that includes `@app-framework/app-config` and `@app-framework/dev-tools`. Their public API is [the consumer contract](https://github.com/daniel-clain/App-Framework/blob/main/docs/consumer-contract.md). The catalogue is [docs/capability-catalogue.md](https://github.com/daniel-clain/App-Framework/blob/main/docs/capability-catalogue.md).

App-Framework must not depend on this repository. This repository must not copy those packages into its own source.

A shared UI package is not published. Building one, if more than one application needs it, is an App-Framework change. This template does not keep a local component library in its place.

## What belongs in an application

Features, data, and workflows that exist for that product alone. The generated repository is where those changes go. It can add or remove framework packages as its requirements change. A version change is a commit in that repository, not a side effect of publishing the template or a framework package.

## How applications use framework packages

Install the published versions with pnpm and a normal semver range. Import the package root only. Do not point the application at the App-Framework git repository.

```bash
pnpm add @app-framework/app-config
pnpm add -D @app-framework/dev-tools
```

Call `framework-check` to see whether a newer stable version exists. It reports the difference and does not install it.
