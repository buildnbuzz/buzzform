import { describe, it, expect } from "vitest";
import type { FieldInput, CustomFieldInput } from "../types";
import { defineSchema, defineField, defineFields } from "../types";
import { walkFields } from "./walk";
import { extractDefaults } from "./defaults";
import { getVisibleFields } from "./visibility";
import { extractDependenciesFromFields, extractDependencies } from "./dependencies";
import {
  validateFields,
  validatePath,
} from "../validation";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const colorPicker: CustomFieldInput = {
  type: "color-picker",
  name: "theme",
  defaultValue: "#ff0000",
};

const rating: CustomFieldInput = {
  type: "rating",
  name: "score",
  required: true,
  defaultValue: 3,
};

const customFieldsFlat: FieldInput[] = [
  { type: "text", name: "title" },
  colorPicker,
  rating,
];

const customInsideGroup: FieldInput[] = [
  {
    type: "group",
    name: "settings",
    fields: [
      { type: "text", name: "label" },
      colorPicker,
    ],
  },
];

const customInsideRow: FieldInput[] = [
  {
    type: "row",
    fields: [
      { type: "text", name: "first" },
      { type: "color-picker", name: "accent" } as CustomFieldInput,
    ],
  },
];

const customInsideTabs: FieldInput[] = [
  {
    type: "tabs",
    tabs: [
      {
        label: "General",
        fields: [{ type: "text", name: "name" }],
      },
      {
        label: "Appearance",
        fields: [
          { type: "color-picker", name: "bg", defaultValue: "#000" } as CustomFieldInput,
        ],
      },
    ],
  },
];

const customInsideCollapsible: FieldInput[] = [
  {
    type: "collapsible",
    label: "Advanced",
    fields: [
      { type: "number", name: "timeout" },
      { type: "slider", name: "opacity", defaultValue: 0.8 } as CustomFieldInput,
    ],
  },
];

const customInsideArray: FieldInput[] = [
  {
    type: "array",
    name: "items",
    fields: [
      { type: "text", name: "label" },
      { type: "color-picker", name: "color" } as CustomFieldInput,
    ],
  },
];

// ---------------------------------------------------------------------------
// walkFields
// ---------------------------------------------------------------------------

describe("walkFields with custom fields", () => {
  it("visits custom fields as leaf nodes at top level", () => {
    const visited: string[] = [];
    walkFields(customFieldsFlat, (field) => {
      visited.push(`${field.type}:${"name" in field ? field.name : "-"}`);
    });
    expect(visited).toEqual([
      "text:title",
      "color-picker:theme",
      "rating:score",
    ]);
  });

  it("visits custom fields nested inside groups", () => {
    const visited: string[] = [];
    walkFields(customInsideGroup, (field, ctx) => {
      if ("name" in field && field.name) {
        visited.push(`${ctx.path}/${field.name}`);
      }
    });
    expect(visited).toEqual(["/settings", "/settings/label", "/settings/theme"]);
  });

  it("visits custom fields nested inside rows", () => {
    const visited: string[] = [];
    walkFields(customInsideRow, (field) => {
      if ("name" in field && field.name) visited.push(field.name as string);
    });
    expect(visited).toEqual(["first", "accent"]);
  });

  it("visits custom fields nested inside tabs", () => {
    const visited: string[] = [];
    walkFields(customInsideTabs, (field) => {
      if ("name" in field && field.name) visited.push(field.name as string);
    });
    expect(visited).toEqual(["name", "bg"]);
  });

  it("visits custom fields nested inside collapsibles", () => {
    const visited: string[] = [];
    walkFields(customInsideCollapsible, (field) => {
      if ("name" in field && field.name) visited.push(field.name as string);
    });
    expect(visited).toEqual(["timeout", "opacity"]);
  });

  it("visits custom fields nested inside arrays", () => {
    const visited: string[] = [];
    walkFields(customInsideArray, (field, ctx) => {
      if ("name" in field && field.name) {
        visited.push(`${ctx.path}/${field.name}`);
      }
    });
    expect(visited).toEqual(["/items", "/items/*/label", "/items/*/color"]);
  });
});

// ---------------------------------------------------------------------------
// extractDefaults
// ---------------------------------------------------------------------------

describe("extractDefaults with custom fields", () => {
  it("extracts defaultValue from custom fields at top level", () => {
    const result = extractDefaults(customFieldsFlat);
    expect(result).toEqual({
      title: "",
      theme: "#ff0000",
      score: 3,
    });
  });

  it("falls back to empty string for custom fields without defaultValue", () => {
    const fields: FieldInput[] = [
      { type: "color-picker", name: "color" } as CustomFieldInput,
    ];
    expect(extractDefaults(fields)).toEqual({ color: "" });
  });

  it("extracts defaults for custom fields inside groups", () => {
    const result = extractDefaults(customInsideGroup);
    expect(result).toEqual({
      settings: {
        label: "",
        theme: "#ff0000",
      },
    });
  });
});

// ---------------------------------------------------------------------------
// getVisibleFields
// ---------------------------------------------------------------------------

