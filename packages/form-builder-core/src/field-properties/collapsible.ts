import type { Field } from "@buildnbuzz/form-core";

/** Property editor config for `collapsible` fields. */
export const collapsibleFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          { type: "text", name: "label", label: "Label", description: "Collapsible section header text", required: true },
          { type: "switch", name: "collapsed", label: "Start Collapsed", description: "Section is collapsed by default", ui: { alignment: "between" } },
          { type: "switch", name: "hidden", label: "Hidden", description: "Hide this section from the form", ui: { alignment: "between" } },
        ],
      },
    ],
  },
];
