import { describe, it, expect, vi } from "vitest";
import type { Field } from "../types";
import * as validation from "../validation";
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

  it("includes explicit dependencies property", () => {
    const explicitDepsField: Field = {
      type: "text",
      name: "dynamic_text",
      dependencies: ["/user/id", "/api/config"],
    };
    expect(Array.from(extractDependencies(explicitDepsField))).toEqual([
      "/user/id",
      "/api/config",
    ]);
  });

  it("includes dependencies from derived checks", () => {
    const deriveSpy = vi
      .spyOn(validation, "deriveFieldChecks")
      .mockReturnValue([
        {
          type: "minLength",
          message: "Too short",
          args: { min: { $data: "/rules/minFromDerived" } },
        },
      ]);

    const deps = Array.from(
      extractDependencies({
        type: "text",
        name: "title",
      }),
    );

    expect(deriveSpy).toHaveBeenCalledOnce();
    expect(deps).toEqual(["/rules/minFromDerived"]);

    deriveSpy.mockRestore();
  });
});
