import type { IconSvgElement } from "@hugeicons/react";
import {
  Rocket01Icon,
  UserCircle02Icon,
  Briefcase01Icon,
  File02Icon,
} from "@hugeicons/core-free-icons";

export interface Example {
  slug: string;
  id: string;
  name: string;
  description: string;
  file: string;
}

export interface ExampleCategory {
  category: string;
  icon: IconSvgElement;
  items: Example[];
}

/**
 * Single source of truth for all examples.
 * Organized by use case for better discoverability.
 */
export const exampleCategories: ExampleCategory[] = [
  {
    category: "Getting Started",
    icon: Rocket01Icon,
    items: [
      {
        slug: "contact-form",
        id: "ContactFormExample",
        name: "Contact",
        description: "A simple contact form with validation.",
        file: "contact-form.tsx",
      },
      {
        slug: "newsletter-dialog",
        id: "NewsletterDialogExample",
        name: "Newsletter",
        description: "A newsletter subscription form in a dialog.",
        file: "newsletter-dialog.tsx",
      },
      {
        slug: "feedback-sheet",
        id: "FeedbackSheetExample",
        name: "Feedback",
        description: "A slide-out sheet for gathering user feedback.",
        file: "feedback-sheet.tsx",
      },
      {
        slug: "quick-add",
        id: "QuickAddPopover",
        name: "Quick Add",
        description: "A small form for quickly adding items.",
        file: "quick-add.tsx",
      },
      {
        slug: "notification-settings",
        id: "NotificationSettingsCard",
        name: "Notifications",
        description: "Preferences for email and push notifications.",
        file: "notification-settings.tsx",
      },
    ],
  },
  {
    category: "Authentication",
    icon: UserCircle02Icon,
    items: [
      {
        slug: "login-form",
        id: "LoginFormCard",
        name: "Login",
        description: "A standard login card with email and password.",
        file: "login-form.tsx",
      },
      {
        slug: "register-form",
        id: "RegisterFormDialog",
        name: "Register",
        description: "Registration form inside a modal dialog.",
        file: "register-form.tsx",
      },

      {
        slug: "account-settings-form",
        id: "AccountSettingsForm",
        name: "Account",
        description: "Tabbed account settings.",
        file: "account-settings-form.tsx",
      },
    ],
  },
  {
    category: "Business Forms",
    icon: Briefcase01Icon,
    items: [
      {
        slug: "product-form",
        id: "ProductFormCard",
        name: "Product",
        description: "A form for creating or editing a product.",
        file: "product-form.tsx",
      },
      {
        slug: "pricing-form",
        id: "PricingFormCard",
        name: "Pricing",
        description: "A form for selecting pricing plans.",
        file: "pricing-form.tsx",
      },
      {
        slug: "blog-post-form",
        id: "BlogPostFormCard",
        name: "Blog Post",
        description: "A comprehensive form for writing blog posts.",
        file: "blog-post-form.tsx",
      },
      {
        slug: "booking-form",
        id: "BookingForm",
        name: "Booking",
        description: "A multi-step booking wizard.",
        file: "booking-form.tsx",
      },
      {
        slug: "support-ticket-form",
        id: "SupportTicketForm",
        name: "Support Ticket",
        description: "A detailed form for submitting support requests.",
        file: "support-ticket-form.tsx",
      },
      {
        slug: "contact-layout-form",
        id: "ContactLayoutForm",
        name: "Contact Layout",
        description: "Contact form with a sidebar layout.",
        file: "contact-layout-form.tsx",
      },
      {
        slug: "coupon-layout-form",
        id: "CouponLayoutForm",
        name: "Coupon",
        description: "Coupon creation form with a sidebar layout.",
        file: "coupon-layout-form.tsx",
      },
      {
        slug: "checkout-form",
        id: "CheckoutForm",
        name: "Checkout",
        description: "A multi-step checkout process.",
        file: "checkout-form.tsx",
      },
    ],
  },

  {
    category: "Advanced Patterns",
    icon: File02Icon,
    items: [
      {
        slug: "array-field-form",
        id: "ArrayFieldExample",
        name: "Array",
        description: "Dynamic list management using ArrayField.",
        file: "array-field-form.tsx",
      },
      {
        slug: "group-field-form",
        id: "GroupFieldExample",
        name: "Group",
        description: "Demonstrates nested fields using GroupField.",
        file: "group-field-form.tsx",
      },
      {
        slug: "collapsible-settings-form",
        id: "CollapsibleSettingsForm",
        name: "Collapsible",
        description: "Settings organized in collapsible sections.",
        file: "collapsible-settings-form.tsx",
      },
      {
        slug: "minimal-array-form",
        id: "MinimalArrayForm",
        name: "Minimal Array",
        description: "Sleek inline lists using the minimal variant.",
        file: "minimal-array-form.tsx",
      },
      {
        slug: "country-state-form",
        id: "CountryStateForm",
        name: "Country + State",
        description: "Cascading dropdowns with real REST API data.",
        file: "country-state-form.tsx",
      },
    ],
  },
];

// Flatten all examples for easy lookup
export const allExamples: Example[] = exampleCategories.flatMap(
  (cat) => cat.items,
);

// Default example (first one)
export const defaultExample = allExamples[0];

// Type-safe slug type
export type ExampleSlug = (typeof allExamples)[number]["slug"];

// Helper functions for metadata
export function getExampleBySlug(slug: string): Example | undefined {
  return allExamples.find((ex) => ex.slug === slug);
}

export function getExampleById(id: string): Example | undefined {
  return allExamples.find((ex) => ex.id === id);
}

/**
 * Generate static params for all examples.
 * Used by Next.js for static generation.
 */
export function generateExampleStaticParams() {
  return allExamples.map((example) => ({
    slug: example.slug,
  }));
}
