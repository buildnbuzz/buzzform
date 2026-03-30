# @buildnbuzz/form-react

React primitives for BuzzForm. Headless components powered by TanStack Form.

## Installation

```bash
pnpm add @buildnbuzz/form-react
```

**Peer dependencies:** `@buildnbuzz/form-core`, `@tanstack/react-form`, `@tanstack/form-core`, `react`

## Quick Start

```tsx
"use client";

import { defineSchema, type InferType } from "@buildnbuzz/form-core";
import { useForm, FieldRenderer } from "@buildnbuzz/form-react";
import { shadcnRegistry } from "@/registry/shadcn/fields";

const schema = defineSchema({
  title: "Contact Form",
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
  ],
});

export function ContactForm() {
  const form = useForm({
    schema,
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <FieldRenderer
        field={schema.fields[0]!}
        form={form}
        registry={shadcnRegistry}
      />
      <FieldRenderer
        field={schema.fields[1]!}
        form={form}
        registry={shadcnRegistry}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Core APIs

### `useForm` Hook

Extends TanStack Form's `useForm` with schema defaults, validation, and output transforms:

```tsx
import { useForm } from "@buildnbuzz/form-react";

const form = useForm({
  schema,
  defaultValues: { name: "Default" }, // Merges with schema defaults
  contextData: { userRole: "admin" }, // For $context references
  customValidators: {
    /* ... */
  },
  output: { type: "path" }, // Flatten nested output
  onSubmit: ({ value }) => {
    // value is transformed if output config is set
  },
});
```

### `<FormProvider>`

Set up field registry globally:

```tsx
import { FormProvider } from "@buildnbuzz/form-react";
import { shadcnRegistry } from "@/registry/shadcn/fields";

<FormProvider registry={shadcnRegistry}>
  <App />
</FormProvider>;
```

### `<FieldRenderer>` / `<RenderFields>`

Render schema fields with a registry:

```tsx
import { FieldRenderer, RenderFields } from "@buildnbuzz/form-react";

// Single field
<FieldRenderer field={schema.fields[0]!} form={form} />

// All fields
<RenderFields fields={schema.fields} form={form} />
```

## Building Custom Field Components

### Data Fields

Use `useDataField` for fields that register with TanStack Form:

```tsx
import { useDataField } from "@buildnbuzz/form-react";
import type { TextField as TextFieldDef } from "@buildnbuzz/form-core";

export function TextField() {
  const {
    fieldApi,
    field,
    label,
    description,
    errors,
    isInvalid,
    isDisabled,
    isReadOnly,
    isRequired,
    descriptionId,
    errorId,
    ariaDescribedBy,
    handleChange,
    handleBlur,
  } = useDataField<TextFieldDef>();

  return (
    <div>
      <label htmlFor={fieldApi.name}>
        {label}
        {isRequired && <span>*</span>}
      </label>
      <input
        id={fieldApi.name}
        value={fieldApi.state.value ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        disabled={isDisabled}
        readOnly={isReadOnly}
        aria-invalid={isInvalid}
        aria-describedby={ariaDescribedBy}
      />
      {description && <p>{description}</p>}
      {isInvalid && <p role="alert">{errors.join(", ")}</p>}
    </div>
  );
}
```

### Layout Fields

Use `useLayoutField` for container fields (row, tabs, collapsible):

```tsx
import { useLayoutField } from "@buildnbuzz/form-react";
import type { RowField as RowFieldDef } from "@buildnbuzz/form-core";

export function RowField({ children }: { children?: React.ReactNode }) {
  const { label, description } = useLayoutField<RowFieldDef>();

  return (
    <div className="flex gap-4">
      {label && <label>{label}</label>}
      {description && <p>{description}</p>}
      {children}
    </div>
  );
}
```

### `useDataField` Return Type

| Property                                                             | Description                                |
| -------------------------------------------------------------------- | ------------------------------------------ |
| `fieldApi`                                                           | TanStack field instance                    |
| `field`                                                              | Core field schema                          |
| `form`                                                               | Form instance                              |
| `label`, `placeholder`, `description`                                | Resolved text (supports dynamic values)    |
| `isDisabled`, `isReadOnly`, `isRequired`, `isHidden`                 | Runtime visibility state                   |
| `errors`, `isInvalid`, `errorId`, `descriptionId`, `ariaDescribedBy` | Error + a11y state                         |
| `handleChange`, `handleBlur`                                         | Preferred handlers (auto-trim, transforms) |

## Field Registry

Map field types to React components:

```ts
import type { FieldRegistry } from "@buildnbuzz/form-react";

const registry: FieldRegistry = {
  text: TextField,
  email: EmailField,
  select: SelectField,
  group: GroupField,
  array: ArrayField,
  row: RowField,
  tabs: TabsField,
  // ...
};
```

Components receive `children` for nested fields (groups, arrays, rows, tabs):

```tsx
export function GroupField({ children }: { children?: React.ReactNode }) {
  const { label, field } = useDataField();

  return (
    <fieldset>
      <legend>{label}</legend>
      {children}
    </fieldset>
  );
}
```

## Validation

Auto-derived from schema + custom validators:

```tsx
const form = useForm({
  schema,
  customValidators: {
    usernameAvailable: async (value) => {
      const available = await checkUsername(value as string);
      return available ? undefined : "Username taken";
    },
  },
  derivedValidationMode: "blur", // When to run auto-derived checks
});
```

## Additional Hooks

```tsx
import {
  useFormContext, // Get form instance
  useFieldApi, // Get TanStack field API
  useRegistry, // Get field registry
  useFieldOptions, // Normalize select/radio options
  useNestedErrorCount, // Count errors in child fields
} from "@buildnbuzz/form-react";
```

## Resources

- [@buildnbuzz/form-core](../form-core/README.md) — Core primitives
- [TanStack Form](https://tanstack.com/form) — Underlying form engine
