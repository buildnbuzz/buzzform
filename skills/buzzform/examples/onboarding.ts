/**
 * Employee Onboarding Schema — canonical example for the BuzzForm skill.
 *
 * Demonstrates: every field type, $data conditions, $context role-based access,
 * layout fields (tabs, row, collapsible), groups, arrays, validation (derived +
 * custom + form-level), default values, and dynamic props ($text, $when).
 *
 * Context shape:
 * ```ts
 * { userRole: "admin" | "manager" | "employee", companyDomains: string[] }
 * ```
 */
import {
  defineSchema,
  defineValidators,
  type InferType,
} from "@buildnbuzz/form-core";

// ---------------------------------------------------------------------------
// 1. Custom validators
// ---------------------------------------------------------------------------

export const onboardingValidators = defineValidators({
  companyEmail: (
    value: unknown,
    args?: { allowedDomains?: string[] },
  ) => {
    if (typeof value !== "string" || !value.includes("@")) return false;
    const domain = value.split("@")[1];
    if (!args?.allowedDomains?.length) return true;
    return args.allowedDomains.includes(domain!);
  },
});

// ---------------------------------------------------------------------------
// 2. Schema
// ---------------------------------------------------------------------------

export const onboardingSchema = defineSchema({
  title: "Employee Onboarding",
  description: "New hire onboarding form with role-based access control.",
  fields: [
    // ── Tab layout ──────────────────────────────────────────────────────
    {
      type: "tabs",
      tabs: [
        // ═══════════════════════════════════════════════════════════════
        // Tab 1: Personal Info
        // ═══════════════════════════════════════════════════════════════
        {
          label: "Personal",
          fields: [
            // Row: first + last name
            {
              type: "row",
              fields: [
                {
                  type: "text",
                  name: "firstName",
                  label: "First Name",
                  required: true,
                  trim: true,
                },
                {
                  type: "text",
                  name: "lastName",
                  label: "Last Name",
                  required: true,
                  trim: true,
                },
              ],
            },
            // Email — validated against company domains via $context
            {
              type: "email",
              name: "email",
              label: { $text: "Work Email for ${/firstName}" }, // $text interpolation
              required: true,
              validate: {
                onBlur: {
                  debounceMs: 300,
                  checks: [
                    {
                      type: "companyEmail",
                      args: {
                        allowedDomains: {
                          $context: "/companyDomains",
                        },
                      },
                      message:
                        "Please use an email from an approved company domain.",
                    },
                  ],
                },
              },
            },
            // Password + confirm
            {
              type: "password",
              name: "password",
              label: "Password",
              required: true,
              minLength: 8,
              criteria: {
                requireUppercase: true,
                requireNumber: true,
              },
            },
            {
              type: "password",
              name: "confirmPassword",
              label: "Confirm Password",
              required: true,
              validate: {
                onSubmit: {
                  checks: [
                    {
                      type: "matches",
                      args: { other: { $data: "/password" } },
                      message: "Passwords do not match.",
                    },
                  ],
                },
              },
            },
            // Date of birth
            {
              type: "date",
              name: "dateOfBirth",
              label: "Date of Birth",
              maxDate: "2008-01-01",
            },
            // Bio
            {
              type: "textarea",
              name: "bio",
              label: "Short Bio",
              maxLength: 500,
              placeholder: "Tell us about yourself...",
            },
          ],
        },

        // ═══════════════════════════════════════════════════════════════
        // Tab 2: Work Info (role-based access via $context)
        // ═══════════════════════════════════════════════════════════════
        {
          label: "Work",
          fields: [
            // Department — drives conditional fields via $data
            {
              type: "select",
              name: "department",
              label: "Department",
              required: true,
              options: [
                { label: "Engineering", value: "engineering" },
                { label: "Design", value: "design" },
                { label: "Marketing", value: "marketing" },
                { label: "Sales", value: "sales" },
                { label: "HR", value: "hr" },
              ],
            },
            // Role type — radio
            {
              type: "radio",
              name: "roleType",
              label: "Employment Type",
              required: true,
              options: [
                { label: "Full-Time", value: "fulltime" },
                { label: "Part-Time", value: "parttime" },
                { label: "Contractor", value: "contractor" },
              ],
            },
            // Work location — drives $data conditions
            {
              type: "radio",
              name: "workLocation",
              label: "Work Location",
              required: true,
              options: [
                { label: "Office", value: "office" },
                { label: "Remote", value: "remote" },
                { label: "Hybrid", value: "hybrid" },
              ],
            },
            // Conditionally visible: office floor (only if office/hybrid)
            {
              type: "number",
              name: "officeFloor",
              label: "Office Floor",
              min: 1,
              max: 50,
              condition: {
                $or: [
                  { $data: "/workLocation", eq: "office" },
                  { $data: "/workLocation", eq: "hybrid" },
                ],
              },
            },
            // Conditionally required: timezone (required when remote)
            {
              type: "text",
              name: "timezone",
              label: {
                $when: { $data: "/workLocation", eq: "remote" },
                $then: "Required Timezone",
                $else: "Optional Timezone",
              }, // $when branching
              placeholder: "e.g. America/New_York",
              required: { $data: "/workLocation", eq: "remote" },
              condition: {
                $or: [
                  { $data: "/workLocation", eq: "remote" },
                  { $data: "/workLocation", eq: "hybrid" },
                ],
              },
            },
            // Start date + time
            {
              type: "date",
              name: "startDate",
              label: "Start Date",
              required: true,
              withTime: true,
            },
            // Salary — admin-only via $context
            {
              type: "number",
              name: "salary",
              label: "Annual Salary",
              min: 0,
              condition: { $context: "/userRole", eq: "admin" },
            },
            // Tags: skills
            {
              type: "tags",
              name: "skills",
              label: "Skills",
              minTags: 1,
              maxTags: 10,
              maxTagLength: 30,
            },
          ],
        },

        // ═══════════════════════════════════════════════════════════════
        // Tab 3: Team & Preferences
        // ═══════════════════════════════════════════════════════════════
        {
          label: "Team & Preferences",
          fields: [
            // Manager toggle — drives direct reports array
            {
              type: "switch",
              name: "isManager",
              label: "Is a Manager",
              defaultValue: false,
            },
            // Team size — shown only for managers ($data)
            {
              type: "number",
              name: "teamSize",
              label: "Team Size",
              min: 1,
              max: 100,
              condition: { $data: "/isManager", eq: true },
            },
            // Direct reports array — shown only for managers ($data)
            {
              type: "array",
              name: "directReports",
              label: "Direct Reports",
              minItems: 1,
              maxItems: 20,
              condition: { $data: "/isManager", eq: true },
              fields: [
                {
                  type: "row",
                  fields: [
                    {
                      type: "text",
                      name: "name",
                      label: "Name",
                      required: true,
                    },
                    {
                      type: "email",
                      name: "email",
                      label: "Email",
                      required: true,
                    },
                  ],
                },
              ],
            },
            // Permissions — checkbox group (admin-only via $context)
            {
              type: "checkbox",
              name: "permissions",
              label: "Permissions",
              hasMany: true,
              options: ["Read", "Write", "Delete", "Admin"],
              condition: { $context: "/userRole", eq: "admin" },
            },
            // Tristate: NDA signed
            {
              type: "checkbox",
              name: "ndaSigned",
              label: "NDA Signed",
              tristate: true,
              defaultValue: null,
            },
            // Notifications switch
            {
              type: "switch",
              name: "notifications",
              label: "Enable Notifications",
              defaultValue: true,
            },

            // Collapsible: advanced preferences
            {
              type: "collapsible",
              label: "Advanced Preferences",
              collapsed: true,
              fields: [
                // Nested group for address
                {
                  type: "group",
                  name: "address",
                  label: "Mailing Address",
                  fields: [
                    {
                      type: "text",
                      name: "street",
                      label: "Street",
                    },
                    {
                      type: "row",
                      fields: [
                        {
                          type: "text",
                          name: "city",
                          label: "City",
                        },
                        {
                          type: "text",
                          name: "state",
                          label: "State",
                        },
                        {
                          type: "text",
                          name: "zip",
                          label: "ZIP Code",
                          pattern: "^[0-9]{5}(-[0-9]{4})?$",
                        },
                      ],
                    },
                  ],
                },
                // Multi-select interests
                {
                  type: "select",
                  name: "interests",
                  label: "Interests",
                  hasMany: true,
                  options: [
                    "Mentoring",
                    "Hackathons",
                    "Open Source",
                    "Volunteering",
                    "Sports",
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],

  // ── Form-level validation ──────────────────────────────────────────────
  validate: {
    onSubmit: {
      checks: [
        {
          type: "contractorNoBenefits",
          message:
            "Contractors cannot have permissions. Please remove permissions or change role type.",
        },
      ],
    },
  },
});

// ---------------------------------------------------------------------------
// 3. Inferred type
// ---------------------------------------------------------------------------

export type OnboardingData = InferType<typeof onboardingSchema.fields>;

// ---------------------------------------------------------------------------
// 4. Context type
// ---------------------------------------------------------------------------

export interface OnboardingContext {
  userRole: "admin" | "manager" | "employee";
  companyDomains: string[];
}
