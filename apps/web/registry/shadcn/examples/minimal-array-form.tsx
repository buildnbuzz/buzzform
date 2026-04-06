"use client";

import { defineSchema, type InferType } from "@buildnbuzz/form-core";
import { toast } from "sonner";
import { Form, FormContent, FormSubmit } from "@/registry/shadcn/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const profileSchema = defineSchema({
  fields: [
    {
      type: "array",
      name: "links",
      label: "Social Links",
      description: "Add links to your social profiles or portfolios.",
      primitive: true,
      ui: {
        variant: "minimal",
        addLabel: "Add Link",
      },
      fields: [
        {
          type: "text",
          placeholder: "https://x.com/username",
          required: true,
        },
      ],
    },
    {
      type: "array",
      name: "experiences",
      label: "Work Experience",
      description: "List your previous roles and companies.",
      primitive: false,
      ui: {
        variant: "minimal",
        addLabel: "Add Experience",
      },
      fields: [
        {
          type: "row",
          ui: { gap: 16, responsive: true },
          fields: [
            {
              type: "text",
              name: "company",
              label: "Company",
              placeholder: "Acme Corp",
              required: true,
            },
            {
              type: "text",
              name: "title",
              label: "Job Title",
              placeholder: "Software Engineer",
              required: true,
            },
          ],
        },
      ],
    },
  ],
});

type ProfileSchemaType = InferType<typeof profileSchema.fields>;

export default function MinimalArrayForm() {
  const handleSubmit = async ({ value }: { value: unknown }) => {
    const data = value as ProfileSchemaType;
    await new Promise((r) => setTimeout(r, 800));
    toast("Profile saved!", {
      description: (
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted text-muted-foreground p-3 text-xs pointer-events-auto">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Minimal Arrays</CardTitle>
        <CardDescription>
          Using variant: &quot;minimal&quot; for both primitive strings and
          complex objects to create clean, inline lists without bulky borders.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          schema={profileSchema}
          onSubmit={handleSubmit}
          defaultValues={{
            links: ["https://github.com/buildnbuzz"],
            experiences: [{ company: "Vercel", title: "Frontend Engineer" }],
          }}
        >
          <FormContent autoRender>
            <FormSubmit className="w-full mt-6">Save Layout</FormSubmit>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
