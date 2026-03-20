import { describe, it, expect } from "vitest";
import type { Field } from "../types";
import {
  extractDependencies,
  extractDependenciesFromFields,
} from "./dependencies";

const field: Field = {
  type: "text",
  name: "title",
  condition: { $data: "/flags/enabled", eq: true },
  hidden: [{ $data: "/flags/hide", eq: true }],
  validate: {
    onChange: {
      checks: [
        {
          type: "minLength",
          message: "Too short",
          args: { min: { $data: "/rules/minTitle" } },
        },
      ],
    },
  },
};

describe("extractDependencies", () => {
  it("collects $data paths from conditions and validators", () => {
    expect(Array.from(extractDependencies(field))).toEqual([
      "/flags/enabled",
      "/flags/hide",
      "/rules/minTitle",
    ]);
  });

  it("collects dependencies across nested fields", () => {
    const fields: Field[] = [
      field,
      {
        type: "group",
        name: "profile",
        fields: [
          {
            type: "text",
            name: "name",
            defaultValue: { $data: "/user/name" },
          },
        ],
      },
    ];

    expect(Array.from(extractDependenciesFromFields(fields))).toEqual([
      "/flags/enabled",
      "/flags/hide",
      "/rules/minTitle",
      "/user/name",
    ]);
  });
});
