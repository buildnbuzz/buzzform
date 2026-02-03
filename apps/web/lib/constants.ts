import {
    RocketIcon,
    Shield01Icon,
    Layout01Icon,
    ZapIcon,
    GithubIcon,
    NewTwitterIcon,
} from "@hugeicons/core-free-icons";

// =============================================================================
// SITE CONFIG
// =============================================================================

export const siteConfig = {
    name: "BuzzForm",
    description:
        "The schema-driven form builder for shadcn/ui. Build complex, type-safe forms with minimal effort.",
    logo: "/bb-icon.svg",
    github: "https://github.com/buildnbuzz/buzzform",
    twitter: "https://x.com/PSL4d",
    author: {
        name: "BuildnBuzz",
        url: "https://github.com/buildnbuzz",
    },
};

// =============================================================================
// NAVIGATION
// =============================================================================

export interface NavLink {
    label: string;
    href: string;
    external?: boolean;
}

export const navLinks: NavLink[] = [
    { label: "Documentation", href: "/docs" },
    { label: "Showcase", href: "/examples" },
];

// =============================================================================
// HERO SECTION
// =============================================================================

export const heroContent = {
    badge: "Introducing BuzzForm",
    title: "Build complex forms with",
    titleHighlight: "ease and speed",
    description:
        "Simple, type-safe forms with less boilerplate. Powered by schemas and built for shadcn/ui.",
    primaryCta: {
        label: "Get Started",
        href: "/docs",
    },
    secondaryCta: {
        label: "View on GitHub",
        href: siteConfig.github,
        external: true,
    },
};

// =============================================================================
// FEATURES
// =============================================================================

export interface Feature {
    title: string;
    description: string;
    icon: typeof RocketIcon;
}

export const features: Feature[] = [
    {
        title: "Schema-Driven",
        description:
            "Define your entire form structure as a simple TypeScript schema. No JSX boilerplate, just clean configuration.",
        icon: RocketIcon,
    },
    {
        title: "Type-Safe Validation",
        description:
            "Auto-generated Zod schemas with full TypeScript inference. Catch errors at build time, not runtime.",
        icon: Shield01Icon,
    },
    {
        title: "Conditional Logic",
        description:
            "Show, hide, or disable fields dynamically based on other field values. Build smart, reactive forms.",
        icon: ZapIcon,
    },
    {
        title: "Shadcn Native",
        description:
            "Built entirely on shadcn/ui components. Matches your design system perfectly out of the box.",
        icon: Layout01Icon,
    },
    {
        title: "Fully Customizable",
        description:
            "Override any field with your own components. Full control when you need it, convenience when you don't.",
        icon: RocketIcon,
    },
    {
        title: "17+ Field Types",
        description:
            "Text, email, password, select, date, upload, tags, and more. Complex layouts with groups, arrays, and tabs.",
        icon: Layout01Icon,
    },
];

export const featuresSection = {
    title: "Why BuzzForm?",
    description:
        "Everything you need to build production-ready forms without the headache.",
};

// =============================================================================
// FOOTER
// =============================================================================

export interface FooterLink {
    label: string;
    href: string;
    external?: boolean;
    icon?: typeof GithubIcon;
}

export interface FooterSection {
    title: string;
    links: FooterLink[];
}

export const footerSections: FooterSection[] = [
    {
        title: "Product",
        links: [
            { label: "Documentation", href: "/docs" },
            { label: "Showcase", href: "/examples" },
        ],
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
        ],
    },
    {
        title: "Community",
        links: [
            {
                label: "GitHub",
                href: siteConfig.github,
                external: true,
                icon: GithubIcon,
            },
            {
                label: "X",
                href: siteConfig.twitter,
                external: true,
                icon: NewTwitterIcon,
            },
        ],
    },

];
