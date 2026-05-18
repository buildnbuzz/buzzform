"use client";

import { toast } from "sonner";
import { defineSchema, type InferType } from "@buildnbuzz/form-react";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
  FormReset,
  FormActions,
} from "@/registry/shadcn/form";
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
      type: "upload",
      name: "avatar",
      label: "Profile Picture",
      description: "Upload a profile photo",
      ui: {
        variant: "avatar",
        shape: "circle",
        size: "lg",
        accept: "image/*",
      },
    },
    {
      type: "text",
      name: "name",
      label: "Display Name",
      placeholder: "Your name",
      required: true,
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      placeholder: "you@example.com",
      required: true,
    },
  ],
});

type ProfileSchema = InferType<typeof profileSchema.fields>;

export default function ProfileUploadForm() {
  const handleSubmit = async ({ value }: { value: unknown }) => {
    const data = value as ProfileSchema;
    await new Promise((r) => setTimeout(r, 1000));
    toast("Profile saved successfully!", {
      description: (
        <div className="space-y-2">
          <p className="text-[10px] text-muted-foreground">
            Check the console for the full File objects.
          </p>
          <pre className="max-h-40 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
            <code>
              {JSON.stringify(
                {
                  ...data,
                  avatar: data.avatar
                    ? data.avatar instanceof File
                      ? {
                          name: data.avatar.name,
                          size: data.avatar.size,
                          type: data.avatar.type,
                        }
                      : data.avatar
                    : null,
                },
                null,
                2,
              )}
            </code>
          </pre>
        </div>
      ),
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Avatar upload with circle preview layout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form schema={profileSchema} onSubmit={handleSubmit}>
          <FormContent>
            <FormFields className="space-y-4" />
            <FormActions className="mt-6">
              <FormReset>Clear</FormReset>
              <FormSubmit>Save Profile</FormSubmit>
            </FormActions>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
