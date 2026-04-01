/**
 * Canonical Schema Examples for Documentation
 *
 * These schemas are used consistently across the BuzzForm documentation
 * to provide a cohesive learning experience. When updating examples in docs,
 * prefer using these schemas or variations of them.
 */

import { defineSchema, type InferType } from "@buildnbuzz/form-core";

/**
 * Contact Form Schema
 * Used in: Quick Start, Schema, Validation, Conditional Logic
 *
 * A simple contact/support form that evolves through the documentation:
 * - Basic version: name, email, message
 * - With validation: adds minLength, maxLength, pattern
 * - With conditional logic: adds subject dropdown + "other" field
 */
export const contactSchema = defineSchema({
  title: "Contact Form",
  description: "Send us a message",
  fields: [
    {
      type: "text",
      name: "name",
      label: "Full Name",
      placeholder: "John Doe",
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      placeholder: "john@example.com",
      required: true,
    },
    {
      type: "select",
      name: "subject",
      label: "Subject",
      options: ["General", "Support", "Sales", "Other"],
      required: true,
    },
    {
      type: "textarea",
      name: "message",
      label: "Message",
      placeholder: "How can we help?",
      required: true,
      minLength: 10,
      maxLength: 500,
      description: "Be as detailed as possible so we can help you better.",
    },
    {
      type: "text",
      name: "otherSubject",
      label: "Please Specify",
      condition: { $data: "/subject", eq: "Other" },
      required: true,
    },
  ],
});

export type ContactData = InferType<typeof contactSchema.fields>;

/**
 * User Profile Schema
 * Used in: Nested Structures, Default Values, Output Transformation
 *
 * Demonstrates nested groups and basic field types.
 */
export const userProfileSchema = defineSchema({
  title: "User Profile",
  description: "Complete your profile information",
  fields: [
    {
      type: "text",
      name: "firstName",
      label: "First Name",
      placeholder: "John",
      required: true,
    },
    {
      type: "text",
      name: "lastName",
      label: "Last Name",
      placeholder: "Doe",
      required: true,
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      placeholder: "john@example.com",
      required: true,
    },
    {
      type: "date",
      name: "birthDate",
      label: "Birth Date",
    },
    {
      type: "group",
      name: "address",
      label: "Address",
      fields: [
        {
          type: "text",
          name: "street",
          label: "Street",
          placeholder: "123 Main St",
        },
        {
          type: "text",
          name: "city",
          label: "City",
          placeholder: "New York",
        },
        {
          type: "text",
          name: "country",
          label: "Country",
          placeholder: "USA",
        },
      ],
    },
  ],
});

export type UserProfileData = InferType<typeof userProfileSchema.fields>;

/**
 * Job Application Schema
 * Used in: Arrays, Complex Validation, Multi-step Forms
 *
 * Demonstrates arrays with nested fields and complex validation.
 */
export const jobApplicationSchema = defineSchema({
  title: "Job Application",
  description: "Apply for a position",
  fields: [
    {
      type: "text",
      name: "fullName",
      label: "Full Name",
      required: true,
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      required: true,
    },
    {
      type: "array",
      name: "workHistory",
      label: "Work History",
      minItems: 1,
      maxItems: 5,
      fields: [
        {
          type: "text",
          name: "company",
          label: "Company",
          placeholder: "Acme Inc.",
          required: true,
        },
        {
          type: "text",
          name: "role",
          label: "Role",
          placeholder: "Software Engineer",
          required: true,
        },
        {
          type: "date",
          name: "startDate",
          label: "Start Date",
          required: true,
        },
        {
          type: "date",
          name: "endDate",
          label: "End Date",
          description: "Leave blank if current role",
        },
      ],
    },
    {
      type: "array",
      name: "skills",
      label: "Skills",
      minItems: 1,
      fields: [
        {
          type: "text",
          name: "name",
          label: "Skill Name",
          placeholder: "React",
          required: true,
        },
        {
          type: "select",
          name: "level",
          label: "Level",
          options: ["Beginner", "Intermediate", "Advanced"],
          required: true,
        },
      ],
    },
  ],
});

export type JobApplicationData = InferType<typeof jobApplicationSchema.fields>;

/**
 * Registration Schema
 * Used in: Validation, Password Fields, Custom Validators
 *
 * Demonstrates password validation with criteria.
 */
export const registerSchema = defineSchema({
  title: "Create Account",
  description: "Register for a new account",
  fields: [
    {
      type: "text",
      name: "name",
      label: "Full Name",
      placeholder: "John Doe",
      required: true,
    },
    {
      type: "email",
      name: "email",
      label: "Email",
      placeholder: "you@example.com",
      required: true,
    },
    {
      type: "password",
      name: "password",
      label: "Password",
      placeholder: "Create a strong password",
      required: true,
      minLength: 8,
      criteria: {
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        requireSpecial: true,
      },
      ui: {
        strengthIndicator: true,
        showRequirements: true,
      },
    },
    {
      type: "checkbox",
      name: "terms",
      label: "I agree to the Terms of Service and Privacy Policy",
      required: true,
    },
  ],
});

export type RegisterData = InferType<typeof registerSchema.fields>;

/**
 * Account Settings Schema
 * Used in: Tabs, Complex Layouts
 *
 * Demonstrates tabbed interfaces with multiple sections.
 */
export const accountSettingsSchema = defineSchema({
  title: "Account Settings",
  description: "Manage your account settings",
  fields: [
    {
      type: "tabs",
      ui: {
        variant: "default",
        spacing: "md",
      },
      tabs: [
        {
          label: "Profile",
          fields: [
            {
              type: "text",
              name: "displayName",
              label: "Display Name",
              placeholder: "John Doe",
              required: true,
            },
            {
              type: "text",
              name: "username",
              label: "Username",
              placeholder: "johndoe",
              required: true,
            },
            {
              type: "textarea",
              name: "bio",
              label: "Bio",
              placeholder: "Tell us about yourself...",
              rows: 3,
            },
          ],
        },
        {
          label: "Account",
          fields: [
            {
              type: "email",
              name: "email",
              label: "Email Address",
              required: true,
            },
            {
              type: "password",
              name: "password",
              label: "New Password",
              placeholder: "Leave blank to keep current",
              ui: {
                showRequirements: true,
              },
            },
          ],
        },
        {
          label: "Notifications",
          fields: [
            {
              type: "switch",
              name: "emailNotifications",
              label: "Email Notifications",
              description: "Receive updates via email",
              defaultValue: true,
            },
            {
              type: "switch",
              name: "pushNotifications",
              label: "Push Notifications",
              description: "Receive push notifications",
              defaultValue: false,
            },
            {
              type: "select",
              name: "frequency",
              label: "Digest Frequency",
              options: ["Instant", "Daily", "Weekly", "Never"],
              defaultValue: "Daily",
            },
          ],
        },
      ],
    },
  ],
});

export type AccountSettingsData = InferType<typeof accountSettingsSchema.fields>;
