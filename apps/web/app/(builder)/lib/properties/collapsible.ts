import type { Field } from "@buildnbuzz/buzzform";

export const collapsibleFieldProperties: Field[] = [
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
                        name: "label",
                        label: "Label",
                        description: "Display label for the collapsible section",
                        required: true,
                        placeholder: "Section Label",
                    },
                    {
                        type: "textarea",
                        name: "ui.description",
                        label: "Description",
                        description: "Help text shown in the header",
                        rows: 2,
                    },
                    {
                        type: "switch",
                        name: "collapsed",
                        label: "Start Collapsed",
                        description: "Start the section in collapsed state",
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
                            { label: "Card", value: "card" },
                            { label: "Flat", value: "flat" },
                            { label: "Ghost", value: "ghost" },
                            { label: "Bordered", value: "bordered" },
                        ],
                    },
                    {
                        type: "select",
                        name: "ui.spacing",
                        label: "Spacing",
                        description: "Space between fields in the section",
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
                        description: "Display error count badge in header",
                        ui: { alignment: "between" },
                    },
                ],
            },
        ],
    },
];
