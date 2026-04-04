import type { Field } from "@buildnbuzz/form-core";

/** Property editor config for `password` fields. */
export const passwordFieldProperties: Field[] = [
  {
    type: "tabs",
    ui: { variant: "line", spacing: "lg" },
    tabs: [
      {
        label: "General",
        fields: [
          { type: "text", name: "name", label: "Name", description: "Used as the key in form data (no spaces)", required: true },
          { type: "text", name: "label", label: "Label", description: "Display label shown above the field" },
          { type: "text", name: "placeholder", label: "Placeholder", description: "Placeholder text inside the field" },
          { type: "textarea", name: "description", label: "Description", description: "Help text shown below the field"},
          { type: "switch", name: "hidden", label: "Hidden", description: "Hide this field from the form", ui: { alignment: "between" } },
          { type: "switch", name: "disabled", label: "Disabled", description: "Prevent user interaction", ui: { alignment: "between" } },
          { type: "switch", name: "readOnly", label: "Read Only", description: "Display value but prevent editing", ui: { alignment: "between" } },
        ],
      },
      {
        label: "Validation",
        fields: [
          { type: "switch", name: "required", label: "Required", description: "User must fill this field", ui: { alignment: "between" } },
          { type: "number", name: "minLength", label: "Min Length", description: "Minimum number of characters", min: 0 },
          { type: "number", name: "maxLength", label: "Max Length", description: "Maximum number of characters", min: 1 },
        ],
      },
      {
        label: "Strength",
        fields: [
          { type: "switch", name: "criteria.requireUppercase", label: "Require Uppercase", description: "At least one uppercase letter", ui: { alignment: "between" } },
          { type: "switch", name: "criteria.requireLowercase", label: "Require Lowercase", description: "At least one lowercase letter", ui: { alignment: "between" } },
          { type: "switch", name: "criteria.requireNumber", label: "Require Number", description: "At least one digit", ui: { alignment: "between" } },
          { type: "switch", name: "criteria.requireSpecial", label: "Require Special", description: "At least one special character", ui: { alignment: "between" } },
        ],
      },
    ],
  },
];
