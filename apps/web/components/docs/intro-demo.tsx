"use client";

import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

const codeExample = `import { defineSchema, type InferType } from "@buildnbuzz/form-react";
import { Form, FormContent, FormFields, FormSubmit } from "@/components/buzzform/form";
import { toast } from "sonner";

// 1. Define schema
const schema = defineSchema({
  fields: [
    { type: "text", name: "name", label: "Full Name", required: true },
    { type: "email", name: "email", label: "Email", required: true },
    { type: "password", name: "password", label: "Password", minLength: 8 },
  ],
});

// 2. Infer type
type FormData = InferType<typeof schema.fields>;
// { name: string; email: string; password: string }

// 3. Render form
export function SignUpForm() {
  return (
    <Form
      schema={schema}
      onSubmit={({ value }) => {
        const data = value as FormData;
        toast("Account created!", { description: data.email });
      }}
    >
      <FormContent>
        <FormFields />
        <FormSubmit>Create Account</FormSubmit>
      </FormContent>
    </Form>
  );
}`;

export function IntroDemo() {
  return (
    <div className="not-prose [&_figure]:my-0! [&_figure]:border-border/30! [&_figure]:rounded-lg!">
      <DynamicCodeBlock lang="tsx" code={codeExample} />
    </div>
  );
}
