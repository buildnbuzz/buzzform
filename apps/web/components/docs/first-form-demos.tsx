"use client";

import { createSchema } from "@buildnbuzz/buzzform";
import { Form } from "@/registry/base/form";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ToastCodeBlock } from "@/components/ui/toast-code-block";
import { toast } from "sonner";

const basicSchema = createSchema([
  { type: "text", name: "name", label: "Name", required: true },
  { type: "email", name: "email", label: "Email", required: true },
]);

const basicCode = `import { createSchema } from "@buildnbuzz/buzzform";
import { Form } from "@/components/buzzform/form";

const schema = createSchema([
  { type: "text", name: "name", label: "Name", required: true },
  { type: "email", name: "email", label: "Email", required: true },
]);

export function ContactForm() {
  return (
    <Form
      schema={schema}
      onSubmit={(data) => console.log(data)}
      submitLabel="Send"
    />
  );
}`;

// Step 2: With validation
const validationSchema = createSchema([
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
]);

const validationCode = `const schema = createSchema([
  { 
    type: "text", 
    name: "username", 
    label: "Username", 
    required: true, 
    minLength: 3  // Built-in validation
  },
  { 
    type: "email", 
    name: "email", 
    label: "Email", 
    required: true  // Email format validated automatically
  },
  { 
    type: "password", 
    name: "password", 
    label: "Password", 
    required: true, 
    minLength: 8  // Minimum 8 characters
  },
]);`;

// Step 3: With more fields
const fullSchema = createSchema([
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
]);

const fullCode = `const schema = createSchema([
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
]);

export function SignUpForm() {
  const handleSubmit = async (data) => {
    // data is fully typed: { name, email, role, newsletter }
    await saveToDatabase(data);
    toast.success("Account created!");
  };

  return (
    <Form
      schema={schema}
      onSubmit={handleSubmit}
      submitLabel="Create Account"
    />
  );
}`;

function DemoWrapper({
  schema,
  code,
  submitLabel = "Submit",
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: any;
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
            <Form
              schema={schema}
              onSubmit={(data) => {
                toast("Form Submitted!", {
                  description: (
                    <ToastCodeBlock code={JSON.stringify(data, null, 2)} />
                  ),
                });
              }}
              submitLabel={submitLabel}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
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
