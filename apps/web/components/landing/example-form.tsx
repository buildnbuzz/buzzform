"use client";

import { useState } from "react";
import { defineSchema, type InferType } from "@buildnbuzz/form-react";
import { Form } from "@/registry/shadcn/form";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

const schema = defineSchema({
  fields: [
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
      autoComplete: "email",
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      placeholder: "••••••••",
      required: true,
      minLength: 8,
      ui: {
        allowGenerate: true,
      },
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
      label: "I agree to the terms and privacy policy",
      required: true,
    },
  ],
});

type ExampleSchema = InferType<typeof schema.fields>;

const emptyState = `{
  // Submit the form to see data here
}`;

export function ExampleForm() {
  const [submittedData, setSubmittedData] = useState<ExampleSchema | null>(null);

  return (
    <div className="space-y-4">
      <Form
        schema={schema}
        onSubmit={({ value }) => setSubmittedData(value as ExampleSchema)}
        actions={{ submitLabel: "Create Account" }}
      />

      <div className="[&_figure]:my-0! [&_figure]:border-border/30! [&_figure]:rounded-lg! [&_pre]:text-xs!">
        <p className="text-xs text-muted-foreground mb-2">Submitted data:</p>
        <DynamicCodeBlock
          lang="json"
          code={
            submittedData ? JSON.stringify(submittedData, null, 2) : emptyState
          }
        />
      </div>
    </div>
  );
}
