# Validation Rules

BuzzForm has **two sources** of validation. This separation exists so common constraints (like `required`, `min`, `max`) are automatically enforced from field properties without repetition, while giving you full control for custom business logic:

1. **Derived checks** — auto-generated from field properties (`required`, `min`, `max`, `pattern`, etc.)
2. **User-defined checks** — explicitly in the `validate` config

## Derived Validation Mode

`derivedValidationMode` controls **when** derived checks run, independently from user-defined checks.

| Mode | When Derived Checks Run | Use Case |
|---|---|---|
| `"blur"` (default at field level) | On blur | Standard — validates after editing |
| `"change"` | On every change | Real-time feedback |
| `"submit"` (default for Standard Schema validator) | On submit only | Minimal noise |

```tsx
<Form
  schema={schema}
  derivedValidationMode="blur" // default, can omit
  onSubmit={handleSubmit}
/>
```

## Validation Config (`validate`)

User-defined checks go in `validate` with trigger keys `onChange`, `onBlur`, `onSubmit`:

```ts
{
  type: "text",
  name: "username",
  required: true,        // → derived "required" check
  minLength: 3,          // → derived "minLength" check
  validate: {
    onBlur: {
      debounceMs: 500,   // debounce async checks
      checks: [
        { type: "usernameAvailable", message: "This username is taken." },
      ],
    },
  },
}
```

## Custom Validators

Register with `defineValidators` and pass via `customValidators` prop:

```ts
import { defineValidators } from "@buildnbuzz/form-core";

const customValidators = defineValidators({
  usernameAvailable: async (value: unknown) => {
    if (typeof value !== "string" || value.length < 3) return false;
    const res = await fetch(`/api/check?username=${value}`);
    return (await res.json()).available;
  },
});
```

```tsx
<Form schema={schema} registries={{ validators: customValidators }} onSubmit={handleSubmit}>
  <FormContent><FormFields /><FormSubmit>Submit</FormSubmit></FormContent>
</Form>
```

## Cross-Field Validation with `$data`

Use `$data` in validator `args` to reference other fields (JSON Pointer paths):

```ts
{
  type: "password", name: "confirmPassword",
  validate: {
    onSubmit: {
      checks: [{
        type: "matches",
        args: { other: { $data: "/password" } },  // resolved at runtime
        message: "Passwords do not match.",
      }],
    },
  },
}
```

## Context-Aware Validation with `$context`

```ts
{
  type: "email", name: "workEmail",
  validate: {
    onBlur: {
      checks: [{
        type: "companyEmail",
        args: { allowedDomains: { $context: "/companyDomains" } },
        message: "Please use an approved company email.",
      }],
    },
  },
}
```

## Form-Level Validation

Spans multiple fields — defined on the schema root:

```ts
const schema = defineSchema({
  fields: [...],
  validate: {
    onSubmit: {
      checks: [{ type: "passwordsMatch", message: "Passwords do not match." }],
    },
  },
});
```

## Auto-Derived Validators by Field Type

| Field Type | Auto-Validators |
|---|---|
| All fields | `required` (if `required: true`) |
| `text`, `textarea` | `pattern`, `minLength`, `maxLength` |
| `email` | `email` |
| `password` | `passwordCriteria`, `minLength`, `maxLength` |
| `number` | `min`, `max`, `precision`, `step` |
| `date` | `minDate`, `maxDate` |
| `tags` | `minTags`, `maxTags` |
| `array` | `minItems`, `maxItems` |
| `select` (hasMany) | `minSelected`, `maxSelected` |

## Key Rules

- `message` supports dynamic expressions (`ExprText`). Use `$text` with `${/args/...}` to reference resolved validator arguments, or `${/data/...}` for form data.
- The `required` validator supports an `isRequired` argument (e.g., `args: { isRequired: { $data: "/other" } }`).
- Unknown validator types are skipped with a console warning — register custom validators via `defineValidators` and pass them through the `customValidators` prop so the runtime can find them.
- Use `debounceMs` for async checks to avoid excessive API calls. Without debounce, every keystroke triggers a network request, which floods the server and creates a poor user experience.
- Validators return `boolean | Promise<boolean>`. `true` = valid, `false` = error. This simple contract keeps validators composable and testable — the framework handles error message display, you just report pass/fail.
