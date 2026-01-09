"use client";

import { useState } from "react";
import { createSchema } from "@buildnbuzz/buzzform";
import { Form } from "@/registry/base/form";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import Link from "next/link";

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
    label: (
      <span>
        I agree to the <Link href="/terms">terms</Link> and{" "}
        <Link href="/privacy">privacy policy</Link>
      </span>
    ),
    required: true,
  },
]);

const emptyState = `{
  // Submit the form to see data here
}`;

export function ExampleForm() {
  const [submittedData, setSubmittedData] = useState<Record<
    string,
    unknown
  > | null>(null);

  return (
    <div className="space-y-4">
      <Form
        schema={schema}
        onSubmit={(data) => setSubmittedData(data)}
        submitLabel="Create Account"
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
