import { describe, it, expect, vi, beforeEach } from "vitest";
import { parseImportedFormJson, fieldsToBuilderState } from "../import-export";
import { nodesToFields } from "../schema-builder";
import type { Field, TabsField, Tab } from "@buildnbuzz/form-core";

// ---------------------------------------------------------------------------
// Fixture: real-world legacy schema (raw array)
// ---------------------------------------------------------------------------

const LEGACY_RAW_ARRAY = [
  {
    type: "tabs",
    tabs: [
      {
        name: "profile",
        label: "Profile",
        description: "Manage your public profile information.",
        fields: [
          {
            type: "row",
            fields: [
              {
                type: "text",
                name: "displayName",
                label: "Display Name",
                placeholder: "John Doe",
                required: true,
                defaultValue: "John Doe",
              },
              {
                type: "text",
                name: "username",
                label: "Username",
                placeholder: "johndoe007",
                required: true,
                defaultValue: "johndoe007",
              },
            ],
          },
          {
            type: "email",
            name: "email",
            label: "Email",
            ui: { copyable: true },
            placeholder: "you@buildnbuzz.com",
            defaultValue: "jdoe@buildnbuzz.com",
            disabled: false,
            readOnly: true,
            required: true,
          },
          {
            type: "textarea",
            name: "bio",
            label: "Bio",
            rows: 3,
            placeholder: "Tell us about yourself...",
          },
        ],
      },
      {
        name: "notifications",
        label: "Notifications",
        description: "Configure how you receive notifications.",
        fields: [
          {
            type: "switch",
            name: "email",
            label: "Email Notifications",
            defaultValue: true,
            description: "Receive updates via email",
          },
          {
            type: "switch",
            name: "push",
            label: "Push Notifications",
            defaultValue: false,
            description: "Receive push notifications",
          },
          {
            type: "radio",
            name: "notificationFrequency",
            label: "Notification Frequency",
            defaultValue: "hourly",
            options: [
              { label: "Instant", value: "instant" },
              { label: "Hourly", value: "hourly" },
              { id: "mChdHj4cANZSXnchlQqJ_", label: "Daily", value: "daily" },
              {
                id: "Oz41euxUOWhewHgsbNfmB",
                label: "Weekly",
                value: "weekly",
              },
            ],
            ui: {
              card: { size: "sm", bordered: true },
              direction: "horizontal",
              variant: "card",
              columns: 4,
            },
          },
        ],
      },
      {
        name: "socials",
        label: "Socials",
        id: "5RsG334zxTv8jK6eSroii",
        disabled: false,
        fields: [
          {
            type: "array",
            name: "social",
            label: "Socials",
            ui: {
              addLabel: "Add Social",
              isSortable: true,
              rowLabelField: "link",
              emptyMessage: "No socials added yet",
            },
            maxRows: 3,
            minRows: 1,
            fields: [
              {
                type: "select",
                name: "select_Ur1x",
                label: "Select",
                options: [
                  { label: "X", value: "x" },
                  { label: "Instagram", value: "instagram" },
                  {
                    id: "N-vk1xnufePYbTMArMMtY",
                    label: "linkedin",
                    value: "LinkedIn",
                  },
                ],
                placeholder: "Choose an option",
              },
              {
                type: "text",
                name: "link",
                label: "Link",
                placeholder: "https://yoursocial.com/profile",
              },
            ],
          },
        ],
      },
      {
        name: "advanced",
        label: "Advanced",
        id: "D5ZENYMM3P5XVw054fCKf",
        disabled: true,
        fields: [
          {
            type: "text",
            name: "userId",
            label: "User ID",
            disabled: true,
            defaultValue: "9175f4ae-ff9d-45c4-ac0d-81ce67c577a7",
          },
        ],
      },
    ],
    ui: {
      defaultTab: "profile",
      variant: "line",
    },
  },
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

let idCounter = 0;

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => `node-${idCounter++}`),
}));

