"use client";

import { toast } from "sonner";
import { defineSchema, type InferType, useDataField } from "@buildnbuzz/form-react";
import {
  Form,
  FormContent,
  FormFields,
  FormSubmit,
  FormActions,
} from "@/registry/shadcn/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

// 1. Define our custom field component.
// It uses `useDataField` to easily hook into the headless form state.
function ColorPickerField() {
  const {
    fieldApi,
    isDisabled,
    isReadOnly,
    isRequired,
    label,
    description,
    errors,
    isInvalid,
    descriptionId,
    errorId,
    handleChange,
    handleBlur,
  } = useDataField();

  const value = (fieldApi.state.value as string) || "#000000";

  return (
    <FieldGroup data-field={fieldApi.name}>
      <Field data-invalid={isInvalid} data-disabled={isDisabled}>
        {label && (
          <FieldLabel htmlFor={fieldApi.name} className="gap-1 items-baseline">
            {label}
            {isRequired ? <span className="text-destructive">*</span> : null}
          </FieldLabel>
        )}

        <FieldContent>
          <div className="flex gap-2">
            <Input
              id={fieldApi.name}
              name={fieldApi.name}
              type="color"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              readOnly={isReadOnly}
              aria-invalid={isInvalid}
              className="h-8 w-8 shrink-0 cursor-pointer border-0 p-0 rounded-md overflow-hidden shadow-none [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:border-none"            />
            <Input
              type="text"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={handleBlur}
              disabled={isDisabled}
              readOnly={isReadOnly}
              aria-invalid={isInvalid}
              placeholder="#000000"
              className="flex-1 font-mono uppercase"
            />
          </div>
        </FieldContent>

        {description && !isInvalid && (
          <FieldDescription id={descriptionId}>{description}</FieldDescription>
        )}

        {isInvalid && <FieldError id={errorId} errors={errors} />}
      </Field>
    </FieldGroup>
  );
}

// 2. Define the schema, mixing standard fields, layout "ui" fields,
// and our custom "color-picker" field.
const customSchema = defineSchema({
  fields: [
    {
      type: "ui",
      content: (
        <div className="rounded-lg bg-muted p-4 border mb-2">
          <h3 className="font-semibold">Theme Builder</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your application's appearance by selecting custom colors below.
          </p>
        </div>
      ),
    },
    {
      type: "text",
      name: "themeName",
      label: "Theme Name",
      placeholder: "e.g., Midnight Blue",
      required: true,
    },
    {
      type: "ui",
      content: <h4 className="font-medium text-sm mt-4 mb-2">Brand Colors</h4>,
    },
    {
      type: "color-picker",
      name: "primaryColor",
      label: "Primary Color",
      description: "Main color used for buttons and primary actions.",
      defaultValue: "#0f172a",
      required: true,
    },
    {
      type: "color-picker",
      name: "secondaryColor",
      label: "Secondary Color",
      description: "Color used for secondary elements and subtle backgrounds.",
      defaultValue: "#f1f5f9",
    },
    {
      type: "color-picker",
      name: "accentColor",
      label: "Accent Color",
      description: "Color used for active states and highlights.",
      defaultValue: "#3b82f6",
    },
  ],
});

export default function UiAndCustomFieldsExample() {
  const handleSubmit = async ({ value }: { value: unknown }) => {
    // value is inferred properly. Custom fields without explicitly defined type interfaces
    // fall back to `unknown`. Layout fields don't show up here at all.
    const data = value as InferType<typeof customSchema.fields>;

    toast("Saved Custom Form", {
      description: (
        <pre className="mt-2 max-h-48 overflow-auto rounded-md bg-muted text-muted-foreground p-3 text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>UI Layout & Custom Fields</CardTitle>
        <CardDescription>
          Mixing inline UI components with completely custom registered fields.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* We pass our custom fields inside the `registries.fields` prop to register them */}
        <Form
          schema={customSchema}
          onSubmit={handleSubmit}
          registries={{
            fields: {
              "color-picker": ColorPickerField,
            },
          }}
        >
          <FormContent>
            <FormFields />
            <FormActions>
              <FormSubmit>Save Theme</FormSubmit>
            </FormActions>
          </FormContent>
        </Form>
      </CardContent>
    </Card>
  );
}
