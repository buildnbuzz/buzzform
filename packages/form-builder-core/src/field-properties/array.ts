import type { Field } from "@buildnbuzz/form-core";

/** Property editor config for `array` fields. */
export const arrayFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          { type: "text", name: "name", label: "Name", description: "Used as the key in form data (no spaces)", required: true },
          { type: "text", name: "label", label: "Label", description: "Display label shown above the array" },
          { type: "textarea", name: "description", label: "Description", description: "Help text shown below the array"},
          { type: "switch", name: "hidden", label: "Hidden", description: "Hide this array from the form", ui: { alignment: "between" } },
          { type: "switch", name: "disabled", label: "Disabled", description: "Prevent adding/removing items", ui: { alignment: "between" } },
          { type: "switch", name: "readOnly", label: "Read Only", description: "Display items but prevent editing", ui: { alignment: "between" } },
        ],
      },
      {
        label: "Validation",
        fields: [
          { type: "switch", name: "required", label: "Required", description: "At least one item must exist", ui: { alignment: "between" } },
          { type: "number", name: "minItems", label: "Min Items", description: "Minimum number of items", min: 0 },
          { type: "number", name: "maxItems", label: "Max Items", description: "Maximum number of items", min: 1 },
        ],
      },
    ],
  },
];
