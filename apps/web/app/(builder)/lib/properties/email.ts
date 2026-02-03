import type { Field } from "@buildnbuzz/buzzform";

export const emailFieldProperties: Field[] = [
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
                        description: "Display label shown above the field",
                        placeholder: "Email Address",
                    },
                    {
                        type: "text",
                        name: "placeholder",
                        label: "Placeholder",
                        description: "Placeholder text inside the field",
                        placeholder: "you@example.com",
                    },
                    {
                        type: "textarea",
                        name: "description",
                        label: "Description",
                        description: "Help text shown below the field",
                        rows: 2,
                    },
                    {
                        type: "text",
                        name: "defaultValue",
                        label: "Default Value",
                        description: "Initial value when the form loads",
                        placeholder: "Enter default email",
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
                        description: "User must fill this field",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "number",
                        name: "minLength",
                        label: "Min Length",
                        description: "Minimum number of characters",
                        min: 0,
                    },
                    {
                        type: "number",
                        name: "maxLength",
                        label: "Max Length",
                        description: "Maximum number of characters",
                        min: 1,
                    },
                    {
                        type: "text",
                        name: "pattern",
                        label: "Pattern",
                        description: "Regular expression to match against",
                        placeholder: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
                    },
                    {
                        type: "switch",
                        name: "trim",
                        label: "Trim",
                        description: "Remove leading/trailing spaces on blur",
                        ui: { alignment: "between" },
                    },
                ],
            },
            {
                label: "Style",
                fields: [
                    {
                        type: "switch",
                        name: "ui.copyable",
                        label: "Copyable",
                        description: "Display a button to copy the value",
                        ui: { alignment: "between" },
                    },
                ],
            },
        ],
    },
];
