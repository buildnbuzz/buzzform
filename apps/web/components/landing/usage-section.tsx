"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { ExampleForm } from "./example-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

export function UsageSection() {
  const code = `import { createSchema } from "@buildnbuzz/buzzform";
import { Form } from "@/components/buzzform/form";

const schema = createSchema([
  {
    type: "text",
    name: "name",
    label: "Name",
    placeholder: "John Doe",
    required: true,
  },
  {
    type: "email",
    name: "email",
    label: "Email",
    placeholder: "john@example.com",
    required: true,
  },
  {
    type: "password",
    name: "password",
    label: "Password",
    placeholder: "••••••••",
    required: true,
    minLength: 8,
    ui: { allowGenerate: true },
  },
  {
    type: "select",
    name: "role",
    label: "Role",
    options: [
      { label: "Developer", value: "dev" },
      { label: "Designer", value: "design" },
      { label: "Product Manager", value: "pm" },
    ],
    defaultValue: "dev",
    required: true,
  },
  {
    type: "checkbox",
    name: "terms",
    label: (
      <span>
        I agree to the
        <Link href="/terms">terms</Link> and
        <Link href="/privacy">privacy policy</Link>
      </span>
    ),
    required: true,
  },
]);

export default function MyForm() {
  return (
    <Form
      schema={schema}
      onSubmit={(data) => console.log(data)}
      submitLabel="Create Account"
    />
  );
}`;

  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 h-125 w-125 rounded-full bg-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 h-125 w-125 rounded-full bg-primary/5 blur-3xl opacity-50" />

      <div className="container mx-auto px-4 md:px-8">
        {/* Main IDE Window */}
        <div className="relative rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-border/20">
          {/* Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded-full bg-red-500/80" />
              <div className="size-3 rounded-full bg-yellow-500/80" />
              <div className="size-3 rounded-full bg-green-500/80" />
            </div>
            <span className="absolute left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground/70 hidden sm:block">
              buzzform.tsx
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              v1.0.0
            </span>
          </div>

          {/* Content Split View */}
          <div className="flex flex-col lg:flex-row h-auto lg:h-150">
            {/* Left Pane: Code */}
            <div className="h-100 lg:h-auto lg:basis-1/2 border-b lg:border-b-0 lg:border-r border-border/40 bg-zinc-950/20 relative overflow-hidden">
              <div className="absolute inset-0 [&_pre]:bg-transparent! [&_pre]:border-0! [&_pre]:rounded-none! [&_figure]:my-0! [&_figure]:border-0! [&_figure]:rounded-none! [&_figure]:bg-transparent! [&_code]:font-mono [&_code]:text-[13px]! [&_code]:leading-6!">
                <DynamicCodeBlock lang="tsx" code={code} />
              </div>
            </div>

            {/* Right Pane: Preview */}
            <div className="min-h-125 lg:min-h-0 lg:h-auto lg:basis-1/2 lg:overflow-y-auto bg-background/40 bg-grid-white/5 p-6 md:p-8 flex justify-center">
              <div className="w-full max-w-md">
                <ExampleForm />
              </div>
            </div>
          </div>

          {/* Window Footer (Optional Status Bar) */}
          <div className="hidden md:flex items-center justify-between px-4 py-2 border-t border-border/40 bg-muted/20 text-[10px] text-muted-foreground/70 font-mono">
            <div className="flex items-center gap-3">
              <span>TypeScript JSX</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 hover:text-foreground cursor-help">
                <HugeiconsIcon icon={Settings01Icon} className="size-3" />
                Config
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/docs"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Explore all field types and features
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
