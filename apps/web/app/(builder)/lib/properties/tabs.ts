import type { Field } from "@buildnbuzz/buzzform";

export const tabsFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: {
      variant: "line",
      spacing: "lg",
    },
    tabs: [
      {
        label: "Tabs",
        fields: [
          {
            type: "array",
            name: "tabs",
            label: "Tabs",
            minRows: 1,
            ui: {
              isSortable: true,
              addLabel: "Add Tab",
              rowLabelField: "label",
            },
            fields: [
              {
                type: "text",
                name: "name",
                label: "Name",
                description: "Used as nested object key in form data",
                required: true,
                placeholder: "account",
                pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
                validate: (value, context) => {
                  const key = typeof value === "string" ? value.trim() : "";
                  if (!key) return "Tab name is required";

                  const tabs = Array.isArray((context.data as { tabs?: unknown[] }).tabs)
                    ? (context.data as { tabs: Array<{ name?: string }> }).tabs
                    : [];

                  const count = tabs.filter((tab) => tab?.name?.trim?.() === key).length;
                  if (count > 1) return "Tab name must be unique";

                  return true;
                },
              },
              {
                type: "text",
                name: "label",
                label: "Label",
                description: "Visible title in the tabs bar",
                required: true,
                placeholder: "Account",
              },
              {
                type: "textarea",
                name: "description",
                label: "Description",
                description: "Optional help text shown above tab fields",
                rows: 2,
              },
              {
                type: "switch",
                name: "disabled",
                label: "Disabled",
                description: "Disable this tab in preview/runtime (still editable in builder)",
                ui: { alignment: "between" },
              },
            ],
          },
          {
            type: "select",
            name: "ui.defaultTab",
            label: "Default Tab",
            description: "Tab selected by default when the form loads",
            options: async (context) => {
              const tabs = Array.isArray((context.data as { tabs?: unknown[] }).tabs)
                ? (context.data as {
                    tabs: Array<{
                      name?: string;
                      label?: string;
                      disabled?: boolean;
                    }>;
                  }).tabs
                : [];

              return tabs
                .filter(
                  (tab) =>
                    typeof tab?.name === "string" &&
                    tab.name.trim().length > 0 &&
                    tab.disabled !== true,
                )
                .map((tab, index) => ({
                  label:
                    typeof tab.label === "string" && tab.label.trim().length > 0
                      ? tab.label
                      : `Tab ${index + 1}`,
                  value: tab.name as string,
                }));
            },
            dependencies: ["tabs"],
          },
        ],
      },
      {
        label: "Style",
        fields: [
          {
            type: "select",
            name: "ui.variant",
            label: "Variant",
            description: "Visual style of tab navigation",
            options: [
              { label: "Default", value: "default" },
              { label: "Line", value: "line" },
            ],
          },
          {
            type: "select",
            name: "ui.spacing",
            label: "Spacing",
            description: "Space between fields inside each tab",
            options: [
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ],
          },
          {
            type: "switch",
            name: "ui.showErrorBadge",
            label: "Show Error Badge",
            description: "Display error count on each tab trigger",
            ui: { alignment: "between" },
          },
        ],
      },
    ],
  },
];
