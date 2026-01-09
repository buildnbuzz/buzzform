"use client";

import { createSchema } from "@buildnbuzz/buzzform";
import { Form } from "@/registry/base/form";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { ToastCodeBlock } from "@/components/ui/toast-code-block";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const schema = createSchema([
  { type: "text", name: "name", label: "Full Name", required: true },
  { type: "email", name: "email", label: "Email", required: true },
  { type: "password", name: "password", label: "Password", minLength: 8 },
]);

const codeExample = `import { Form, FormFields, FormSubmit } from "@/components/buzzform/form";
import { type Field } from "@buildnbuzz/buzzform";

const fields: Field[] = [
  { type: "text", name: "name", label: "Full Name", required: true },
  { type: "email", name: "email", label: "Email", required: true },
  { type: "password", name: "password", label: "Password", minLength: 8 },
];

export function SignUpForm() {
  const handleSubmit = async (data) => {
    // data is fully typed based on your fields
    toast.success(<pre>{JSON.stringify(data, null, 2)}</pre>);
  };

  return (
    <Form fields={fields} onSubmit={handleSubmit}>
      <FormFields />
      <FormSubmit>Create Account</FormSubmit>
    </Form>
  );
}`;

export function IntroDemo() {
  return (
    <div className="not-prose">
      <Tabs defaultValue="preview">
        <TabsList className="mb-4">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
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
              submitLabel="Create Account"
            />
          </div>
        </TabsContent>
        <TabsContent value="code">
          <div className="[&_figure]:my-0! [&_figure]:border-border/30! [&_figure]:rounded-lg!">
            <DynamicCodeBlock lang="tsx" code={codeExample} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
