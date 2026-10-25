# App-Template

This repository is an application starter. It is not a framework implementation.

App-Framework owns reusable packages, shared contracts, and the capability catalogue. This repository owns assembly: the Next.js entry point, this application's configuration values, the call to `framework-check`, the base page, and the validation and deployment workflows.

Do not copy a framework module into this repository. If a behaviour is useful to more than one application, propose it for App-Framework. Do not add a local substitute while waiting for a package.

Keep the starter generic. Do not add product workflows, authentication, databases, or dashboards to demonstrate the structure. Optional capabilities wait for a real application requirement.

Imports from App-Framework use the published package root and a normal version range. Do not depend on the App-Framework git tree.

Read [docs/RESPONSIBILITIES.md](docs/RESPONSIBILITIES.md) for the ownership split, [docs/framework-integration.md](docs/framework-integration.md) for the package wiring, and [docs/capability-overview.md](docs/capability-overview.md) for the catalogue slice. The full catalogue stays in App-Framework.
