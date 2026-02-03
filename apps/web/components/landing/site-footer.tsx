import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { ZapIcon } from "@hugeicons/core-free-icons";
import { siteConfig, footerSections } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="lg:max-w-md">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg invert dark:invert-0">
                <Image
                  src={siteConfig.logo}
                  alt={siteConfig.name}
                  width={24}
                  height={24}
                />
              </div>
              <span className="text-base font-semibold tracking-tight">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs">
              {siteConfig.description}
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:flex lg:gap-12">
            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold text-sm mb-4">{section.title}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="hover:text-primary transition-colors flex items-center gap-2"
                        {...(link.external
                          ? { target: "_blank", rel: "noreferrer" }
                          : {})}
                      >
                        {link.icon && (
                          <HugeiconsIcon icon={link.icon} className="size-4" />
                        )}
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} {siteConfig.author.name}. All rights
            reserved.
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            Made with{" "}
            <HugeiconsIcon
              icon={ZapIcon}
              className="inline size-3 text-primary mx-0.5"
            />{" "}
            by{" "}
            <a
              href={siteConfig.author.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4 decoration-border/50 hover:decoration-primary transition-all font-semibold"
            >
              {siteConfig.author.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
