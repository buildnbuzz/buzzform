# BuzzForm (Deprecated)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> ⚠️ **DEPRECATED**: This package is no longer maintained. Use `@buildnbuzz/form-core` and `@buildnbuzz/form-react` instead.
>
> **Why the change?** The new two-package architecture provides better separation of concerns:
> - `@buildnbuzz/form-core` — Framework-agnostic primitives (zero DOM dependencies)
> - `@buildnbuzz/form-react` — React adapter built on TanStack Form
>
> See the [Migration Guide](https://form.buildnbuzz.com/docs/migration) for upgrading.

A schema-driven form library for React + shadcn/ui. Declare fields once, get validated forms with minimal boilerplate.

## Installation

```bash
# ❌ Don't install this deprecated package
# npm install @buildnbuzz/buzzform

# ✅ Install the new packages instead
pnpm add @buildnbuzz/form-core @buildnbuzz/form-react
npx shadcn@latest add @buzzform/all
```

## Quick Start (New API)

```tsx
"use client";

import { defineSchema, type InferType } from "@buildnbuzz/form-core";
import { Form, FormContent, FormFields, FormSubmit } from "@/components/buzzform/form";

const contactSchema = defineSchema({
  title: "Contact Form",
  fields: [
    { type: "text", name: "name", label: "Full Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
    { type: "textarea", name: "message", label: "Message", required: true },
  ],
});

type ContactData = InferType<typeof contactSchema.fields>;

export function ContactForm() {
  return (
    <Form
      schema={contactSchema}
      onSubmit={({ value }) => {
        console.log(value); // Fully typed as ContactData
      }}
    >
      <FormContent>
        <FormFields />
        <FormSubmit>Send Message</FormSubmit>
      </FormContent>
    </Form>
  );
}
```

## Migration

See the [Migration Guide](https://form.buildnbuzz.com/docs/migration) for detailed instructions on upgrading from `@buildnbuzz/buzzform` to the new packages.

### Key Changes

| Old (`buzzform`) | New (`form-core` + `form-react`) |
|------------------|----------------------------------|
| `createSchema()` | `defineSchema()` |
| `InferType<typeof schema>` | `InferType<typeof schema.fields>` |
| `useRhf()` | `useForm()` with TanStack Form |
| Function-based conditions | Declarative AST conditions |
| Zod-based validation | Built-in validators + custom rules |

## Documentation

Full documentation: **[form.buildnbuzz.com](https://form.buildnbuzz.com)**

## License

MIT © [Parth Lad / BuildnBuzz](https://buildnbuzz.com)
