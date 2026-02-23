import { siteConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata = {
  title: `Cookie Policy`,
  description: "How BuzzForm uses cookies and similar technologies.",
};

const lastUpdated = "February 23, 2026";

export default function CookiesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      <main className="relative flex-1">
        <section className="relative overflow-hidden py-12 md:py-16">
          <div className="container mx-auto px-4 text-center md:px-8">
            <Badge
              variant="outline"
              className="mx-auto mb-4 w-fit rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-primary"
            >
              Legal
            </Badge>
            <h1 className="bg-linear-to-b from-foreground to-foreground/70 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent sm:text-4xl lg:text-5xl">
              Cookie Policy
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
              This policy explains which cookies and similar technologies we use
              on {siteConfig.name}, and how you can control them.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/60 bg-card/60 px-3 py-1">
                Last updated: {lastUpdated}
              </span>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 -z-10 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute -top-24 right-10 -z-10 h-48 w-48 rounded-full bg-foreground/5 blur-[80px]" />
        </section>

        <section className="container mx-auto px-4 pb-16 md:px-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm">
              <div className="space-y-8">
                <section id="scope">
                  <h2 className="text-lg font-semibold">
                    1. What This Policy Covers
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We use cookies and similar technologies (such as local
                    storage) to keep {siteConfig.name} working and, if you
                    allow it, to measure usage trends and improve the product.
                  </p>
                </section>

                <section id="types">
                  <h2 className="text-lg font-semibold">
                    2. Types of Technologies We Use
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We currently use the following categories:
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>
                      <span className="font-medium text-foreground">
                        Essential technologies:
                      </span>{" "}
                      required for core site behavior and security.
                    </li>
                    <li>
                      <span className="font-medium text-foreground">
                        Analytics technologies:
                      </span>{" "}
                      optional, used to understand traffic and product usage.
                    </li>
                  </ul>
                </section>

                <section id="consent">
                  <h2 className="text-lg font-semibold">3. Consent Choices</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We use Google Consent Mode v2. On first visit, consent is
                    set to denied by default until you choose in the cookie
                    banner. If you accept, consent is updated to granted. If
                    you decline, consent remains denied.
                  </p>
                </section>

                <section id="storage">
                  <h2 className="text-lg font-semibold">
                    4. How We Store Your Choice
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We store your preference locally in your browser using a{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      cookie_consent
                    </code>{" "}
                    value of{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      granted
                    </code>{" "}
                    or{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-xs">
                      denied
                    </code>
                    . You can remove this value anytime by clearing site data in
                    your browser.
                  </p>
                </section>

                <section id="third-party">
                  <h2 className="text-lg font-semibold">
                    5. Third-Party Analytics Providers
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We use Google Tag Manager to manage analytics tags. When
                    consent is denied, tags operate under denied consent
                    settings. When consent is granted, analytics storage and
                    related consent signals are enabled. These providers may
                    process data according to their own privacy policies.
                  </p>
                </section>

                <section id="updates">
                  <h2 className="text-lg font-semibold">6. Policy Updates</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We may update this policy as our product or legal
                    obligations evolve. We will post the latest version on this
                    page and update the &quot;Last updated&quot; date.
                  </p>
                </section>

                <section id="contact">
                  <h2 className="text-lg font-semibold">7. Contact</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    If you have cookie-related questions, contact us through our
                    official channels listed in the footer.
                  </p>
                </section>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground shadow-sm lg:sticky lg:top-20">
              <h3 className="text-sm font-semibold text-foreground">
                On this page
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a
                    className="transition-colors hover:text-foreground"
                    href="#scope"
                  >
                    Scope
                  </a>
                </li>
                <li>
                  <a
                    className="transition-colors hover:text-foreground"
                    href="#types"
                  >
                    Types of technologies
                  </a>
                </li>
                <li>
                  <a
                    className="transition-colors hover:text-foreground"
                    href="#consent"
                  >
                    Consent choices
                  </a>
                </li>
                <li>
                  <a
                    className="transition-colors hover:text-foreground"
                    href="#storage"
                  >
                    Preference storage
                  </a>
                </li>
                <li>
                  <a
                    className="transition-colors hover:text-foreground"
                    href="#third-party"
                  >
                    Third-party providers
                  </a>
                </li>
                <li>
                  <a
                    className="transition-colors hover:text-foreground"
                    href="#updates"
                  >
                    Policy updates
                  </a>
                </li>
                <li>
                  <a
                    className="transition-colors hover:text-foreground"
                    href="#contact"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </aside>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