describe("E2E: Legacy schema import → builder state → export", () => {
  beforeEach(() => {
    idCounter = 0;
  });

  // -------------------------------------------------------------------------
  // 1. parseImportedFormJson accepts raw array
  // -------------------------------------------------------------------------
  describe("parseImportedFormJson (raw array input)", () => {
    it("accepts a raw field array and produces builder state", () => {
      const json = JSON.stringify(LEGACY_RAW_ARRAY);
      const result = parseImportedFormJson(json);

      expect(result.state.rootIds.length).toBe(1);
      expect(Object.keys(result.state.nodes).length).toBeGreaterThan(1);
      // No migration warnings since the schema has no legacy indicators
      // (no 'admin', 'component', 'datetime', etc.)
    });

    it("wraps raw array with a default form name", () => {
      const json = JSON.stringify(LEGACY_RAW_ARRAY);
      const result = parseImportedFormJson(json);

      expect(result.state.formName).toBe("Imported Form");
    });

    it("uses formNameHint when provided", () => {
      const json = JSON.stringify(LEGACY_RAW_ARRAY);
      const result = parseImportedFormJson(json, {
        formNameHint: "Account Settings",
      });

      expect(result.state.formName).toBe("Account Settings");
    });
  });

  // -------------------------------------------------------------------------
  // 2. fieldsToBuilderState: tab slot naming consistency
  // -------------------------------------------------------------------------
  describe("fieldsToBuilderState (tabs with name property)", () => {
    it("uses tab.name as slot keys when names are present", () => {
      const fields = LEGACY_RAW_ARRAY as unknown as Field[];
      const { nodes, rootIds } = fieldsToBuilderState(fields);

      const tabsNodeId = rootIds[0]!;
      const tabsNode = nodes[tabsNodeId]!;

      // With named tabs, slots should use tab names (via getTabSlotKeys)
      expect(tabsNode.children).toHaveProperty("profile");
      expect(tabsNode.children).toHaveProperty("notifications");
      expect(tabsNode.children).toHaveProperty("socials");
      expect(tabsNode.children).toHaveProperty("advanced");
    });

    it("strips fields from tab definitions in the node payload", () => {
      const fields = LEGACY_RAW_ARRAY as unknown as Field[];
      const { nodes, rootIds } = fieldsToBuilderState(fields);

      const tabsNode = nodes[rootIds[0]!]!;
      const tabDefs = (tabsNode.field as TabsField).tabs;

      for (const tab of tabDefs) {
        // Fields should be stripped from the tab payload in the node
        expect((tab as unknown as Record<string, unknown>).fields).toBeUndefined();
      }
    });

    it("preserves tab metadata (label, description, disabled)", () => {
      const fields = LEGACY_RAW_ARRAY as unknown as Field[];
      const { nodes, rootIds } = fieldsToBuilderState(fields);

      const tabsNode = nodes[rootIds[0]!]!;
      const tabDefs = (tabsNode.field as TabsField).tabs;

      const profileTab = tabDefs.find(
        (t) => t.name === "profile",
      ) as unknown as Record<string, unknown>;
      expect(profileTab).toBeDefined();
      expect(profileTab.label).toBe("Profile");
      expect(profileTab.description).toBe(
        "Manage your public profile information.",
      );

      const advancedTab = tabDefs.find(
        (t) => t.name === "advanced",
      ) as unknown as Record<string, unknown>;
      expect(advancedTab).toBeDefined();
      expect(advancedTab.disabled).toBe(true);
    });

    it("creates correct child count per tab slot", () => {
      const fields = LEGACY_RAW_ARRAY as unknown as Field[];
      const { nodes, rootIds } = fieldsToBuilderState(fields);

      const tabsNode = nodes[rootIds[0]!]!;

      // Profile: row, email, textarea = 3 children
      expect(tabsNode.children["profile"]).toHaveLength(3);
      // Notifications: 2 switches + 1 radio = 3 children
      expect(tabsNode.children["notifications"]).toHaveLength(3);
      // Socials: 1 array = 1 child
      expect(tabsNode.children["socials"]).toHaveLength(1);
      // Advanced: 1 text = 1 child
      expect(tabsNode.children["advanced"]).toHaveLength(1);
    });

    it("processes nested containers (row inside tab, array inside tab)", () => {
      const fields = LEGACY_RAW_ARRAY as unknown as Field[];
      const { nodes, rootIds } = fieldsToBuilderState(fields);

      const tabsNode = nodes[rootIds[0]!]!;

      // Row inside profile tab
      const rowId = tabsNode.children["profile"]![0]!;
      const rowNode = nodes[rowId]!;
      expect(rowNode.field.type).toBe("row");
      expect(rowNode.children["__default__"]).toHaveLength(2); // displayName, username

      // Array inside socials tab
      const arrayId = tabsNode.children["socials"]![0]!;
      const arrayNode = nodes[arrayId]!;
      expect(arrayNode.field.type).toBe("array");
      expect(arrayNode.children["__default__"]).toHaveLength(2); // select, text
    });
  });

  // -------------------------------------------------------------------------
  // 3. Round-trip: fieldsToBuilderState → nodesToFields
  // -------------------------------------------------------------------------
  describe("Round-trip: import → export produces valid FormSchema fields", () => {
    it("reconstructs tabs with fields from node tree", () => {
      const fields = LEGACY_RAW_ARRAY as unknown as Field[];
      const { nodes, rootIds } = fieldsToBuilderState(fields);
      const exported = nodesToFields(nodes, rootIds);

      expect(exported).toHaveLength(1);
      const tabsField = exported[0] as TabsField;
      expect(tabsField.type).toBe("tabs");
      expect(tabsField.tabs).toHaveLength(4);
    });

    it("reconstructs profile tab with nested row and leaf fields", () => {
      const fields = LEGACY_RAW_ARRAY as unknown as Field[];
      const { nodes, rootIds } = fieldsToBuilderState(fields);
      const exported = nodesToFields(nodes, rootIds);

      const tabsField = exported[0] as TabsField;
      const profileTab = tabsField.tabs.find(
        (t) => t.name === "profile",
      ) as Tab;
      expect(profileTab).toBeDefined();
      expect(profileTab.fields).toHaveLength(3);

      // First child is the row
      const row = profileTab.fields[0] as unknown as {
        type: string;
        fields: Field[];
      };
      expect(row.type).toBe("row");
      expect(row.fields).toHaveLength(2);
      expect(
        (row.fields[0] as unknown as Record<string, unknown>).name,
      ).toBe("displayName");
      expect(
        (row.fields[1] as unknown as Record<string, unknown>).name,
      ).toBe("username");

      // Email field
      const emailField = profileTab.fields[1] as unknown as Record<
        string,
        unknown
      >;
      expect(emailField.type).toBe("email");
      expect(emailField.name).toBe("email");
      expect(emailField.readOnly).toBe(true);
    });

    it("reconstructs socials tab with array and its nested fields", () => {
      const fields = LEGACY_RAW_ARRAY as unknown as Field[];
      const { nodes, rootIds } = fieldsToBuilderState(fields);
      const exported = nodesToFields(nodes, rootIds);

      const tabsField = exported[0] as TabsField;
      const socialsTab = tabsField.tabs.find(
        (t) => t.name === "socials",
      ) as Tab;
      expect(socialsTab).toBeDefined();
      expect(socialsTab.fields).toHaveLength(1);

      const arrayField = socialsTab.fields[0] as unknown as {
        type: string;
        name: string;
        fields: Field[];
      };
      expect(arrayField.type).toBe("array");
      expect(arrayField.name).toBe("social");
      expect(arrayField.fields).toHaveLength(2);
      expect(
        (arrayField.fields[0] as unknown as Record<string, unknown>).type,
      ).toBe("select");
      expect(
        (arrayField.fields[1] as unknown as Record<string, unknown>).type,
      ).toBe("text");
    });

    it("preserves disabled flag on advanced tab", () => {
      const fields = LEGACY_RAW_ARRAY as unknown as Field[];
      const { nodes, rootIds } = fieldsToBuilderState(fields);
      const exported = nodesToFields(nodes, rootIds);

      const tabsField = exported[0] as TabsField;
      const advancedTab = tabsField.tabs.find(
        (t) => t.name === "advanced",
      ) as Tab;
      expect(advancedTab).toBeDefined();
      expect(advancedTab.disabled).toBe(true);
      expect(advancedTab.fields).toHaveLength(1);
    });

    it("preserves ui config on the tabs field", () => {
      const fields = LEGACY_RAW_ARRAY as unknown as Field[];
      const { nodes, rootIds } = fieldsToBuilderState(fields);
      const exported = nodesToFields(nodes, rootIds);

      const tabsField = exported[0] as unknown as Record<string, unknown>;
      const ui = tabsField.ui as Record<string, unknown>;
      expect(ui.defaultTab).toBe("profile");
      expect(ui.variant).toBe("line");
    });
  });

  // -------------------------------------------------------------------------
  // 4. Full pipeline: JSON string → defineSchema-compatible output
  // -------------------------------------------------------------------------
  describe("Full pipeline: JSON string → FormSchema output", () => {
    it("produces a FormSchema compatible with defineSchema", () => {
      const json = JSON.stringify(LEGACY_RAW_ARRAY);
      const result = parseImportedFormJson(json);

      const { nodes, rootIds } = result.state;
      const exportedFields = nodesToFields(nodes, rootIds);

      // This is what would be passed to defineSchema({ fields: exportedFields })
      const formSchema = { fields: exportedFields };

      expect(formSchema.fields).toHaveLength(1);
      expect(formSchema.fields[0]!.type).toBe("tabs");

      // Verify deep nesting survived the full round-trip
      const tabs = (formSchema.fields[0] as TabsField).tabs;
      expect(tabs).toHaveLength(4);

      // Verify every tab has a fields array (critical for preview rendering)
      for (const tab of tabs) {
        expect(Array.isArray(tab.fields)).toBe(true);
        expect(tab.fields.length).toBeGreaterThan(0);
      }
    });

    it("sanitizes empty/null values from the exported schema", () => {
      // The input has disabled: false on some fields — sanitizer should keep
      // boolean false but remove empty strings, nulls, undefined
      const json = JSON.stringify(LEGACY_RAW_ARRAY);
      const result = parseImportedFormJson(json);
      const exportedFields = nodesToFields(result.state.nodes, result.state.rootIds);
      const tabsField = exportedFields[0] as TabsField;
      const profileTab = tabsField.tabs.find(
        (t) => t.name === "profile",
      ) as Tab;

      // Email field had disabled: false — should be preserved
      const emailField = profileTab.fields[1] as unknown as Record<
        string,
        unknown
      >;
      expect(emailField.disabled).toBe(false);
    });

    it("preserves defaultValues through the pipeline", () => {
      const json = JSON.stringify(LEGACY_RAW_ARRAY);
      const result = parseImportedFormJson(json);
      const exportedFields = nodesToFields(result.state.nodes, result.state.rootIds);

      const tabsField = exportedFields[0] as TabsField;
      const profileTab = tabsField.tabs.find(
        (t) => t.name === "profile",
      ) as Tab;
      const row = profileTab.fields[0] as unknown as {
        type: string;
        fields: Field[];
      };
      const displayName = row.fields[0] as unknown as Record<string, unknown>;
      expect(displayName.defaultValue).toBe("John Doe");
    });

    it("preserves radio options with all metadata", () => {
      const json = JSON.stringify(LEGACY_RAW_ARRAY);
      const result = parseImportedFormJson(json);
      const exportedFields = nodesToFields(result.state.nodes, result.state.rootIds);

      const tabsField = exportedFields[0] as TabsField;
      const notifTab = tabsField.tabs.find(
        (t) => t.name === "notifications",
      ) as Tab;
      const radioField = notifTab.fields[2] as unknown as Record<
        string,
        unknown
      >;
      expect(radioField.type).toBe("radio");

      const options = radioField.options as { label: string; value: string }[];
      expect(options).toHaveLength(4);
      expect(options[0]).toEqual({ label: "Instant", value: "instant" });
    });

    it("handles name collisions by suffixing duplicates", () => {
      // In LEGACY_RAW_ARRAY:
      // 1. Tab 'profile' has an email field named 'email'
      // 2. Tab 'notifications' has a switch field named 'email'
      const json = JSON.stringify(LEGACY_RAW_ARRAY);
      const result = parseImportedFormJson(json);
      const exportedFields = nodesToFields(result.state.nodes, result.state.rootIds);

      const tabsField = exportedFields[0] as TabsField;

      // 1st email field (profile tab)
      const profileTab = tabsField.tabs.find((t) => t.name === "profile")!;
      const emailInput = profileTab.fields[1] as unknown as Record<string, unknown>;
      expect(emailInput.name).toBe("email");

      // 2nd email field (notifications tab)
      const notifTab = tabsField.tabs.find((t) => t.name === "notifications")!;
      const emailSwitch = notifTab.fields[0] as unknown as Record<
        string,
        unknown
      >;
      expect(emailSwitch.name).toBe("email_1"); // Suffixed
    });
  });
});
