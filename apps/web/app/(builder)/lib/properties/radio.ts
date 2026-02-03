import type { Field } from "@buildnbuzz/buzzform";

export const radioFieldProperties: Field[] = [
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
                        placeholder: "Choose One",
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
                        minRows: 2,
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
                        description: "User must select an option",
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
                            { label: "Default", value: "default" },
                            { label: "Card", value: "card" },
                        ],
                    },
                    {
                        type: "select",
                        name: "ui.direction",
                        label: "Direction",
                        description: "Layout direction (for default variant)",
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
                        ui: { alignment: "between" },
                    },
                ],
            },
        ],
    },
];
