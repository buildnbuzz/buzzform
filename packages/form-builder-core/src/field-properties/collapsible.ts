import type { Field } from "@buildnbuzz/form-core";

/**
 * Property editor schema for Collapsible containers.
 */
export const collapsibleFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          {
            type: "text",
            name: "label",
            label: "Header Label",
            placeholder: "Section Title",
          },
          {
            type: "checkbox",
            name: "collapsed",
            label: "Start Collapsed",
            ui: { alignment: "between" },
          },
          {
            type: "checkbox",
            name: "hidden",
            label: "Hidden",
            ui: { widget: "expression", alignment: "between" },
          },
          {
            type: "checkbox",
            name: "condition",
            label: "Condition",
            ui: { widget: "expression", alignment: "between" },
          },
        ],
      },
    ],
  },
];
