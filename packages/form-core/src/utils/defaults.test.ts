import { describe, it, expect } from "vitest";
import type { Field, ExprContext, UnknownData } from "../types";
import { extractDefaults } from "./defaults";

const baseFields: Field[] = [
  { type: "text", name: "title" },
  { type: "number", name: "age" },
  { type: "checkbox", name: "active" },
  { type: "select", name: "status", options: [] },
];

describe("extractDefaults", () => {
  it("returns zero-values when no explicit defaultValue is set", () => {
    expect(extractDefaults(baseFields)).toEqual({
      title: "",
      age: 0,
      active: false,
      status: "",
    });
  });

  it("uses explicit defaultValue when set", () => {
    const fields: Field[] = [
      { type: "text", name: "country", defaultValue: "US" },
      { type: "number", name: "quantity", defaultValue: 3 },
      { type: "checkbox", name: "active", defaultValue: true },
    ];

    expect(extractDefaults(fields)).toEqual({
      country: "US",
      quantity: 3,
      active: true,
    });
  });

  it("handles nested groups", () => {
    const fields: Field[] = [
      {
        type: "group",
        name: "profile",
        fields: [
          { type: "text", name: "first" },
          { type: "text", name: "last", defaultValue: "Doe" },
        ],
      },
    ];

    expect(extractDefaults(fields)).toEqual({
      profile: { first: "", last: "Doe" },
    });
  });

  it("handles array fields", () => {
    const fields: Field[] = [
      {
        type: "array",
        name: "emails",
        fields: [{ type: "text", name: "email" }],
      },
    ];

    expect(extractDefaults(fields)).toEqual({
      emails: [],
    });
  });

  it("uses static defaultValue for arrays", () => {
    const fields: Field[] = [
      {
        type: "array",
        name: "emails",
        fields: [{ type: "text", name: "email" }],
        defaultValue: ["admin@example.com"],
      },
    ];

    expect(extractDefaults(fields)).toEqual({
      emails: ["admin@example.com"],
    });
  });

  it("resolves dynamic defaultValue references via Expr", () => {
    const fields: Field[] = [
      {
        type: "text",
        name: "greeting",
        defaultValue: { $data: "/other" },
      },
      {
        type: "text",
        name: "other",
        defaultValue: "world",
      },
    ];

    expect(extractDefaults(fields)).toEqual({
      greeting: "",
      other: "world",
    });

    const fieldsCorrectOrder: Field[] = [
      {
        type: "text",
        name: "other",
        defaultValue: "world",
      },
      {
        type: "text",
        name: "greeting",
        defaultValue: { $data: "/other" },
      },
    ];

    expect(extractDefaults(fieldsCorrectOrder)).toEqual({
      other: "world",
      greeting: "world",
    });
  });

  it("resolves $context and $text expressions", () => {
    const fields: Field[] = [
      {
        type: "text",
        name: "user",
        defaultValue: { $context: "/user/name" },
      },
      {
        type: "text",
        name: "msg",
        defaultValue: { $text: "Hello ${/user}" },
      },
    ];

    const context = { user: { name: "Alice" } };
    expect(extractDefaults(fields, context)).toEqual({
      user: "Alice",
      msg: "Hello Alice",
    });
  });

  it("resolves $fn expressions", () => {
    const fields: Field[] = [
      {
        type: "number",
        name: "val",
        defaultValue: { $fn: "double", args: { num: 21 } },
      },
    ];

    const fns = {
      double: (ctx: ExprContext & { args?: Record<string, unknown> }) =>
        (ctx.args?.num as number) * 2,
    };

    expect(extractDefaults(fields, {}, fns)).toEqual({
      val: 42,
    });
  });

  it("resolves inline functions", () => {
    const fields: Field[] = [
      {
        type: "text",
        name: "test",
        defaultValue: (ctx: ExprContext) => `Hi ${ctx.context?.role}`,
      },
    ];

    expect(extractDefaults(fields, { role: "Admin" })).toEqual({
      test: "Hi Admin",
    });
  });

  it("handles $when branching", () => {
    const fields: Field[] = [
      {
        type: "text",
        name: "mode",
        defaultValue: "advanced",
      },
      {
        type: "text",
        name: "config",
        defaultValue: {
          $when: { $data: "/mode", eq: "advanced" },
          $then: "FULL",
          $else: "BASIC",
        },
      },
    ];

    expect(extractDefaults(fields)).toEqual({
      mode: "advanced",
      config: "FULL",
    });
  });

  it("supports tri-state checkbox defaults", () => {
    const fields: Field[] = [
      { type: "checkbox", name: "normal" },
      { type: "checkbox", name: "tri", tristate: true },
      {
        type: "checkbox",
        name: "triFixed",
        tristate: true,
        defaultValue: false,
      },
    ];

    expect(extractDefaults(fields)).toEqual({
      normal: false,
      tri: null,
      triFixed: false,
    });
  });

  it("resolves $fn and complex logic in defaultValue", () => {
    const fields: Field[] = [
      {
        type: "checkbox",
        name: "flag",
        defaultValue: true,
      },
      {
        type: "text",
        name: "status",
        defaultValue: {
          $when: { $and: [{ $data: "/flag" }, { $context: "/ready" }] },
          $then: { $fn: "greet", args: { name: "User" } },
          $else: "OFFLINE",
        },
      },
    ];

    const context = { ready: true };
    const fns = {
      greet: (ctx: ExprContext & { args?: UnknownData }) => `Hello ${ctx.args?.name}`,
    };

    expect(extractDefaults(fields, context, fns)).toEqual({
      flag: true,
      status: "Hello User",
    });
  });
});
