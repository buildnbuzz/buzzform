import { siteConfig } from "@/lib/constants";

export const metadata = {
  title: `Privacy Policy - ${siteConfig.name}`,
  description: "How we handle your data at BuzzForm.",
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            1. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, such as when you
            create an account, join our waitlist, or communicate with us. This
            may include your email address and name.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            2. How We Use Your Information
          </h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>
              Send you technical notices, updates, security alerts, and support
              messages
            </li>
            <li>Respond to your comments and questions</li>
            <li>Communicate with you about new features and updates</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Storage</h2>
          <p>
            We use third-party secure cloud providers to store your data. We
            implement reasonable security measures to protect your personal
            information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            4. Cookies and Analytics
          </h2>
          <p>
            We use analytical tools to understand how users interact with our
            website. These tools may use cookies to collect usage data. You can
            control cookies through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            5. Third-Party Services
          </h2>
          <p>
            We may use third-party services to help us operate our business.
            These third parties may have access to your information only to
            perform specific tasks on our behalf and are obligated not to
            disclose or use it for any other purpose.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us at via our social channels.
          </p>
        </section>
      </div>
    </div>
  );
}
