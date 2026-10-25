# App Template — Responsibilities

## What is this repository?

App Template is a ready-to-use starting point for new applications.

Its purpose is to eliminate repetitive project setup and establish consistent development, testing and deployment conventions.

Each new application starts with the template and then develops its own features.

## What belongs here?

- Next.js project setup and folder structure.
- Basic landing page and layout.
- Coding standards and developer instructions.
- Environment configuration.
- Testing and code quality configuration.
- GitHub Actions build and deployment pipeline.
- Dependencies on essential shared framework packages.

## What does NOT belong here?

- Reusable implementations of authentication, payments or other optional capabilities.
- Application-specific business features.
- A custom package manager or module installer.
- A central system for managing all deployed applications.
- Code that duplicates App Framework packages.

## Relationship to App Framework

App Template creates the application structure.

App Framework supplies reusable functionality.

New applications can add or remove framework packages as their requirements change.

Updates to framework packages are managed through normal dependency versioning. Changes to the original template do not automatically update existing applications.

## Design principle

**Make starting a new application fast, predictable and simple. Include only what every application genuinely needs.**
