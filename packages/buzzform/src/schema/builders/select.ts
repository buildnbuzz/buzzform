import { z } from "zod";
import type { SelectField, RadioField, CheckboxGroupField } from "../../types";
import { makeOptional } from "../helpers";

// Base schema for select/radio values with user-friendly error messages
const selectValueSchema = z.union(
  [
    z.string({ error: "Please select an option" }),
    z.number({ error: "Please select an option" }),
    z.boolean({ error: "Please select an option" }),
  ],
  { error: "Please select an option" },
);

type MultiSelectConfig = {
  minSelected?: number;
  maxSelected?: number;
  required?: boolean;
};

function applyMultiSelectConstraints(
  schema: z.ZodArray<typeof selectValueSchema>,
  config: MultiSelectConfig,
): z.ZodArray<typeof selectValueSchema> {
  const { minSelected, maxSelected, required } = config;
  let next = schema;

  if (minSelected !== undefined && minSelected > 0) {
    const minMsg = `Select at least ${minSelected} option${minSelected !== 1 ? "s" : ""}`;
    if (required) {
      next = next.min(minSelected, minMsg);
    } else {
      // Optional multi-selects should allow no selection, but enforce min once user starts selecting.
      next = next.refine(
        (val) => val.length === 0 || val.length >= minSelected,
        {
          message: minMsg,
        },
      );
    }
  }

  if (required && (minSelected === undefined || minSelected === 0)) {
    next = next.min(1, "Select at least one option");
  }

  if (maxSelected !== undefined) {
    next = next.max(
      maxSelected,
      `Select at most ${maxSelected} option${maxSelected !== 1 ? "s" : ""}`,
    );
  }

  return next;
}

export function createSelectFieldSchema(field: SelectField): z.ZodTypeAny {
  if (field.hasMany) {
    let arraySchema = z.array(selectValueSchema, {
      error: "Invalid selection",
    });
    arraySchema = applyMultiSelectConstraints(arraySchema, {
      minSelected: field.minSelected,
      maxSelected: field.maxSelected,
      required: field.required,
    });

    if (!field.required) {
      return arraySchema.optional().default([]);
    }
    return arraySchema;
  }

  let schema: z.ZodTypeAny = selectValueSchema;

  if (field.required) {
    schema = selectValueSchema.refine(
      (val) => val !== "" && val !== null && val !== undefined,
      "Please select an option",
    );
  }

  if (!field.required) {
    return makeOptional(schema, "select");
  }

  return schema;
}

export function createRadioFieldSchema(field: RadioField): z.ZodTypeAny {
  let schema: z.ZodTypeAny = selectValueSchema;

  if (field.required) {
    schema = selectValueSchema.refine(
      (val) => val !== "" && val !== null && val !== undefined,
      "Please select an option",
    );
  }

  if (!field.required) {
    return makeOptional(schema, "radio");
  }

  return schema;
}

export function createCheckboxGroupFieldSchema(
  field: CheckboxGroupField,
): z.ZodTypeAny {
  let schema = z.array(selectValueSchema, { error: "Invalid selection" });
  schema = applyMultiSelectConstraints(schema, {
    minSelected: field.minSelected,
    maxSelected: field.maxSelected,
    required: field.required,
  });

  if (!field.required) {
    return makeOptional(schema, "checkbox-group");
  }

  return schema;
}
