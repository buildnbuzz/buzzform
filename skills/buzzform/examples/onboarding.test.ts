import { describe, expect, it } from "vitest";
import {
  collectFieldValidationChecks,
  evaluateVisibility,
  extractDefaults,
  validateSchema,
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
    // Tabs don't nest data; all fields are at root level.
    type Data = OnboardingData;

    // Compile-time assertion: required fields produce required keys.
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

    // Optional fields should be accepted without value.
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

    // Text fields default to ""
    expect(defaults.firstName).toBe("");
    expect(defaults.lastName).toBe("");

    // Switch with explicit defaultValue
    expect(defaults.isManager).toBe(false);
    expect(defaults.notifications).toBe(true);

    // Tristate checkbox defaults to null
    expect(defaults.ndaSigned).toBeNull();

    // Number defaults to 0
    expect(defaults.salary).toBe(0);

    // Array defaults to []
    expect(defaults.directReports).toEqual([]);

    // Nested group defaults
    expect(defaults.address).toEqual({
      street: "",
      city: "",
      state: "",
      zip: "",
    });

    // Select defaults to ""
    expect(defaults.department).toBe("");

    // Select with hasMany — defaults to ""
    // (extractDefaults uses ZERO_VALUES["select"] = "")
    expect(defaults.interests).toBe("");
  });
});

// ---------------------------------------------------------------------------
// 4. Conditions ($data) — work location drives field visibility
// ---------------------------------------------------------------------------

