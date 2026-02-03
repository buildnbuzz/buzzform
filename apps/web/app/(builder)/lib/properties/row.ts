import type { Field } from "@buildnbuzz/buzzform";

export const rowFieldProperties: Field[] = [
    {
        type: "tabs",
        ui: {
            variant: "line",
            spacing: "lg",
        },
        tabs: [
            {
                label: "Layout",
                fields: [
                    {
                        type: "text",
                        name: "ui.gap",
                        label: "Gap",
                        description: "Space between fields (e.g., 4, '1rem', '16px')",
                        placeholder: "4",
                    },
                    {
                        type: "select",
                        name: "ui.align",
                        label: "Vertical Alignment",
                        description: "How fields align vertically",
                        options: [
                            { label: "Start", value: "start" },
                            { label: "Center", value: "center" },
                            { label: "End", value: "end" },
                            { label: "Stretch", value: "stretch" },
                        ],
                    },
                    {
                        type: "select",
                        name: "ui.justify",
                        label: "Horizontal Distribution",
                        description: "How fields are distributed horizontally",
                        options: [
                            { label: "Start", value: "start" },
                            { label: "Center", value: "center" },
                            { label: "End", value: "end" },
                            { label: "Space Between", value: "between" },
                        ],
                    },
                    {
                        type: "switch",
                        name: "ui.wrap",
                        label: "Allow Wrapping",
                        description: "Allow fields to wrap to next line",
                        ui: { alignment: "between" },
                    },
                    {
                        type: "switch",
                        name: "ui.responsive",
                        label: "Responsive",
                        description: "Stack vertically on mobile devices",
                        ui: { alignment: "between" },
                        defaultValue: true,
                    },
                ],
            },
        ],
    },
];
