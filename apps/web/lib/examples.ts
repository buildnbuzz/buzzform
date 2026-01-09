import type { IconSvgElement } from "@hugeicons/react";
import {
    Rocket01Icon,
    UserCircle02Icon,
    Briefcase01Icon,
    FolderOpenIcon,
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
                slug: "quick-add-popover",
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
                file: "auth-forms.tsx",
            },
            {
                slug: "register-dialog",
                id: "RegisterFormDialog",
                name: "Register",
                description: "Registration form inside a modal dialog.",
                file: "auth-forms.tsx",
            },
            {
                slug: "profile-upload",
                id: "ProfileUploadForm",
                name: "Profile",
                description: "Upload profile picture and details.",
                file: "upload-form.tsx",
            },
            {
                slug: "account-settings",
                id: "AccountSettingsForm",
                name: "Account",
                description: "Tabbed account settings.",
                file: "tabs-form.tsx",
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
                slug: "support-ticket",
                id: "SupportTicketForm",
                name: "Support Ticket",
                description: "A detailed form for submitting support requests.",
                file: "support-ticket-form.tsx",
            },
            {
                slug: "contact-layout",
                id: "ContactLayoutForm",
                name: "Contact Layout",
                description: "Contact form with a sidebar layout.",
                file: "layout-form.tsx",
            },
            {
                slug: "coupon-layout",
                id: "CouponLayoutForm",
                name: "Coupon",
                description: "Coupon creation form with a sidebar layout.",
                file: "layout-form.tsx",
            },
            {
                slug: "checkout",
                id: "CheckoutForm",
                name: "Checkout",
                description: "A multi-step checkout process.",
                file: "tabs-form.tsx",
            },
        ],
    },
    {
        category: "File Management",
        icon: FolderOpenIcon,
        items: [
            {
                slug: "document-upload",
                id: "DocumentUploadForm",
                name: "Document",
                description: "Upload documents with progress tracking.",
                file: "upload-form.tsx",
            },
            {
                slug: "gallery-upload",
                id: "GalleryUploadForm",
                name: "Gallery",
                description: "Upload multiple images for a gallery.",
                file: "upload-form.tsx",
            },
        ],
    },
    {
        category: "Advanced Patterns",
        icon: File02Icon,
        items: [
            {
                slug: "array-field",
                id: "ArrayFieldExample",
                name: "Array",
                description: "Dynamic list management using ArrayField.",
                file: "array-form.tsx",
            },
            {
                slug: "group-field",
                id: "GroupFieldExample",
                name: "Group",
                description: "Demonstrates nested fields using GroupField.",
                file: "group-form.tsx",
            },
            {
                slug: "collapsible-settings",
                id: "CollapsibleSettingsForm",
                name: "Collapsible",
                description: "Settings organized in collapsible sections.",
                file: "collapsible-form.tsx",
            },
        ],
    },
];

// Flatten all examples for easy lookup
export const allExamples: Example[] = exampleCategories.flatMap(
    (cat) => cat.items
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
