---
name: buzzform
description: Use when working with BuzzForm schema-driven forms, `@buildnbuzz/form-core`, `@buildnbuzz/form-react`, `defineSchema`, `InferType`, registry-based rendering, validation, or dynamic behavior, including migration from deprecated `@buildnbuzz/buzzform`.
---

# BuzzForm

Use `@buildnbuzz/form-core` and `@buildnbuzz/form-react`. `@buildnbuzz/buzzform` is deprecated.

## Non-Negotiables

- Use `defineSchema` (not `createSchema`).
- Tabs/row/collapsible are layout-only; use `group` for nested data.
- `$data` and `$context` use absolute JSON Pointer paths.
- `ui` is opaque; cast in renderers.

## Quick Start (Self-Contained)

**Install**
```bash
pnpm add @buildnbuzz/form-core @buildnbuzz/form-react
pnpm add @tanstack/react-form @tanstack/form-core
```

**Add shadcn registry (recommended for Next.js + shadcn/ui)**
```bash
npx shadcn@latest add https://form.buildnbuzz.com/r/starter.json
```

**Provider setup (app-level, recommended)**
```tsx
// app/providers/buzz-form.tsx
"use client";

import { FormProvider } from "@buildnbuzz/form-react";
import { shadcnRegistry } from "@/registry/shadcn/fields";

export function BuzzFormProvider({ children }: { children: React.ReactNode }) {
  return <FormProvider registry={shadcnRegistry}>{children}</FormProvider>;
}
```

**Per-form registry (when no provider)**
```tsx
import { shadcnRegistry } from "@/registry/shadcn/fields";

<Form schema={schema} registry={shadcnRegistry} onSubmit={...}>
  <FormContent><FormFields /><FormSubmit>Submit</FormSubmit></FormContent>
</Form>
```

**Define schema + render form**
```tsx
import { defineSchema, type InferType } from "@buildnbuzz/form-core";
import { Form, FormContent, FormFields, FormSubmit } from "@/registry/shadcn/form";

const schema = defineSchema({
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
  ],
});

type FormData = InferType<typeof schema.fields>;

export function ContactForm() {
  return (
    <Form schema={schema} onSubmit={({ value }) => console.log(value as FormData)}>
      <FormContent>
        <FormFields />
        <FormSubmit>Submit</FormSubmit>
      </FormContent>
    </Form>
  );
}
```

## Read These When Needed

- Schema rules: `rules/schema.md`
- Validation rules: `rules/validation.md`
- Dynamic behavior: `rules/dynamic.md`
- Rendering/registry: `rules/rendering.md`
- Migration from old BuzzForm: `references/migration.md`
