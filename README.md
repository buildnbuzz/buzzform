# BuzzForm

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@buildnbuzz/form-core.svg)](https://www.npmjs.com/package/@buildnbuzz/form-core)
[![React](https://img.shields.io/badge/React-18%20%7C%2019-61dafb.svg)](https://react.dev)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org)

A schema-driven form library for React built on TanStack Form. Define your form once and get type-safe forms with validation, conditional logic, and full rendering control.

BuzzForm separates form logic from UI — define schemas in plain TypeScript, get automatic type inference, and render with your favorite UI library (shadcn/ui, Radix, Mantine, or custom components).

Perfect for settings pages, dashboards, and SaaS apps that need flexible, maintainable forms.

## ✨ Features

- **Schema-Driven Forms** — Define your form structure in a simple TypeScript object
- **Full Type Safety** — End-to-end TypeScript with auto-inferred types from your schema
- **TanStack Form Core** — Built on TanStack Form for battle-tested state management
- **UI Agnostic** — Bring your own UI or use the shadcn/ui registry components
- **17+ Field Types** — Text, Number, Password, Select, Date, Checkbox, Switch, Radio, Textarea, Tags, Array, Group, Collapsible, Tabs, Row, and more
- **Conditional Logic** — Show/hide/disable fields with declarative conditions (no callbacks)
- **Auto Validation** — Validators derived from schema properties plus custom rules
- **Dynamic Values** — Reference other fields or external context in labels, defaults, and validators
- **Minimal Boilerplate** — Focus on your form logic, not wiring

## 📦 Monorepo Structure

This Turborepo contains:

```
├── apps/
│   └── web/                    # Documentation site & component registry
│
├── packages/
│   ├── form-core/              # Framework-agnostic primitives (@buildnbuzz/form-core)
│   ├── form-react/             # React adapter (@buildnbuzz/form-react)
│   ├── buzzform/               # DEPRECATED - legacy package
│   └── eslint-config/          # Shared ESLint config
```

### Apps

| Directory  | Description                                                                                                                      |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web` | The BuzzForm documentation website, component registry, and showcase examples. Built with Next.js, Fumadocs, and TailwindCSS.    |

### Packages

| Package                    | Description                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| `@buildnbuzz/form-core`    | **Core Package** — Framework-agnostic schema types, validation, and utilities. Zero DOM dependencies.  |
| `@buildnbuzz/form-react`   | **React Adapter** — React primitives built on TanStack Form. Hooks, providers, and field renderers.    |
| `@buildnbuzz/buzzform`     | **Deprecated** — Legacy package. Migrate to `form-core` + `form-react`. See [Migration Guide](https://form.buildnbuzz.com/docs/migration). |

## 🚀 Quick Start

### Installation

**With shadcn/ui:**
```bash
# Add registry to components.json first, then:
npx shadcn@latest add @buzzform/all
```

**Headless / Custom UI:**
```bash
pnpm add @buildnbuzz/form-core @buildnbuzz/form-react
```

See [Installation](https://form.buildnbuzz.com/docs/installation) for full setup instructions.

### Basic Usage

```tsx title="lib/schemas/contact.ts"
import { defineSchema, type InferType } from "@buildnbuzz/form-core";

export const contactSchema = defineSchema({
  fields: [
    { type: "text", name: "name", label: "Full Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
  ],
});

export type ContactData = InferType<typeof contactSchema.fields>;
```

```tsx title="app/contact-form.tsx"
import { contactSchema } from "@/lib/schemas/contact";
import { Form, FormContent, FormFields, FormSubmit } from "@/components/buzzform/form";

export function ContactForm() {
  return (
    <Form schema={contactSchema} onSubmit={({ value }) => console.log(value)}>
      <FormContent>
        <FormFields />
        <FormSubmit>Send Message</FormSubmit>
      </FormContent>
    </Form>
  );
}
```

See [Quick Start](https://form.buildnbuzz.com/docs/quick-start) for a complete example with validation and server actions.

## 🛠 Development

```bash
pnpm install    # Install dependencies
pnpm dev        # Start development
pnpm build      # Build all packages
```

See [Development](https://form.buildnbuzz.com/docs/development) for detailed setup.

## 📚 Documentation

Visit [form.buildnbuzz.com](https://form.buildnbuzz.com) for full documentation:

- [Quick Start](https://form.buildnbuzz.com/docs/quick-start)
- [Installation](https://form.buildnbuzz.com/docs/installation)
- [Schema Reference](https://form.buildnbuzz.com/docs/schema)
- [Validation](https://form.buildnbuzz.com/docs/validation)
- [Custom Fields](https://form.buildnbuzz.com/docs/custom-fields)

## 🤝 Contributing

Contributions welcome! See [Contributing Guide](https://form.buildnbuzz.com/docs/contributing) for details.

## 📄 License

MIT © [Parth Lad / BuildnBuzz](LICENSE)

---

<p align="center">
  Made with 💛 by <a href="https://buildnbuzz.com">BuildnBuzz</a>
</p>
