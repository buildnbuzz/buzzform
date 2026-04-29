import type { Field } from "@buildnbuzz/form-core";

/**
 * Property editor schema for Tabs layout containers.
 */
export const tabsFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          {
            type: "select",
            name: "ui.variant",
            label: "Variant",
            options: [
              { label: "Line", value: "line" },
              { label: "Pills", value: "pills" },
              { label: "Solid", value: "solid" },
            ],
            defaultValue: "line",
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
      {
        label: "Tabs",
        fields: [
          {
            type: "array",
            name: "tabs",
            label: "Tab Definitions",
            fields: [
              { type: "text", name: "label", label: "Label", placeholder: "Tab Label" },
              { type: "text", name: "name", label: "Internal Name", placeholder: "tab_name" },
              {
                type: "checkbox",
                name: "disabled",
                label: "Disabled",
                ui: { widget: "expression", alignment: "between" },
              },
            ],
          },
        ],
      },
    ],
  },
];
