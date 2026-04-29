import type { Field } from "@buildnbuzz/form-core";

/** Property editor config for `checkbox-group` fields. */
export const checkboxGroupFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          { type: "text", name: "name", label: "Name", description: "Used as the key in form data (no spaces)", required: true },
          { type: "text", name: "label", label: "Label", description: "Display label shown above the field" },
          { type: "textarea", name: "description", label: "Description", description: "Help text shown below the field"},
          { type: "switch", name: "hidden", label: "Hidden", description: "Hide this field from the form", ui: { widget: "expression", alignment: "between" } },
          { type: "switch", name: "disabled", label: "Disabled", description: "Prevent user interaction", ui: { widget: "expression", alignment: "between" } },
          { type: "switch", name: "readOnly", label: "Read Only", description: "Display value but prevent editing", ui: { widget: "expression", alignment: "between" } },
          { type: "switch", name: "condition", label: "Condition", description: "Only render when expression is true", ui: { widget: "expression", alignment: "between" } },
        ],
      },
      {
        label: "Options",
        fields: [
          { type: "text", name: "options", label: "Options", description: "Comma-separated option values", placeholder: "Option A, Option B, Option C" },
        ],
      },
      {
        label: "Validation",
        fields: [
          { type: "switch", name: "required", label: "Required", description: "User must fill this field", ui: { alignment: "between" } },
          { type: "number", name: "minSelected", label: "Min Selected", description: "Minimum selections", min: 0 },
          { type: "number", name: "maxSelected", label: "Max Selected", description: "Maximum selections", min: 1 },
        ],
      },
    ],
  },
];
