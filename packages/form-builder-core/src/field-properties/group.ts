import type { Field } from "@buildnbuzz/form-core";

/** Property editor config for `group` fields. */
export const groupFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          { type: "text", name: "name", label: "Name", description: "Used as the key in form data (no spaces)", required: true },
          { type: "text", name: "label", label: "Label", description: "Display label shown above the group" },
          { type: "textarea", name: "description", label: "Description", description: "Help text shown below the group"},
          { type: "switch", name: "hidden", label: "Hidden", description: "Hide this group from the form", ui: { alignment: "between" } },
          { type: "switch", name: "disabled", label: "Disabled", description: "Prevent interaction with child fields", ui: { alignment: "between" } },
          { type: "switch", name: "readOnly", label: "Read Only", description: "Display child values but prevent editing", ui: { alignment: "between" } },
        ],
      },
      {
        label: "Validation",
        fields: [
          { type: "switch", name: "required", label: "Required", description: "All required child fields must be filled", ui: { alignment: "between" } },
        ],
      },
    ],
  },
];
