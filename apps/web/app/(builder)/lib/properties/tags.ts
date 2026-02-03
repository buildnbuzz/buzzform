import type { Field } from "@buildnbuzz/buzzform";

export const tagsFieldProperties: Field[] = [
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
                        placeholder: "Tags",
                    },
                    {
                        type: "text",
                        name: "placeholder",
                        label: "Placeholder",
                        description: "Placeholder text inside the field",
                        placeholder: "Add tags...",
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
                        description: "User must add at least one tag",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "number",
                        name: "minTags",
                        label: "Min Tags",
                        description: "Minimum number of tags required",
                        min: 0,
                    },
                    {
                        type: "number",
                        name: "maxTags",
                        label: "Max Tags",
                        description: "Maximum number of tags allowed",
                        min: 1,
                    },
                    {
                        type: "number",
                        name: "maxTagLength",
                        label: "Max Tag Length",
                        description: "Maximum characters per tag",
                        min: 1,
                    },
                    {
                        type: "switch",
                        name: "allowDuplicates",
                        label: "Allow Duplicates",
                        description: "Allow duplicate tag values",
                        ui: { alignment: "between" },
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
                        description: "Visual style variant",
                        options: [
                            { label: "Chips", value: "chips" },
                            { label: "Pills", value: "pills" },
                            { label: "Inline", value: "inline" },
                        ],
                    },
                    {
                        type: "switch",
                        name: "ui.copyable",
                        label: "Copyable",
                        description: "Display a button to copy all tags",
                        ui: { alignment: "between" },
                    },
                ],
            },
        ],
    },
];
