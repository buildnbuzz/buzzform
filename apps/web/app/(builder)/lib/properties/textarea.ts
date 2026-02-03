import type { Field } from "@buildnbuzz/buzzform";

export const textareaFieldProperties: Field[] = [
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
                        placeholder: "Message",
                    },
                    {
                        type: "text",
                        name: "placeholder",
                        label: "Placeholder",
                        description: "Placeholder text inside the field",
                        placeholder: "Enter your message...",
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
                        placeholder: "Enter default value",
                    },
                    {
                        type: "number",
                        name: "rows",
                        label: "Rows",
                        description: "Number of visible text rows",
                        min: 1,
                        defaultValue: 3,
                    },
                    {
                        type: "switch",
                        name: "autoResize",
                        label: "Auto Resize",
                        description: "Automatically adjust height based on content",
                        ui: { alignment: "between" },
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
