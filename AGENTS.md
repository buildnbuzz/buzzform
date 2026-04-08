# BuzzForm - Agent Guidelines

## Project Overview

- **Goal:** Build robust, headless, framework-agnostic form primitives and framework adapters.
- **Architecture:** Turborepo monorepo with `pnpm` workspaces.
- **Key Packages:**
  - `apps/web`: Fumadocs documentation site & Next.js UI demos.
  - `packages/form-core`: Framework-agnostic core logic (No DOM/UI deps).
  - `packages/form-react`: React adapter for form-core.
  - **Note:** `packages/buzzform` and `apps/web/registry/base` are deprecated; use `form-core`, `form-react`, and `apps/web/registry/shadcn` for new development.

## Tech Stack & Tools

- **Core/Logic:** TypeScript, Vitest
- **Web/Docs:** Next.js App Router, Fumadocs, Tailwind CSS, shadcn/ui
- **UI Components:** Base UI primitives for all shadcn components in `apps/web/components/ui` folder
- **Icons:** Hugeicons (`pnpm icons:dev` to build sprites)

## Required AI Skills

Activate these skills when working in relevant areas:

- `shadcn` (when working in `apps/web/components/ui`)
- `typescript-advanced-types` (when designing generic core APIs)
- `vercel-react-best-practices` (when working in React adapters)

## Automated Documentation (Fumadocs)

We use `fumadocs-typescript` to auto-generate API tables directly from source code.

**JSDoc Rules for Source Code:**

- **Always** add JSDoc comments to exported types, interfaces, classes, and methods.
- Start descriptions with a capital letter and end with a period.
- Use `@internal` for properties that should be hidden from public docs.
- Use `@remarks [type]` to simplify complex mapped types in the generated tables.

**MDX Usage in `apps/web`:**

```mdx
<auto-type-table
  path="../../../../packages/[pkg]/src/[file].ts"
  name="ExportName"
/>
```

## Scripts & Commands (Run from root)

- `pnpm dev` - Start dev servers (docs + icon watcher)
- `pnpm build` - Build the workspace
- `pnpm test` - Run Vitest across all packages
- `pnpm lint` / `pnpm format` / `pnpm check-types`
- `pnpm dlx shadcn@latest add [comp] -c apps/web` - Add UI components

## Git Conventions (GitButler)

Use GitButler (`but` command) for all VCS operations.

- **Branching:** `type/short-description` (e.g., `feat/core-store`)
- **Commits:** `type(scope): description` (e.g., `feat(form-core): add base field state`)

## Do's

- Default to small, pure functions in core packages.
- Ensure exhaustive type safety in core APIs.
- Write standard JSDoc comments on all exports.

## Don'ts

- Do not import framework-specific code (React, DOM) into `form-core`.
- Do not remove existing logic or files without permission.
- Do not run full builds excessively; rely on `pnpm test` and `type-check`.
- **CRITICAL:** Never modify components in `@apps/web/components/ui/**` with style overrides or issue fixes. These are reference implementations; the registry components rely on the user's own UI components, and modifying these here will create a mismatch that breaks features for users.

## Permissions

- **Allowed without prompt:** File reads, TS checks, isolated tests, linting.
- **Ask first:** Package installs, `git/but push`, file deletions, full workspace builds.
