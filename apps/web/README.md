# BuzzForm Web

The official documentation website, component registry, and showcase for [BuzzForm](https://form.buildnbuzz.com).

## 🔗 Links

- **Live Site**: [form.buildnbuzz.com](https://form.buildnbuzz.com)
- **Documentation**: [form.buildnbuzz.com/docs](https://form.buildnbuzz.com/docs)
- **Examples Showcase**: [form.buildnbuzz.com/examples](https://form.buildnbuzz.com/examples)

## ✨ What's Inside

### 📖 Documentation (`/docs`)

Comprehensive documentation powered by [Fumadocs](https://fumadocs.dev), covering:

- Getting Started & Installation
- Schema Reference
- All 17+ Field Types (Text, Number, Password, Select, Date, Checkbox, Switch, Radio, Textarea, Tags, Upload, Array, Group, Collapsible, Tabs, Row, Render)
- Validation with Zod
- Conditional Logic
- Custom Rendering
- Configuration

### 🎠 Showcase (`/examples`)

Interactive examples demonstrating BuzzForm in action:

- Login & Registration Forms
- Settings Pages
- Dynamic Array Fields
- Complex Nested Forms
- And more...

Each example includes a "View Code" button to see the implementation.

### 📦 Component Registry (`/registry`)

A [shadcn/ui-compatible registry](https://ui.shadcn.com/docs/cli) that allows installing BuzzForm components directly into your project:

```bash
# Install core BuzzForm components and all field types
npx shadcn@latest add https://form.buildnbuzz.com/r/starter

# Install specific field types individually
npx shadcn@latest add https://form.buildnbuzz.com/r/text
npx shadcn@latest add https://form.buildnbuzz.com/r/select
npx shadcn@latest add https://form.buildnbuzz.com/r/date
npx shadcn@latest add https://form.buildnbuzz.com/r/array
```

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) (App Router)
- **React**: 19
- **Documentation**: [Fumadocs](https://fumadocs.dev)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Icons**: [HugeIcons](https://hugeicons.com), [Lucide](https://lucide.dev), [Phosphor](https://phosphoricons.com), [Tabler](https://tabler.io/icons)
- **Forms**: [`@buildnbuzz/form-core`](../../packages/form-core), [`@buildnbuzz/form-react`](../../packages/form-react)
- **Validation**: [TanStack Form](https://tanstack.com/form)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm 9+

### Development

```bash
# From the monorepo root
pnpm install
pnpm dev

# Or from this directory
cd apps/web
pnpm dev
```

The development server starts at [http://localhost:3000](http://localhost:3000).

### Building

```bash
# Build the web app
pnpm build

# Start production server
pnpm start
```

### Scripts

| Script                | Description                        |
| --------------------- | ---------------------------------- |
| `pnpm dev`            | Start dev server with icon watcher |
| `pnpm build`          | Build for production               |
| `pnpm start`          | Start production server            |
| `pnpm lint`           | Run ESLint                         |
| `pnpm icons:dev`      | Watch and rebuild custom icons     |
| `pnpm icons:build`    | Build custom icons once            |
| `pnpm registry:build` | Build the shadcn registry          |

## 📁 Project Structure

```
apps/web/
├── app/                    # Next.js App Router pages
│   ├── docs/               # Documentation pages (Fumadocs)
│   ├── examples/           # Showcase examples
│   └── api/                # API routes
├── components/             # React components
│   ├── buzzform/           # BuzzForm field components (local copy)
│   ├── examples/           # Example form components
│   ├── landing/            # Landing page components
│   └── ui/                 # shadcn/ui components
├── content/                # MDX documentation content
│   └── docs/               # Documentation files
├── lib/                    # Utilities and helpers
├── providers/              # React context providers
├── public/                 # Static assets
├── registry/               # shadcn registry source
│   ├── base/               # Core BuzzForm components
│   │   └── fields/         # All field type implementations
│   └── icons/              # Custom icon components
└── registry.json           # Registry configuration
```

## 🎨 Customization

### Theme

The site uses CSS custom properties for theming, compatible with shadcn/ui's theming system. See `app/globals.css` for the theme configuration.

### Icons

Custom icons are built from the `registry/icons/` directory. Run `pnpm icons:build` after adding new icons.

## 📄 License

MIT © [Parth Lad / BuildnBuzz](../../LICENSE)

---

<p align="center">
  Part of the <a href="../../README.md">BuzzForm</a> monorepo
</p>
