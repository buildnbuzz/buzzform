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
<FormProvider registry={registry}>{children}</FormProvider>
```

**Define schema + render form**
```tsx
import { defineSchema, type InferType } from "@buildnbuzz/form-react";
import { Form, FormContent, FormFields, FormSubmit } from "@/components/buzzform/form";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

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
    <Form schema={schema} onSubmit={({ value }) => console.log(value as FormData)}>
      <FormContent>
        <FormFields />
        <FormSubmit>Submit</FormSubmit>
      </FormContent>
    </Form>
  );
}
```

## Key Concepts

- Use `defineSchema` from `@buildnbuzz/form-react` (NOT `@buildnbuzz/form-core`). While available in core, importing from the React package enables global module augmentation, allowing you to use `ReactNode` (JSX) directly in `label` and `description` properties.
- **React Overrides:** You can pass rich JSX (tooltips, icons, help text) to `label` and `description` in your schemas. This is the preferred way to add field-level documentation or custom UI elements without building custom field components.
- **Layout fields** (`row`, `tabs`, `collapsible`) are visual-only — they don't create nested data. This is the most common mistake: wrapping fields in `tabs` and expecting nested output. Tabs organize UI; `group` organizes data. Use `group` inside tabs if you need nested objects.
- `$data` uses JSON Pointer paths into form data (e.g., `"/employmentStatus"`). Supports relative paths inside groups/arrays — the React adapter resolves them to absolute paths automatically.
- `$context` uses JSON Pointer paths into external context data passed via `contextData` prop. Think of `$context` as "who is filling out this form" (role, permissions) vs `$data` as "what they chose in the form".
- `ui` property is opaque to core — cast to your own type in renderers (e.g., `field.ui as TextUi`). This design keeps `form-core` UI-agnostic, so the same schema works with shadcn, MUI, Chakra, or any component library.
- `condition` **unmounts** the field (removed from data + validation). `hidden` keeps it in data/validation but hides the UI. Choose `condition` when the field shouldn't exist in the submitted data; choose `hidden` when you need the value to persist but just not be visible.
- **Option Resolvers** enable async option loading for `select`/`radio`/`checkbox` fields. Use `defineOptionResolvers` to create a registry of async fetchers, reference them with `{ resolver: "key" }`, and declare `dependencies` for cascading dropdowns. The system handles dependency tracking, request deduplication, stale value clearing, and loading states automatically.
- Inline async functions can be passed directly to `options` but make the schema non-JSON-serializable. Use the resolver registry when serialization is needed.

## Imports

```ts
// React package (Preferred import for all user-facing APIs)
import {
  defineSchema, type InferType, type FormSchema,
  defineOptionResolvers, type OptionResolverRegistry,
  useForm, FormProvider, useDataField, useLayoutField, useFieldOptions,
  RenderFields, Field, Form,
  walkFields, isDataField, toDotNotation, fromDotNotation
} from "@buildnbuzz/form-react";

// Shadcn form components (installed via registry)
import { Form, FormContent, FormFields, FormActions, FormSubmit, FormReset, FormMessage } from "@/components/buzzform/form";
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
      label: c.country, value: c.country,
    }));
  },
  listStates: async ({ data }) => {
    if (!data.country) return [];
    const res = await fetch(`/api/states?country=${data.country}`);
    const json = await res.json();
    return json.states.map((s: { name: string }) => ({
      label: s.name, value: s.name,
    }));
  },
});

const schema = defineSchema({
  fields: [
    { type: "select", name: "country", options: { resolver: "listCountries" } },
    {
      type: "select", name: "state",
      options: { resolver: "listStates" },
      dependencies: ["/country"],  // auto re-fetches + clears value
    },
  ],
});

<Form schema={schema} optionResolvers={resolvers}>
  <FormContent><FormFields /><FormSubmit /></FormContent>
</Form>
```
