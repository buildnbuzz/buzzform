import type { Field } from "@buildnbuzz/form-core";

/**
 * Common properties shared by all data-bearing fields.
 */
export const baseDataProperties: Field[] = [
  {
    type: "text",
    name: "name",
    label: "Name",
    description: "Used as the key in form data (no spaces)",
    required: true,
    placeholder: "fieldName",
  },
  {
    type: "text",
    name: "label",
    label: "Label",
    description: "Display label shown above the field",
    placeholder: "Field Label",
  },
  {
    type: "textarea",
    name: "description",
    label: "Description",
    description: "Help text shown below the field",
  },
];

/**
 * Common visibility and state expressions.
 */
export const baseStateProperties: Field[] = [
  {
    type: "checkbox",
    name: "hidden",
    label: "Hidden",
    description: "Hide this field from the form",
    ui: { widget: "expression", alignment: "between" },
  },
  {
    type: "checkbox",
    name: "disabled",
    label: "Disabled",
    description: "Prevent user interaction",
    ui: { widget: "expression", alignment: "between" },
  },
  {
    type: "checkbox",
    name: "readOnly",
    label: "Read Only",
    description: "Display value but prevent editing",
    ui: { widget: "expression", alignment: "between" },
  },
  {
    type: "checkbox",
    name: "condition",
    label: "Condition",
    description: "Only render when expression is true",
    ui: { widget: "expression", alignment: "between" },
  },
];

/**
 * Common layout properties (Width, etc.)
 */
export const baseLayoutProperties: Field[] = [
  {
    type: "select",
    name: "ui.style.width",
    label: "Width",
    description: "Field width (useful in rows)",
    options: [
      { label: "Auto", value: "auto" },
      { label: "25%", value: "25%" },
      { label: "33%", value: "33.33%" },
      { label: "50%", value: "50%" },
      { label: "66%", value: "66.66%" },
      { label: "75%", value: "75%" },
      { label: "100%", value: "100%" },
    ],
    defaultValue: "100%",
  },
];
