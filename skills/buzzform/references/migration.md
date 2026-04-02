# Migration: Old BuzzForm -> form-core + form-react + shadcn

Goal: replace deprecated `@buildnbuzz/buzzform` with `@buildnbuzz/form-core` + `@buildnbuzz/form-react` and the shadcn registry.

## 1) Update dependencies

```bash
pnpm add @buildnbuzz/form-core @buildnbuzz/form-react
```

Remove the deprecated package from `package.json` if present:
- `@buildnbuzz/buzzform`

## 2) Add the shadcn registry

Add to `components.json`:
```json
{ "registries": { "@buzzform": "https://form.buildnbuzz.com/r/{name}.json" } }
```

Then install all components:
```bash
npx shadcn@latest add @buzzform/all
```

This creates the form components and field registry at `@/components/buzzform/`.

## 3) Update imports and API usage

| Old | New |
|---|---|
| `createSchema` | `defineSchema` from `@buildnbuzz/form-core` |
| `InferType` | `InferType` from `@buildnbuzz/form-core` |
| React hooks | `useForm`, `useDataField`, etc. from `@buildnbuzz/form-react` |
| `@/registry/shadcn/form` | `@/components/buzzform/form` |
| `@/registry/shadcn/fields` | `@/components/buzzform/registry` |
| `shadcnRegistry` | `registry` |

## 4) Add the provider (recommended)

```tsx
// app/layout.tsx
import { FormProvider } from "@buildnbuzz/form-react";
import { registry } from "@/components/buzzform/registry";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <FormProvider registry={registry}>{children}</FormProvider>
      </body>
    </html>
  );
}
```

## 5) Sanity check schema behavior

- `createSchema` → `defineSchema` (same shape, just renamed).
- Tabs/row/collapsible are layout-only; use `group` for nested data.
- `$data`/`$context` paths are JSON Pointer format (`/fieldName`, not `fieldName`).
- `InferType` treats dynamic `required` (e.g., `required: { $data: "/flag" }`) as optional.
