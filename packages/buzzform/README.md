# BuzzForm

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

> **DEPRECATED**: This package is no longer maintained. Use `@buildnbuzz/form-core` and `@buildnbuzz/form-react` instead. See the migration guide: https://form.buildnbuzz.com/docs/migration

A schema-driven form library for React + shadcn/ui. Declare fields once, get validated forms with minimal boilerplate.

## Features

- 🎯 **Schema-Driven** – Define fields as data, render forms automatically
- 🧩 **17+ Field Types** – Text, password, select, date, upload, arrays, tabs, and more
- ⚡ **Auto Validation** – Generates Zod schemas from your field definitions
- 🎨 **shadcn/ui Native** – Beautiful, accessible components out of the box
- 🔌 **Adapter Pattern** – Built for React Hook Form, extensible to others
- 📦 **Registry Ready** – Install components individually via shadcn CLI

## Installation

```bash
# Recommended: Install everything with one command
npx shadcn@latest add https://form.buildnbuzz.com/r/starter
```

This installs `@buildnbuzz/buzzform`, required peer dependencies (`react-hook-form`, `zod`), and all UI components.

<details>
<summary>Manual installation</summary>

```bash
npm install @buildnbuzz/buzzform react-hook-form zod
npx shadcn@latest add https://form.buildnbuzz.com/r/starter
```

</details>

## Quick Start

```tsx
"use client";

import { createSchema, type InferType } from "@buildnbuzz/buzzform";
import { Form } from "@/components/buzzform/form";

const schema = createSchema([
  { type: "text", name: "name", label: "Name", required: true },
  { type: "email", name: "email", label: "Email", required: true },
  { type: "password", name: "password", label: "Password", minLength: 8 },
]);

type FormData = InferType<typeof schema>;

export function LoginForm() {
  const handleSubmit = async (data: FormData) => {
    console.log(data);
  };

  return <Form schema={schema} onSubmit={handleSubmit} submitLabel="Sign In" />;
}
```

## Field Types

### Data Fields

| Type       | Description                                              |
| ---------- | -------------------------------------------------------- |
| `text`     | Single-line text input                                   |
| `email`    | Email input with validation                              |
| `password` | Password with strength indicator, requirements, generate |
| `textarea` | Multi-line text with auto-resize                         |
| `number`   | Numeric input with steppers, formatting                  |
| `date`     | Date picker with presets                                 |
| `datetime` | Date + time picker                                       |
| `select`   | Dropdown with search, multi-select, async options        |
| `checkbox` | Boolean checkbox                                         |
| `switch`   | Toggle switch                                            |
| `radio`    | Radio button group with card variant                     |
| `tags`     | Tag/chip input                                           |
| `upload`   | File upload with drag-drop, previews                     |

### Layout Fields

| Type          | Description                              |
| ------------- | ---------------------------------------- |
| `row`         | Horizontal field layout                  |
| `group`       | Named object container                   |
| `collapsible` | Expandable section                       |
| `tabs`        | Tabbed interface                         |
| `array`       | Repeatable fields with drag-drop sorting |

## Advanced Usage

### Conditional Fields

```tsx
const fields: Field[] = [
  { type: "checkbox", name: "hasCompany", label: "I represent a company" },
  {
    type: "text",
    name: "companyName",
    label: "Company Name",
    condition: (data) => data.hasCompany === true,
  },
];
```

### Dynamic Options

```tsx
const fields: Field[] = [
  { type: "select", name: "country", label: "Country", options: countries },
  {
    type: "select",
    name: "city",
    label: "City",
    dependencies: ["country"],
    options: async ({ data }) => {
      const cities = await fetchCities(data.country);
      return cities;
    },
  },
];
```

### Custom Validation

```tsx
const fields: Field[] = [
  {
    type: "text",
    name: "username",
    label: "Username",
    validate: async (value, { data }) => {
      const available = await checkUsername(value);
      return available || "Username is taken";
    },
  },
];
```

## Documentation

Full documentation and examples: **[form.buildnbuzz.com](https://form.buildnbuzz.com)**

## License

MIT © [Parth Lad / BuildnBuzz](https://buildnbuzz.com)
