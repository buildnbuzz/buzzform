---
name: buzzform
description: Use when working with BuzzForm schema-driven forms, `@buildnbuzz/form-core`, `@buildnbuzz/form-react`, or any related APIs like `defineSchema`, `InferType`, `FormProvider`, `useDataField`, `useLayoutField`, `RenderFields`, `extractDefaults`, registry-based rendering, validation, conditions, or dynamic behavior. Also use for migration from deprecated `@buildnbuzz/buzzform`. Activate this skill whenever the user mentions BuzzForm, form schemas, form registries, TanStack Form integration with BuzzForm, conditional fields, `$data`/`$context` dynamic values, or field type configuration. Even if the user doesn't say "BuzzForm" explicitly, use this skill if they're working in a project that imports from `@buildnbuzz/*` packages. Do NOT trigger for raw TanStack Form usage without BuzzForm, drag-and-drop form builders, or other form libraries like Formik, React Hook Form, or Zod.
---

# BuzzForm

Use `@buildnbuzz/form-react`. The old `@buildnbuzz/buzzform` package is deprecated.

## Quick Start

**Install**

```bash
pnpm add @buildnbuzz/form-react
npx shadcn@latest add @buzzform/all
```

> Add `"@buzzform": "https://form.buildnbuzz.com/r/{name}.json"` to `registries` in `components.json` first.

**Provider setup (recommended — app root)**

```tsx
import { FormProvider } from "@buildnbuzz/form-react";
import { registry } from "@/components/buzzform/registry";

// In layout.tsx
<FormProvider registries={{ fields: registry }}>{children}</FormProvider>;
```

**Define schema + render form**

```tsx
import { defineSchema, type InferType } from "@buildnbuzz/form-react";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
} from "@/components/buzzform/form";

const schema = defineSchema({
  fields: [
    {
      type: "text",
      name: "name",
      label: (
        <span className="flex items-center gap-1.5">
          Name
          <Tooltip>
            <TooltipTrigger render={<InfoIcon className="size-4" />} />
            <TooltipContent>Your full legal name.</TooltipContent>
          </Tooltip>
        </span>
      ),
      required: true,
    },
    { type: "email", name: "email", label: "Email", required: true },
  ],
});

type FormData = InferType<typeof schema.fields>;

export function ContactForm() {
  return (
    <Form
      schema={schema}
      onSubmit={({ value }) => console.log(value as FormData)}
    >
      <FormContent>
        <FormFields />
        <FormSubmit>Submit</FormSubmit>
      </FormContent>
    </Form>
  );
}
```

## Key Concepts

- Use `defineSchema` from `@buildnbuzz/form-react` (NOT `@buildnbuzz/form-core`) to enable `ReactNode` (JSX) in labels/descriptions.
- **Unified Expressions (`Expr<T>`):** Unified system for all dynamic field properties (`label`, `disabled`, `condition`, etc.).
  - `$data` / `$context`: JSON Pointer paths (starts with `/`).
  - `$text`: String interpolation (e.g., `{ $text: "Hello ${/name}" }`).
  - `$when`: Ternary logic (e.g., `{ $when: condition, $then: a, $else: b }`).
  - `$fn`: Registry calls (e.g., `{ $fn: "calc", args: { x: 1 } }`).
- **FormRegistries:** Unify components (`fields`), validators, and functions (`fns`) into one object on `FormProvider` or `Form`.
- **Preference Rule:** Prioritize registry functions (`$fn`) over inline functions `(ctx) => T` for complex logic to maintain JSON serializability. Use inline functions only if explicitly requested.
- **Inference:** `InferType` for `primitive: true` arrays produces flat arrays (`string[]`) if the child `name` is empty or omitted.
- `condition` **unmounts** the field; `hidden` hides UI but keeps data/validation.
- **Option Resolvers** enable async option loading. Reference via `{ resolver: "key" }` in `options`.

## Imports

```ts
import {
  defineSchema,
  type InferType,
  type FormSchema,
  defineOptionResolvers,
  type OptionResolverRegistry,
  useForm,
  FormProvider,
  type FormRegistries,
  RenderFields,
  Field,
  Form,
  walkFields,
  isDataField,
  toDotNotation,
  fromDotNotation,
} from "@buildnbuzz/form-react";

// Shadcn form components (installed via registry)
import {
  Form,
  FormContent,
  FormFields,
  FormActions,
  FormSubmit,
  FormReset,
  FormMessage,
} from "@/components/buzzform/form";
import { registry } from "@/components/buzzform/registry";
```

## Read These When Needed

- Complete example with every feature: `examples/onboarding.ts` (tested in `examples/onboarding.test.ts`)
- Cascading dropdowns with async options: `registry/shadcn/examples/country-state-form.tsx`
- Schema & field types: `rules/schema.md`
- Validation: `rules/validation.md`
- Dynamic behavior ($data, $context, conditions): `rules/dynamic.md`
- Rendering & custom fields: `rules/rendering.md`
- Migration from deprecated package: `references/migration.md`

## Option Resolver Quick Example

```tsx
const resolvers = defineOptionResolvers({
  listCountries: async () => {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries");
    const json = await res.json();
    return json.data.map((c: { country: string }) => ({
      label: c.country,
      value: c.country,
    }));
  },
  listStates: async ({ data }) => {
    if (!data.country) return [];
    const res = await fetch(`/api/states?country=${data.country}`);
    const json = await res.json();
    return json.states.map((s: { name: string }) => ({
      label: s.name,
      value: s.name,
    }));
  },
});

const schema = defineSchema({
  fields: [
    { type: "select", name: "country", options: { resolver: "listCountries" } },
    {
      type: "select",
      name: "state",
      options: { resolver: "listStates" },
      dependencies: ["/country"], // auto re-fetches + clears value
    },
  ],
});

<Form schema={schema} optionResolvers={resolvers}>
  <FormContent>
    <FormFields />
    <FormSubmit />
  </FormContent>
</Form>;
```
