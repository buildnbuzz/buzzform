# 🐝 BuzzForm

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@buildnbuzz/buzzform.svg)](https://www.npmjs.com/package/@buildnbuzz/buzzform)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61dafb.svg)](https://react.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)

A simple, customizable React form library for shadcn/ui and Next.js.

BuzzForm lets you declare fields once and get clean, polished forms with live validation, inline feedback, and full rendering control — all with minimal boilerplate.

Perfect for settings pages, dashboards, and SaaS apps built with shadcn/ui.

## ✨ Features

- **Schema-Driven Forms** — Define your form structure in a simple JSON-like schema
- **Full Type Safety** — End-to-end TypeScript support with inferred types
- **shadcn/ui Integration** — Drop-in components that match your design system
- **React Hook Form + Zod** — Built on rock-solid foundations
- **17+ Field Types** — Text, Number, Password, Select, Date, Checkbox, Switch, Radio, Textarea, Tags, Upload, Array, Group, Collapsible, Tabs, Row, and custom Render fields
- **Conditional Logic** — Show/hide fields based on form state
- **Custom Rendering** — Full control over field appearance when needed
- **Validation** — Built-in Zod integration with live inline feedback
- **Minimal Boilerplate** — Focus on your form logic, not wiring

## 📦 Monorepo Structure

This turborepo contains:

```
├── apps/
│   └── web/           # Documentation site & component registry (Next.js 16)
│
├── packages/
│   └── buzzform/      # Core library (@buildnbuzz/buzzform)
```

### Apps

| Directory  | Description                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web` | The BuzzForm documentation website, component registry, and showcase examples. Built with Next.js 16, Fumadocs, and TailwindCSS. |

### Packages

| Package                | Description                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| `@buildnbuzz/buzzform` | The core BuzzForm library. Schema definitions, field types, adapters, and React Hook Form integration. |

## 🚀 Quick Start

### Installation
1. Add `shadcn/ui` to your project:
```
npx shadcn@latest init
```
Or use any other method, following the [instructions](https://ui.shadcn.com/docs/installation).

2. Add `@buildnbuzz/buzzform` package to your project:
```
npm add @buildnbuzz/buzzform
```

3. Add a `@buzzform` to the shadcn registries - in the file `components.json`, add a line to the `registries` section:
```jsonc
{
  // ... existing config
  "registries": {
    "@buzzform": "https://form.buildnbuzz.com/r/{name}.json"
  }
}
```
4. Add the BuzzForm components:
```bash
npx shadcn@latest add @buzzform/all
```

This will install the core BuzzForm components and dependencies into your project.

### Basic Usage

```tsx
import { createSchema } from "@buildnbuzz/buzzform";
import { Form } from "@/components/buzzform/form";

const schema = createSchema([
  { type: "email", name: "email", label: "Email", required: true },
  {
    type: "password",
    name: "password",
    label: "Password",
    required: true,
    minLength: 8,
  },
]);

export function LoginForm() {
  return (
    <Form
      schema={schema}
      onSubmit={(data) => console.log(data)}
      submitLabel="Sign In"
    />
  );
}
```

## 🛠 Development

### Prerequisites

- Node.js 18+
- pnpm 9+

### Setup

```bash
# Install dependencies
pnpm install

# Start development (runs both web app and package in watch mode)
pnpm dev

# Build all packages
pnpm build
```

### Working with the Monorepo

This project uses [Turborepo](https://turbo.build/repo) for efficient builds and caching.

```bash
# Run dev server for web app only
cd apps/web && pnpm dev

# Build the core package only
cd packages/buzzform && pnpm build
```

## 📚 Documentation

Visit [form.buildnbuzz.com](https://form.buildnbuzz.com) for full documentation, including:

- [Getting Started](https://form.buildnbuzz.com/docs)
- [Installation Guide](https://form.buildnbuzz.com/docs/installation)
- [Schema Reference](https://form.buildnbuzz.com/docs/schema)
- [Field Types](https://form.buildnbuzz.com/docs/fields/types)
- [Validation](https://form.buildnbuzz.com/docs/validation)
- [Showcase Examples](https://form.buildnbuzz.com/examples)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [Parth Lad / BuildnBuzz](LICENSE)

---

<p align="center">
  Made with 💛 by <a href="https://buildnbuzz.com">BuildnBuzz</a>
</p>