describe("onboarding schema — $data conditions", () => {
  it("officeFloor is visible when workLocation is 'office'", () => {
    const officeFloor = findDataField("officeFloor");
    expect(officeFloor).toBeDefined();

    const ctx = { formData: { workLocation: "office" } };
    expect(evaluateVisibility(officeFloor!.condition, ctx)).toBe(true);
  });

  it("officeFloor is hidden when workLocation is 'remote'", () => {
    const officeFloor = findDataField("officeFloor");
    const ctx = { formData: { workLocation: "remote" } };
    expect(evaluateVisibility(officeFloor!.condition, ctx)).toBe(false);
  });

  it("timezone is visible for remote and hybrid", () => {
    const timezone = findDataField("timezone");
    expect(timezone).toBeDefined();

    expect(
      evaluateVisibility(timezone!.condition, {
        formData: { workLocation: "remote" },
      }),
    ).toBe(true);
    expect(
      evaluateVisibility(timezone!.condition, {
        formData: { workLocation: "hybrid" },
      }),
    ).toBe(true);
    expect(
      evaluateVisibility(timezone!.condition, {
        formData: { workLocation: "office" },
      }),
    ).toBe(false);
  });

  it("isManager switch drives directReports array visibility", () => {
    const directReports = findDataField("directReports");
    expect(directReports).toBeDefined();

    expect(
      evaluateVisibility(directReports!.condition, {
        formData: { isManager: true },
      }),
    ).toBe(true);
    expect(
      evaluateVisibility(directReports!.condition, {
        formData: { isManager: false },
      }),
    ).toBe(false);
  });

  it("teamSize is visible only when isManager is true", () => {
    const teamSize = findDataField("teamSize");
    expect(teamSize).toBeDefined();

    expect(
      evaluateVisibility(teamSize!.condition, {
        formData: { isManager: true },
      }),
    ).toBe(true);
    expect(
      evaluateVisibility(teamSize!.condition, {
        formData: { isManager: false },
      }),
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. Conditions ($context) — role-based access
// ---------------------------------------------------------------------------

describe("onboarding schema — $context conditions", () => {
  it("salary is visible only for admin", () => {
    const salary = findDataField("salary");
    expect(salary).toBeDefined();

    expect(
      evaluateVisibility(salary!.condition, {
        formData: {},
        contextData: { userRole: "admin" },
      }),
    ).toBe(true);
    expect(
      evaluateVisibility(salary!.condition, {
        formData: {},
        contextData: { userRole: "employee" },
      }),
    ).toBe(false);
    expect(
      evaluateVisibility(salary!.condition, {
        formData: {},
        contextData: { userRole: "manager" },
      }),
    ).toBe(false);
  });

  it("permissions checkbox group is admin-only", () => {
    const permissions = findDataField("permissions");
    expect(permissions).toBeDefined();

    expect(
      evaluateVisibility(permissions!.condition, {
        formData: {},
        contextData: { userRole: "admin" },
      }),
    ).toBe(true);
    expect(
      evaluateVisibility(permissions!.condition, {
        formData: {},
        contextData: { userRole: "employee" },
      }),
    ).toBe(false);
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

  it("email derives email format check", () => {
    const field = findDataField("email");
    const checks = collectFieldValidationChecks(field!, "blur", {
      includeDerived: true,
    });
    expect(checks.some((c) => c.type === "email")).toBe(true);
  });

  it("password derives minLength and passwordCriteria", () => {
    const field = findDataField("password");
    const checks = collectFieldValidationChecks(field!, "blur", {
      includeDerived: true,
    });
    expect(checks.some((c) => c.type === "minLength")).toBe(true);
    expect(checks.some((c) => c.type === "passwordCriteria")).toBe(true);
  });

  it("officeFloor derives min and max checks", () => {
    const field = findDataField("officeFloor");
    const checks = collectFieldValidationChecks(field!, "blur", {
      includeDerived: true,
    });
    expect(checks.some((c) => c.type === "min")).toBe(true);
    expect(checks.some((c) => c.type === "max")).toBe(true);
  });

  it("dateOfBirth derives maxDate check", () => {
    const field = findDataField("dateOfBirth");
    const checks = collectFieldValidationChecks(field!, "blur", {
      includeDerived: true,
    });
    expect(checks.some((c) => c.type === "maxDate")).toBe(true);
  });

  it("skills derives minTags and maxTags", () => {
    const field = findDataField("skills");
    const checks = collectFieldValidationChecks(field!, "blur", {
      includeDerived: true,
    });
    expect(checks.some((c) => c.type === "minTags")).toBe(true);
    expect(checks.some((c) => c.type === "maxTags")).toBe(true);
  });

  it("bio derives maxLength check", () => {
    const field = findDataField("bio");
    const checks = collectFieldValidationChecks(field!, "blur", {
      includeDerived: true,
    });
    expect(checks.some((c) => c.type === "maxLength")).toBe(true);
  });

  it("directReports derives minItems and maxItems", () => {
    const field = findDataField("directReports");
    const checks = collectFieldValidationChecks(field!, "blur", {
      includeDerived: true,
    });
    expect(checks.some((c) => c.type === "minItems")).toBe(true);
    expect(checks.some((c) => c.type === "maxItems")).toBe(true);
  });

  it("zip derives pattern check", () => {
    const field = findDataField("zip");
    const checks = collectFieldValidationChecks(field!, "blur", {
      includeDerived: true,
    });
    expect(checks.some((c) => c.type === "pattern")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 7. Custom validator
// ---------------------------------------------------------------------------

describe("onboarding schema — custom validators", () => {
  it("companyEmail rejects non-company domains", () => {
    const result = onboardingValidators.companyEmail("user@gmail.com", {
      allowedDomains: ["acme.com", "acme.io"],
    });
    expect(result).toBe(false);
  });

  it("companyEmail accepts company domains", () => {
    const result = onboardingValidators.companyEmail("user@acme.com", {
      allowedDomains: ["acme.com", "acme.io"],
    });
    expect(result).toBe(true);
  });

  it("companyEmail passes when no domains configured", () => {
    const result = onboardingValidators.companyEmail("user@anything.com");
    expect(result).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 8. Form-level validation
// ---------------------------------------------------------------------------

describe("onboarding schema — form-level validation", () => {
  it("schema has form-level onSubmit validation", () => {
    expect(onboardingSchema.validate?.onSubmit?.checks).toHaveLength(1);
    expect(onboardingSchema.validate!.onSubmit!.checks[0]!.type).toBe(
      "contractorNoBenefits",
    );
  });
});

// ---------------------------------------------------------------------------
// 9. Field type coverage
// ---------------------------------------------------------------------------

describe("onboarding schema — field type coverage", () => {
  const allFieldTypes = new Set<string>();
  collectAllFieldTypes(onboardingSchema.fields, allFieldTypes);

  it.each([
    "text",
    "email",
    "password",
    "textarea",
    "number",
    "select",
    "date",
    "tags",
    "checkbox",
    "switch",
    "radio",
    "group",
    "array",
    "row",
    "tabs",
    "collapsible",
  ] as const)("includes %s field type", (fieldType) => {
    expect(allFieldTypes.has(fieldType)).toBe(true);
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

function collectAllFieldTypes(
  fields: readonly Field[],
  types: Set<string>,
): void {
  for (const field of fields) {
    types.add(field.type);
    if ("fields" in field) collectAllFieldTypes(field.fields, types);
    if (field.type === "tabs") {
      for (const tab of field.tabs) {
        collectAllFieldTypes(tab.fields, types);
      }
    }
  }
}
