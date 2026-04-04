import type { Field } from "@buildnbuzz/form-core";

/** Property editor config for `row` fields. */
export const rowFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          { type: "text", name: "label", label: "Label", description: "Display label for the row" },
          { type: "switch", name: "hidden", label: "Hidden", description: "Hide this row from the form", ui: { alignment: "between" } },
        ],
      },
    ],
  },
];
