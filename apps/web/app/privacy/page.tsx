import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata = {
  title: `Privacy Policy`,
  description: "How we handle your data at BuzzForm.",
};

const lastUpdated = "February 3, 2026";

export default function PrivacyPage() {
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
              Privacy Policy
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-muted-foreground">
              We build BuzzForm with privacy in mind. This policy explains what
              we collect, how we use it, and the choices you have.
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
                <section id="information">
                  <h2 className="text-lg font-semibold">1. Information We Collect</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We collect information you provide directly to us, such as when
                    you create an account, join our waitlist, or contact us. This
                    may include your name and email address.
                  </p>
                </section>

                <section id="usage">
                  <h2 className="text-lg font-semibold">2. How We Use Your Information</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We use the information we collect to provide, maintain, and
                    improve our services, communicate with you about updates, and
                    respond to your questions.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>Provide, maintain, and improve our services.</li>
                    <li>Send technical notices, updates, and support messages.</li>
                    <li>Respond to your comments and questions.</li>
                    <li>Share new features, releases, and announcements.</li>
                  </ul>
                </section>

                <section id="storage">
                  <h2 className="text-lg font-semibold">3. Data Storage</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We use third-party cloud providers to host our infrastructure
                    and store data securely. We apply reasonable administrative,
                    technical, and physical safeguards to protect information.
                  </p>
                </section>

                <section id="cookies">
                  <h2 className="text-lg font-semibold">4. Cookies and Analytics</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We use analytics tools to understand how people interact with
                    BuzzForm. These tools may use cookies or similar technologies
                    to collect usage data. You can control cookies through your
                    browser settings.
                  </p>
                </section>

                <section id="third-party">
                  <h2 className="text-lg font-semibold">5. Third-Party Services</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    We may rely on trusted service providers to operate BuzzForm.
                    These providers access information only to perform specific
                    services on our behalf and are obligated to protect it.
                  </p>
                </section>

                <section id="contact">
                  <h2 className="text-lg font-semibold">6. Contact Us</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    If you have questions about this Privacy Policy, contact us
                    through our official social channels.
                  </p>
                </section>
              </div>
            </div>

            <aside className="h-fit rounded-2xl border border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground shadow-sm lg:sticky lg:top-20">
              <h3 className="text-foreground text-sm font-semibold">On this page</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <a className="hover:text-foreground transition-colors" href="#information">
                    Information we collect
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground transition-colors" href="#usage">
                    How we use information
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground transition-colors" href="#storage">
                    Data storage
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground transition-colors" href="#cookies">
                    Cookies and analytics
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground transition-colors" href="#third-party">
                    Third-party services
                  </a>
                </li>
                <li>
                  <a className="hover:text-foreground transition-colors" href="#contact">
                    Contact us
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
