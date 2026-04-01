"use client";

import { defineSchema } from "@buildnbuzz/form-core";
import { useForm, Form, FormProvider } from "@buildnbuzz/form-react";
import { registry as shadcnRegistry } from "@/registry/shadcn/registry";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToastCodeBlock } from "@/components/ui/toast-code-block";
import { toast } from "sonner";

// Step 1: Basic form
const basicSchema = defineSchema({
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
  ],
});

const basicCode = `import { defineSchema, type InferType } from "@buildnbuzz/form-core";
import { useForm, Form } from "@buildnbuzz/form-react";

const schema = defineSchema({
  fields: [
    { type: "text", name: "name", label: "Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
  ],
});

type FormData = InferType<typeof schema.fields>;

export function ContactForm() {
  const form = useForm({
    schema,
    onSubmit: ({ value }) => {
      console.log(value); // { name: string, email: string }
    },
  });

  return (
    <Form form={form} fields={schema.fields}>
      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <button type="submit" disabled={!canSubmit}>
            Send
          </button>
        )}
      </form.Subscribe>
    </Form>
  );
}`;

// Step 2: With validation
const validationSchema = defineSchema({
  fields: [
    {
      type: "text",
      name: "username",
      label: "Username",
      required: true,
      minLength: 3,
    },
    { type: "email", name: "email", label: "Email", required: true },
    {
      type: "password",
      name: "password",
      label: "Password",
      required: true,
      minLength: 8,
    },
  ],
});

const validationCode = `import { defineSchema } from "@buildnbuzz/form-core";
import { useForm, Form } from "@buildnbuzz/form-react";

const schema = defineSchema({
  fields: [
    {
      type: "text",
      name: "username",
      label: "Username",
      required: true,
      minLength: 3  // Auto-validates minimum length
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      required: true  // Auto-validates email format
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      required: true,
      minLength: 8  // Auto-validates minimum 8 characters
    },
  ],
});

const form = useForm({ schema });

// Validation runs automatically on submit
// Set derivedValidationMode: "onBlur" to run on blur`;

// Step 3: With more fields
const fullSchema = defineSchema({
  fields: [
    { type: "text", name: "name", label: "Full Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
    {
      type: "select",
      name: "role",
      label: "Role",
      options: [
        { label: "Developer", value: "dev" },
        { label: "Designer", value: "design" },
        { label: "Product Manager", value: "pm" },
      ],
      required: true,
    },
    { type: "checkbox", name: "newsletter", label: "Subscribe to newsletter" },
  ],
});

const fullCode = `import { defineSchema, type InferType } from "@buildnbuzz/form-core";
import { useForm, Form } from "@buildnbuzz/form-react";

const schema = defineSchema({
  fields: [
    { type: "text", name: "name", label: "Full Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
    {
      type: "select",
      name: "role",
      label: "Role",
      options: [
        { label: "Developer", value: "dev" },
        { label: "Designer", value: "design" },
        { label: "Product Manager", value: "pm" },
      ],
      required: true,
    },
    { type: "checkbox", name: "newsletter", label: "Subscribe to newsletter" },
  ],
});

type FormData = InferType<typeof schema.fields>;

export function SignUpForm() {
  const form = useForm({
    schema,
    onSubmit: ({ value }) => {
      // value is typed: { name: string, email: string, role: string, newsletter: boolean }
      console.log(value);
    },
  });

  return (
    <Form form={form} fields={schema.fields}>
      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <button type="submit" disabled={!canSubmit}>
            Create Account
          </button>
        )}
      </form.Subscribe>
    </Form>
  );
}`;

function DemoWrapper({
  schema,
  code,
  submitLabel = "Submit",
}: {
  schema: ReturnType<typeof defineSchema>;
  code: string;
  submitLabel?: string;
}) {
  return (
    <div className="not-prose">
      <Tabs defaultValue="code">
        <TabsList className="mb-4">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="code">
          <div className="[&_figure]:my-0! [&_figure]:rounded-lg!">
            <DynamicCodeBlock lang="tsx" code={code} />
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <div className="rounded-lg border border-border bg-card p-6 max-w-sm mx-auto">
            <FormProvider registry={shadcnRegistry}>
              <FormPreview schema={schema} submitLabel={submitLabel} />
            </FormProvider>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function FormPreview({
  schema,
  submitLabel,
}: {
  schema: ReturnType<typeof defineSchema>;
  submitLabel: string;
}) {
  const form = useForm({
    schema,
    onSubmit: ({ value }) => {
      toast("Form Submitted!", {
        description: <ToastCodeBlock code={JSON.stringify(value, null, 2)} />,
      });
    },
  });

  return (
    <Form form={form} fields={schema.fields}>
      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {submitLabel}
          </button>
        )}
      </form.Subscribe>
    </Form>
  );
}

export function BasicFormDemo() {
  return (
    <DemoWrapper schema={basicSchema} code={basicCode} submitLabel="Send" />
  );
}

export function ValidationFormDemo() {
  return (
    <DemoWrapper
      schema={validationSchema}
      code={validationCode}
      submitLabel="Sign Up"
    />
  );
}

export function FullFormDemo() {
  return (
    <DemoWrapper
      schema={fullSchema}
      code={fullCode}
      submitLabel="Create Account"
    />
  );
}
