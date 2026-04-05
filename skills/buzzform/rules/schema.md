# Schema Rules

## `defineSchema` (Recommended)

`defineSchema` wraps your schema object with `as const` internally, which preserves the literal types needed for `InferType` to produce precise TypeScript types. Without it, field names and types widen to `string` and inference breaks.

```ts
import { defineSchema, type InferType } from "@buildnbuzz/form-core";

const schema = defineSchema({
  title: "User Profile",
  fields: [
    { type: "text", name: "firstName", label: "First Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
    { type: "number", name: "age", label: "Age", min: 18, max: 120 },
  ],
});

type FormData = InferType<typeof schema.fields>;
// { firstName: string; email: string; age?: number }
```

Alternative: `const schema = { fields: [...] } as const satisfies FormSchema;` — this works identically but is more verbose. Use it when you need to avoid a function call (e.g., for module-level constants in some bundler configurations).

## Type Inference Rules

| Field Config | Inferred Type |
|---|---|
| `required: true` (literal) | Required key |
| No `required` or dynamic `required` | Optional key (`?`) |
| `type: "group"` | Nested object |
| `type: "array"` | Array of nested objects |
| `type: "array"` + `primitive: true` | `string[]`, `number[]`, etc. |
| `type: "select"` + `hasMany: true` | `string[]` |
| `type: "checkbox"` + `tristate: true` | `boolean \| null` |
| `type: "checkbox"` + `hasMany: true` | `string[]` |

## All Field Types

### Data Fields

| Type | Value Type | Key Properties |
|---|---|---|
| `text` | `string` | `trim`, `minLength`, `maxLength`, `pattern` |
| `email` | `string` | `minLength`, `maxLength` (auto-validates format) |
| `password` | `string` | `minLength`, `maxLength`, `criteria` |
| `textarea` | `string` | `trim`, `minLength`, `maxLength`, `pattern` |
| `number` | `number` | `min`, `max`, `precision`, `step` |
| `select` | `string` or `string[]` | `options`, `hasMany`, `minSelected`, `maxSelected` |
| `date` | `string` | `withTime`, `minDate`, `maxDate` |
| `tags` | `string[]` | `minTags`, `maxTags`, `maxTagLength`, `allowDuplicates` |
| `checkbox` | `boolean` | Single boolean checkbox |
| `checkbox` (tristate) | `boolean \| null` | `tristate: true` — cycles null → true → false → null |
| `checkbox` (group) | `string[]` | `hasMany: true`, `options`, `minSelected`, `maxSelected` |
| `switch` | `boolean` | Toggle |
| `radio` | `string` | `options` |
| `group` | nested object | `fields` — creates named nested data |
| `array` | `T[]` | `fields`, `minItems`, `maxItems`, `primitive` | Repeatable sections — use `primitive: true` for simple value lists |

### Layout Fields (visual-only, no data)

| Type | Description | Key Properties |
|---|---|---|
| `row` | Horizontal layout | `fields` |
| `tabs` | Tabbed container | `tabs: [{ label, fields }]` |
| `collapsible` | Expandable section | `label`, `fields`, `collapsed` |

**Critical:** Tabs/row/collapsible are **layout-only**. They don't have `name` and don't create nested data. This separation exists because layout concerns (how fields are visually arranged) are independent from data concerns (how values are structured in the submission). Use `group` for nested objects:

```ts
// Data is flat: { name, email, notifications }
{ type: "tabs", tabs: [
  { label: "Profile", fields: [{ type: "text", name: "name" }] },
  { label: "Settings", fields: [{ type: "switch", name: "notifications" }] },
]}

// Data is nested: { profile: { name }, settings: { notifications } }
{ type: "tabs", tabs: [
  { label: "Profile", fields: [
    { type: "group", name: "profile", fields: [{ type: "text", name: "name" }] },
  ]},
]}
```

## Default Values (Two Levels)

1. **Field-level** `defaultValue` in schema — extracted automatically by `extractDefaults()`.
2. **Form-level** `defaultValues` prop — overrides schema defaults. Used for editing existing data.

```tsx
<Form schema={schema} defaultValues={{ name: "Existing User" }} onSubmit={handleSubmit} />
```

Merge order: `{ ...extractDefaults(schema.fields), ...defaultValues }`

## Options Format

Options for `select`, `radio`, and checkbox group accept strings or `{ label, value, disabled?, ui? }`:
```ts
options: ["Option 1", "Option 2"]
// or
options: [{ label: "Admin", value: "admin" }, { label: "User", value: "user" }]
```

## Array Variants

Use `ui: { variant: "minimal" }` for a sleek, borderless list aesthetic. This is the recommended variant for primitive arrays (e.g., tags, simple links) or clean nested structures.

```ts
{
  type: "array",
  name: "tags",
  primitive: true,
  ui: { variant: "minimal" },
  fields: [{ type: "text" }],
}
```

## `pattern` Expects a String

Pass a string pattern, not a `RegExp` object: `pattern: "^[A-Z]{3}[0-9]{3}$"`. Schemas must be JSON-serializable (for server-driven forms, storage, and transport), so `RegExp` objects can't be used — the string is compiled to a `RegExp` at validation time.
