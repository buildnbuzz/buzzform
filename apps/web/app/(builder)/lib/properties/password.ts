import type { Field } from "@buildnbuzz/buzzform";

export const passwordFieldProperties: Field[] = [
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
                        placeholder: "Password",
                    },
                    {
                        type: "text",
                        name: "placeholder",
                        label: "Placeholder",
                        description: "Placeholder text inside the field",
                        placeholder: "Enter your password",
                    },
                    {
                        type: "textarea",
                        name: "description",
                        label: "Description",
                        description: "Help text shown below the field",
                        rows: 2,
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
                        description: "Minimum number of characters (default: 8)",
                        min: 1,
                        defaultValue: 8,
                    },
                    {
                        type: "number",
                        name: "maxLength",
                        label: "Max Length",
                        description: "Maximum number of characters",
                        min: 1,
                    },
                    {
                        type: "switch",
                        name: "criteria.requireUppercase",
                        label: "Require Uppercase",
                        description: "Password must contain uppercase letters",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "criteria.requireLowercase",
                        label: "Require Lowercase",
                        description: "Password must contain lowercase letters",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "criteria.requireNumber",
                        label: "Require Number",
                        description: "Password must contain numbers",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "criteria.requireSpecial",
                        label: "Require Special Character",
                        description: "Password must contain special characters",
                        ui: { alignment: "between" },
                    },
                ],
            },
            {
                label: "Style",
                fields: [
                    {
                        type: "switch",
                        name: "ui.strengthIndicator",
                        label: "Strength Indicator",
                        description: "Show password strength meter",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "ui.showRequirements",
                        label: "Show Requirements",
                        description: "Display requirements checklist",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "ui.allowGenerate",
                        label: "Allow Generate",
                        description: "Show password generation button",
                        ui: { alignment: "between" },
                    },
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