describe("getVisibleFields with custom fields", () => {
  it("preserves custom fields when condition is met", () => {
    const fields: FieldInput[] = [
      { type: "text", name: "title" },
      { type: "color-picker", name: "color", condition: true } as CustomFieldInput,
    ];
    const visible = getVisibleFields(fields, { data: {} });
    expect(visible).toHaveLength(2);
    expect(visible.map((f) => f.type)).toEqual(["text", "color-picker"]);
  });

  it("removes custom fields when condition is false", () => {
    const fields: FieldInput[] = [
      { type: "text", name: "title" },
      {
        type: "color-picker",
        name: "color",
        condition: { $data: "/show", eq: true },
      } as CustomFieldInput,
    ];
    const visible = getVisibleFields(fields, { data: { show: false } });
    expect(visible).toHaveLength(1);
    expect(visible[0]?.type).toBe("text");
  });

  it("handles custom fields nested inside containers", () => {
    const visible = getVisibleFields(customInsideRow, { data: {} });
    expect(visible).toHaveLength(1);
    // Row container still present; check children
    const row = visible[0] as unknown as { fields: FieldInput[] };
    expect(row.fields).toHaveLength(2);
    expect(row.fields.map((f: FieldInput) => f.type)).toEqual(["text", "color-picker"]);
  });
});

// ---------------------------------------------------------------------------
// extractDependencies
// ---------------------------------------------------------------------------

describe("extractDependencies with custom fields", () => {
  it("extracts $data deps from custom field properties", () => {
    const field: CustomFieldInput = {
      type: "color-picker",
      name: "color",
      condition: { $data: "/flags/showColor", eq: true },
      hidden: { $data: "/flags/hideColor", eq: true },
    };
    const deps = Array.from(extractDependencies(field));
    expect(deps).toContain("/flags/showColor");
    expect(deps).toContain("/flags/hideColor");
  });

  it("collects deps across nested custom fields", () => {
    const fields: FieldInput[] = [
      {
        type: "group",
        name: "theme",
        fields: [
          {
            type: "color-picker",
            name: "primary",
            condition: { $data: "/mode", eq: "custom" },
          } as CustomFieldInput,
        ],
      },
    ];
    const deps = Array.from(extractDependenciesFromFields(fields));
    expect(deps).toContain("/mode");
  });
});

// ---------------------------------------------------------------------------
// validateFields
// ---------------------------------------------------------------------------

describe("validateFields with custom fields", () => {
  it("skips validation for custom fields without validate config", async () => {
    const fields: FieldInput[] = [
      { type: "text", name: "title" },
      { type: "color-picker", name: "color" } as CustomFieldInput,
    ];
    const result = await validateFields(fields, { title: "", color: "#f00" });
    // No errors on the custom field — it has no validation
    expect(result.valid).toBe(true);
  });

  it("validates custom fields that define validate config", async () => {
    const fields: FieldInput[] = [
      {
        type: "color-picker",
        name: "color",
        required: true,
        validate: {
          onSubmit: {
            checks: [
              { type: "required", message: "Color is required." },
            ],
          },
        },
      } as CustomFieldInput,
    ];

    const resultEmpty = await validateFields(fields, { color: "" });
    expect(resultEmpty.valid).toBe(false);
    expect(resultEmpty.errorsByPath["/color"]).toBe("Color is required.");

    const resultOk = await validateFields(fields, { color: "#ff0000" });
    expect(resultOk.valid).toBe(true);
  });

  it("skips custom fields when condition is false", async () => {
    const fields: FieldInput[] = [
      {
        type: "color-picker",
        name: "color",
        condition: { $data: "/show", eq: true },
        validate: {
          onSubmit: {
            checks: [
              { type: "required", message: "Color is required." },
            ],
          },
        },
      } as CustomFieldInput,
    ];

    const result = await validateFields(fields, { color: "", show: false });
    expect(result.valid).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validatePath
// ---------------------------------------------------------------------------

describe("validatePath with custom fields", () => {
  it("validates a custom field by path", async () => {
    const fields: FieldInput[] = [
      {
        type: "color-picker",
        name: "color",
        validate: {
          onSubmit: {
            checks: [
              { type: "required", message: "Color is required." },
            ],
          },
        },
      } as CustomFieldInput,
    ];

    const result = await validatePath(fields, "/color", { color: "" });
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Color is required.");
  });
});

// ---------------------------------------------------------------------------
// defineSchema / defineField / defineFields with custom fields
// ---------------------------------------------------------------------------

describe("define helpers with custom fields", () => {
  it("defineSchema accepts custom fields at top level", () => {
    const schema = defineSchema({
      fields: [
        { type: "text", name: "email" },
        { type: "color-picker", name: "theme" },
      ],
    });
    expect(schema.fields).toHaveLength(2);
    expect(schema.fields[1]?.type).toBe("color-picker");
  });

  it("defineSchema accepts custom fields nested inside containers", () => {
    const schema = defineSchema({
      fields: [
        {
          type: "group",
          name: "settings",
          fields: [
            { type: "text", name: "label" },
            { type: "color-picker", name: "accent" },
          ],
        },
      ],
    });
    expect(schema.fields).toHaveLength(1);
  });

  it("defineField accepts a custom field", () => {
    const field = defineField({ type: "rating", name: "score", max: 5 });
    expect(field.type).toBe("rating");
  });

  it("defineFields accepts a mix of built-in and custom fields", () => {
    const fields = defineFields([
      { type: "text", name: "name" },
      { type: "color-picker", name: "color" },
    ]);
    expect(fields).toHaveLength(2);
  });
});
