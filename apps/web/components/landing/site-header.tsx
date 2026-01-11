import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";
import { siteConfig, navLinks } from "@/lib/constants";
import { MobileNav } from "@/components/landing/mobile-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-14 items-center px-4 md:px-8">
        <Link href="/" className="mr-4 flex items-center space-x-2">
          <Image
            src={siteConfig.logo}
            alt={siteConfig.name}
            width={24}
            height={24}
            className="invert dark:invert-0"
          />
          <span className="hidden font-bold md:inline-block">
            {siteConfig.name}
          </span>
        </Link>
        <div className="ml-auto flex items-center space-x-2">
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60"
                {...(link.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={
              <Link href={siteConfig.github} target="_blank" rel="noreferrer">
                <HugeiconsIcon icon={GithubIcon} className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
            }
          />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
