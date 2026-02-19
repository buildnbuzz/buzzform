import type { Field } from "@buildnbuzz/buzzform";

type LayoutData = {
  ui?: {
    variant?: string;
    direction?: string;
  };
};

function getLayoutSettings(data: unknown) {
  const ui = (data as LayoutData).ui;
  return {
    variant: ui?.variant ?? "default",
    direction: ui?.direction ?? "vertical",
  };
}

function isCardVariant(data: unknown) {
  return getLayoutSettings(data).variant === "card";
}

function shouldShowColumns(data: unknown) {
  const { variant, direction } = getLayoutSettings(data);
  return variant === "card" || direction === "horizontal";
}

export const checkboxGroupFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: {
      variant: "line",
      spacing: "lg",
    },
    tabs: [
      {
        label: "General",
        fields: [
          {
            type: "text",
            name: "name",
            label: "Name",
            description: "Used as the key in form data (no spaces)",
            required: true,
            pattern: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
            placeholder: "fieldName",
          },
          {
            type: "text",
            name: "label",
            label: "Label",
            description: "Display label shown above the checkbox group",
            placeholder: "Select all that apply",
          },
          {
            type: "textarea",
            name: "description",
            label: "Description",
            description: "Help text shown below the field",
            rows: 2,
          },
          {
            type: "array",
            name: "options",
            label: "Options",
            minRows: 1,
            ui: {
              isSortable: true,
              addLabel: "Add Option",
              rowLabelField: "label",
            },
            fields: [
              {
                type: "text",
                name: "label",
                label: "Label",
                placeholder: "Option Label",
                required: true,
              },
              {
                type: "text",
                name: "value",
                label: "Value",
                placeholder: "option_value",
                required: true,
              },
              {
                type: "textarea",
                name: "description",
                label: "Description",
                placeholder: "Optional description for this option",
                rows: 2,
              },
            ],
          },
          {
            type: "select",
            name: "defaultValue",
            label: "Default Value",
            description: "Preselect one or more options",
            hasMany: true,
            options: async (context) =>
              Array.isArray(context?.data?.options) ? context.data.options : [],
            dependencies: ["options"],
          },
          {
            type: "switch",
            name: "hidden",
            label: "Hidden",
            description: "Hide this field from the form",
            ui: { alignment: "between" },
          },
          {
            type: "switch",
            name: "disabled",
            label: "Disabled",
            description: "Prevent user interaction",
            ui: { alignment: "between" },
          },
          {
            type: "switch",
            name: "readOnly",
            label: "Read Only",
            description: "Display value but prevent editing",
            ui: { alignment: "between" },
          },
        ],
      },
      {
        label: "Validation",
        fields: [
          {
            type: "switch",
            name: "required",
            label: "Required",
            description: "User must select at least one option",
            ui: { alignment: "between" },
          },
          {
            type: "number",
            name: "minSelected",
            label: "Min Selected",
            description: "Minimum number of options to select",
            min: 0,
          },
          {
            type: "number",
            name: "maxSelected",
            label: "Max Selected",
            description: "Maximum number of options to select",
            min: 1,
          },
        ],
      },
      {
        label: "Style",
        fields: [
          {
            type: "select",
            name: "style.width",
            label: "Width",
            description: "Field width (useful in rows)",
            options: [
              { label: "Auto", value: "auto" },
              { label: "10%", value: "10%" },
              { label: "20%", value: "20%" },
              { label: "25%", value: "25%" },
              { label: "30%", value: "30%" },
              { label: "33%", value: "33.33%" },
              { label: "40%", value: "40%" },
              { label: "50%", value: "50%" },
              { label: "60%", value: "60%" },
              { label: "66%", value: "66.66%" },
              { label: "70%", value: "70%" },
              { label: "75%", value: "75%" },
              { label: "80%", value: "80%" },
              { label: "90%", value: "90%" },
              { label: "100%", value: "100%" },
            ],
          },
          {
            type: "select",
            name: "ui.variant",
            label: "Variant",
            description: "Visual style variant",
            options: [
              { label: "Default", value: "default" },
              { label: "Card", value: "card" },
            ],
          },
          {
            type: "select",
            name: "ui.direction",
            label: "Direction",
            description: "Layout direction (for default variant)",
            condition: (data) => !isCardVariant(data),
            options: [
              { label: "Vertical", value: "vertical" },
              { label: "Horizontal", value: "horizontal" },
            ],
          },
          {
            type: "select",
            name: "ui.columns",
            label: "Columns",
            description: "Grid columns (responsive, 1 on mobile)",
            condition: shouldShowColumns,
            options: [
              { label: "1 Column", value: 1 },
              { label: "2 Columns", value: 2 },
              { label: "3 Columns", value: 3 },
              { label: "4 Columns", value: 4 },
            ],
          },
          {
            type: "select",
            name: "ui.card.size",
            label: "Card Size",
            description: "Size preset for card variant",
            condition: isCardVariant,
            options: [
              { label: "Small", value: "sm" },
              { label: "Medium", value: "md" },
              { label: "Large", value: "lg" },
            ],
          },
          {
            type: "switch",
            name: "ui.card.bordered",
            label: "Card Bordered",
            description: "Show border around cards",
            condition: isCardVariant,
            ui: { alignment: "between" },
          },
        ],
      },
    ],
  },
];
