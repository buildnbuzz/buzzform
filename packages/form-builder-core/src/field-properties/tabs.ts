import type { Field } from "@buildnbuzz/form-core";

/** Property editor config for `tabs` fields. */
export const tabsFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          { type: "switch", name: "hidden", label: "Hidden", description: "Hide these tabs from the form", ui: { alignment: "between" } },
        ],
      },
    ],
  },
];
