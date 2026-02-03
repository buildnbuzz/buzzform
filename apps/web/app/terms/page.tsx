import { siteConfig } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata = {
  title: `Terms of Service`,
  description: "Terms and conditions for using BuzzForm.",
};

const lastUpdated = "February 3, 2026";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <SiteHeader />
      <main className="relative flex-1">
        <section className="relative overflow-hidden py-12 md:py-16">
          <div className="container mx-auto px-4 md:px-8 text-center">
            <Badge
              variant="outline"
              className="mx-auto mb-4 w-fit rounded-full border-primary/20 bg-primary/5 px-3 py-1 text-primary"
            >
              Legal
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
              Terms of Service
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
              These terms govern your use of BuzzForm and outline the
              responsibilities that help keep our platform reliable for
              everyone.
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
                <section id="acceptance">
                  <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    By accessing or using {siteConfig.name}, you agree to be bound
                    by these Terms of Service. If you do not agree, please do not
                    use our services.
                  </p>
                </section>

                <section id="service">
                  <h2 className="text-lg font-semibold">2. Description of Service</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {siteConfig.name} provides a visual form builder and schema
                    generation tooling. We help you create forms and export
                    corresponding code for your projects.
                  </p>
                </section>

                <section id="accounts">
                  <h2 className="text-lg font-semibold">3. User Accounts</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Some features require an account. You are responsible for
                    safeguarding your credentials and for all activity that
                    occurs under your account.
                  </p>
                </section>

                <section id="ip">
                  <h2 className="text-lg font-semibold">4. Intellectual Property</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    The code you generate using our tool is yours to own and use
                    freely in your projects, including commercial applications.
                    The {siteConfig.name} platform itself, including its design
                    and code, is protected by copyright and other intellectual
                    property laws.
                  </p>
                </section>

                <section id="warranties">
                  <h2 className="text-lg font-semibold">5. Disclaimer of Warranties</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    The service is provided &quot;as is&quot; and &quot;as available&quot; without
                    warranties of any kind, whether express or implied. We do not
                    guarantee the service will be uninterrupted, secure, or
                    error-free.
                  </p>
                </section>

                <section id="liability">
                  <h2 className="text-lg font-semibold">6. Limitation of Liability</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    In no event shall {siteConfig.name} be liable for any indirect,
                    incidental, special, consequential, or punitive damages
                    arising out of your use or inability to use the service.
                  </p>
                </section>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground shadow-sm lg:sticky lg:top-20">
              <h3 className="text-foreground text-sm font-semibold">On this page</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a className="hover:text-foreground transition-colors" href="#acceptance">
                    Acceptance of terms
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground transition-colors" href="#service">
                    Description of service
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground transition-colors" href="#accounts">
                    User accounts
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground transition-colors" href="#ip">
                    Intellectual property
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground transition-colors" href="#warranties">
                    Disclaimer of warranties
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground transition-colors" href="#liability">
                    Limitation of liability
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
