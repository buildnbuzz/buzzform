# Migration: Old BuzzForm -> form-core + form-react + shadcn

Goal: replace deprecated `@buildnbuzz/buzzform` with `@buildnbuzz/form-core` + `@buildnbuzz/form-react` and the shadcn registry.

## 1) Update dependencies

```bash
pnpm add @buildnbuzz/form-core @buildnbuzz/form-react
pnpm add @tanstack/react-form @tanstack/form-core
```

Remove the deprecated package from `package.json` if present:
- `@buildnbuzz/buzzform`

## 2) Add the shadcn registry (Next.js + shadcn/ui)

```bash
npx shadcn@latest add https://form.buildnbuzz.com/r/starter.json
```

This creates registry + form components used in examples.

## 3) Update imports and API usage

- `createSchema` -> `defineSchema` from `@buildnbuzz/form-core`
- `InferType` from `@buildnbuzz/form-core`
- React hooks/components from `@buildnbuzz/form-react`
- Form UI from the registry (example): `@/registry/shadcn/form`

## 4) Add the provider (recommended)

```tsx
// app/providers/buzz-form.tsx
"use client";

import { FormProvider } from "@buildnbuzz/form-react";
import { shadcnRegistry } from "@/registry/shadcn/fields";

export function BuzzFormProvider({ children }: { children: React.ReactNode }) {
  return <FormProvider registry={shadcnRegistry}>{children}</FormProvider>;
}
```

Wrap your app root with `BuzzFormProvider`.

## 5) Sanity check schema behavior

- Tabs/row/collapsible are layout-only; use `group` for nested data.
- `$data`/`$context` paths are absolute JSON Pointer strings.
