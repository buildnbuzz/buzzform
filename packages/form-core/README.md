# @buildnbuzz/form-core

Framework-agnostic form primitives for BuzzForm. Zero DOM or UI dependencies.

## Installation

```bash
pnpm add @buildnbuzz/form-core
```

## Quick Start

```ts
import { defineSchema, type InferType } from "@buildnbuzz/form-core";

const schema = defineSchema({
  title: "Contact Form",
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
  ],
});

type FormData = InferType<typeof schema.fields>;
// { name: string; email: string }
```

## Core Features

### Schema Definition

Use `defineSchema` for type-safe schemas with auto-inferred types:

```ts
import { defineSchema, type InferType } from "@buildnbuzz/form-core";

const schema = defineSchema({
  id: "user-profile",
  title: "User Profile",
  description: "Update your profile",
  fields: [
    { type: "text", name: "firstName", label: "First Name", required: true },
    { type: "number", name: "age", label: "Age", min: 18, max: 120 },
    {
      type: "select",
      name: "role",
      label: "Role",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
      ],
    },
  ],
});
```

### Dynamic Values

Reference form data (`$data`) or external context (`$context`) for dynamic labels, defaults, and conditions:

```ts
const schema = defineSchema({
  fields: [
    { type: "text", name: "firstName", label: "First Name" },
    {
      type: "text",
      name: "greeting",
      label: { $data: "/firstName" }, // Dynamic label
      defaultValue: { $context: "/defaultGreeting" }, // Dynamic default
    },
  ],
});
```

### Visibility Conditions

Show/hide fields based on form data or context:

```ts
const schema = defineSchema({
  fields: [
    { type: "text", name: "email", label: "Email" },
    {
      type: "text",
      name: "confirmEmail",
      label: "Confirm Email",
      condition: { $data: "/email", contains: "@" }, // Only show if email contains @
    },
  ],
});
```

Supports `$and`, `$or`, and comparison operators (`eq`, `neq`, `gt`, `lt`, `contains`, etc.).

### Validation

Auto-derived validators from field properties plus custom rules:

```ts
const schema = defineSchema({
  fields: [
    {
      type: "text",
      name: "username",
      label: "Username",
      required: true,
      minLength: 3,
      validate: {
        onBlur: {
          checks: [
            {
              type: "usernameAvailable",
              message: "Username is taken.",
            },
          ],
        },
      },
    },
    {
      type: "password",
      name: "confirmPassword",
      label: "Confirm Password",
      required: true,
      validate: {
        onSubmit: {
          checks: [
            {
              type: "matches",
              args: { other: { $data: "/password" } },
              message: "Passwords do not match.",
            },
          ],
        },
      },
    },
  ],
});
```

Register custom validators with `defineValidators`:

```ts
import { defineValidators } from "@buildnbuzz/form-core";

const customValidators = defineValidators({
  usernameAvailable: async (value: unknown) => {
    if (typeof value !== "string") return false;
    
    const available = await checkUsername(value);
    return available ? true : "Username is taken";
  },
});
```

### Output Transforms

Flatten nested submission data into path-keyed format:

```ts
import { transformFormOutput } from "@buildnbuzz/form-core";

const payload = transformFormOutput(
  { profile: { name: "Ada" } },
  { type: "path" },
);
// { "profile.name": "Ada" }
```

## Field Types

**Basic:** `text`, `email`, `password`, `textarea`, `number`  
**Selection:** `select`, `radio`, `checkbox`, `switch`, `tags`  
**Complex:** `date`, `group`, `array`  
**Layout:** `row`, `tabs`, `collapsible`

## Type Inference

| Config | Inferred Type |
|--------|---------------|
| `required: true` | Required key |
| No `required` | Optional key (`?`) |
| `type: "group"` | Nested object |
| `type: "array"` | Array of nested objects |
| `type: "select"` + `hasMany: true` | `string[]` |
| `type: "checkbox"` + `tristate: true` | `boolean \| null` |

## Resources

- [@buildnbuzz/form-react](../form-react/README.md) — React adapter
