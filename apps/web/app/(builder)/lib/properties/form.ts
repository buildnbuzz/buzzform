import type { Field } from "@buildnbuzz/buzzform";

export const formSettingsProperties: Field[] = [
  {
    type: "select",
    name: "outputConfig.type",
    label: "Output Format",
    description: "How form data is structured when submitted.",
    options: [
      { label: "Nested JSON", value: "default" },
      { label: "Flat Paths", value: "path" },
    ],
    defaultValue: "default",
  },
  {
    type: "select",
    name: "outputConfig.delimiter",
    label: "Path Delimiter",
    description: "Separator between path segments (e.g. person.name).",
    condition: (data) =>
      (data as { outputConfig: { type: string } }).outputConfig?.type ===
      "path",
    options: [
      { label: ". (dot)", value: "." },
      { label: "_ (underscore)", value: "_" },
      { label: "- (dash)", value: "-" },
    ],
    defaultValue: ".",
  },
];
