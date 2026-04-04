import type { Field } from "@buildnbuzz/form-core";

/** Property editor config for `checkbox` fields. */
export const checkboxFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          { type: "text", name: "name", label: "Name", description: "Used as the key in form data (no spaces)", required: true },
          { type: "text", name: "label", label: "Label", description: "Display label next to the checkbox" },
          { type: "textarea", name: "description", label: "Description", description: "Help text shown below the field"},
          { type: "switch", name: "tristate", label: "Tri-State", description: "Allow null (not sure) value. Cycles: null → true → false → null", ui: { alignment: "between" } },
          { type: "switch", name: "hidden", label: "Hidden", description: "Hide this field from the form", ui: { alignment: "between" } },
          { type: "switch", name: "disabled", label: "Disabled", description: "Prevent user interaction", ui: { alignment: "between" } },
          { type: "switch", name: "readOnly", label: "Read Only", description: "Display value but prevent editing", ui: { alignment: "between" } },
        ],
      },
      {
        label: "Validation",
        fields: [
          { type: "switch", name: "required", label: "Required", description: "User must check this box", ui: { alignment: "between" } },
        ],
      },
    ],
  },
];
