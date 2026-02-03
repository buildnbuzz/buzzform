import { siteConfig } from "@/lib/constants";

export const metadata = {
  title: `Terms of Service - ${siteConfig.name}`,
  description: "Terms and conditions for using BuzzForm.",
};

export default function TermsPage() {
  return (
    <div className="container max-w-3xl py-12 md:py-16">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="prose dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>
            By accessing or using {siteConfig.name}, you agree to be bound by
            these Terms of Service. If you do not agree to these terms, please
            do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            2. Description of Service
          </h2>
          <p>
            {siteConfig.name} is a form builder and schema generation tool. We
            provide a visual interface for creating forms and exporting the
            corresponding code.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
          <p>
            To access certain features, you may need to register for an account.
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            4. Intellectual Property
          </h2>
          <p>
            The code you generate using our tool is yours to own and use freely
            in your projects, including commercial applications. The{" "}
            {siteConfig.name} platform itself, including its design and code, is
            protected by copyright and other intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            5. Disclaimer of Warranties
          </h2>
          <p>
            The service is provided &quot;as is&quot; and &quot;as
            available&quot; without any warranties of any kind, whether express
            or implied. We do not guarantee that the service will be
            uninterrupted, secure, or error-free.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">
            6. Limitation of Liability
          </h2>
          <p>
            In no event shall {siteConfig.name} be liable for any indirect,
            incidental, special, consequential, or punitive damages arising out
            of your use or inability to use the service.
          </p>
        </section>
      </div>
    </div>
  );
}
