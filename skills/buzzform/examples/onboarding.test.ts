import { describe, expect, it } from "vitest";
import {
  collectFieldValidationChecks,
  resolveExpr,
  extractDefaults,
  type InferType,
} from "@buildnbuzz/form-core";
import {
  onboardingSchema,
  onboardingValidators,
  type OnboardingContext,
  type OnboardingData,
} from "./onboarding";

// ---------------------------------------------------------------------------
// 1. Schema structure
// ---------------------------------------------------------------------------

describe("onboarding schema — structure", () => {
  it("has a title and description", () => {
    expect(onboardingSchema.title).toBe("Employee Onboarding");
    expect(onboardingSchema.description).toBeDefined();
  });

  it("root field is a tabs layout", () => {
    expect(onboardingSchema.fields).toHaveLength(1);
    expect(onboardingSchema.fields[0]!.type).toBe("tabs");
  });

  it("has three tabs", () => {
    const tabs = onboardingSchema.fields[0]!;
    if (tabs.type !== "tabs") throw new Error("Expected tabs");
    expect(tabs.tabs).toHaveLength(3);
    expect(tabs.tabs.map((t) => t.label)).toEqual([
      "Personal",
      "Work",
      "Team & Preferences",
    ]);
  });
});

// ---------------------------------------------------------------------------
// 2. Type inference
// ---------------------------------------------------------------------------

describe("onboarding schema — type inference", () => {
  it("infers a flat shape (tabs are layout-only)", () => {
    type Data = OnboardingData;

    const _check: Data = {
      firstName: "Jane",
      lastName: "Doe",
      email: "jane@example.com",
      password: "Test1234",
      confirmPassword: "Test1234",
      department: "engineering",
      roleType: "fulltime",
      workLocation: "remote",
      startDate: "2026-01-15",
    };

    const _partial: Partial<Data> = {};
    expect(_check.firstName).toBe("Jane");
    expect(_partial).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// 3. Default values
// ---------------------------------------------------------------------------

describe("onboarding schema — defaults", () => {
  it("extracts correct default values", () => {
    const defaults = extractDefaults(onboardingSchema.fields);

    expect(defaults.firstName).toBe("");
    expect(defaults.isManager).toBe(false);
    expect(defaults.ndaSigned).toBeNull();
    expect(defaults.salary).toBe(0);
    expect(defaults.directReports).toEqual([]);
    expect(defaults.address).toEqual({
      street: "",
      city: "",
      state: "",
      zip: "",
    });
  });
});

// ---------------------------------------------------------------------------
// 4. Conditions ($data) — work location drives field visibility
// ---------------------------------------------------------------------------

describe("onboarding schema — $data conditions", () => {
  it("officeFloor is visible when workLocation is 'office'", () => {
    const officeFloor = findDataField("officeFloor");
    const ctx = { data: { workLocation: "office" } };
    expect(resolveExpr(officeFloor!.condition, ctx)).toBe(true);
  });

  it("officeFloor is hidden when workLocation is 'remote'", () => {
    const officeFloor = findDataField("officeFloor");
    const ctx = { data: { workLocation: "remote" } };
    expect(resolveExpr(officeFloor!.condition, ctx)).toBe(false);
  });

  it("timezone is visible for remote and hybrid", () => {
    const timezone = findDataField("timezone");
    expect(resolveExpr(timezone!.condition, { data: { workLocation: "remote" } })).toBe(true);
    expect(resolveExpr(timezone!.condition, { data: { workLocation: "hybrid" } })).toBe(true);
    expect(resolveExpr(timezone!.condition, { data: { workLocation: "office" } })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. Conditions ($context) — role-based access
// ---------------------------------------------------------------------------

describe("onboarding schema — $context conditions", () => {
  it("salary is visible only for admin", () => {
    const salary = findDataField("salary");
    expect(resolveExpr(salary!.condition, { data: {}, context: { userRole: "admin" } })).toBe(true);
    expect(resolveExpr(salary!.condition, { data: {}, context: { userRole: "employee" } })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. Derived validation checks
// ---------------------------------------------------------------------------

describe("onboarding schema — derived validation", () => {
  it("firstName derives a required check", () => {
    const field = findDataField("firstName");
    const checks = collectFieldValidationChecks(field!, "blur", {
      includeDerived: true,
    });
    expect(checks.some((c) => c.type === "required")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import type { DataField, Field } from "@buildnbuzz/form-core";

function findDataField(name: string): DataField | undefined {
  function search(fields: readonly Field[]): DataField | undefined {
    for (const field of fields) {
      if ("name" in field && field.name === name) return field as DataField;
      if ("fields" in field) {
        const found = search(field.fields);
        if (found) return found;
      }
      if (field.type === "tabs") {
        for (const tab of field.tabs) {
          const found = search(tab.fields);
          if (found) return found;
        }
      }
    }
    return undefined;
  }
  return search(onboardingSchema.fields);
}
