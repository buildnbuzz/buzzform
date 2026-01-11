import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { heroContent } from "@/lib/constants";
import { CopyCommand } from "@/components/landing/copy-command";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden py-12 lg:py-16">
      <div className="container px-4 md:px-8 flex flex-col items-center text-center">
        <Badge
          variant="outline"
          className="mb-4 animate-fade-in px-3 py-1 rounded-full border-primary/20 bg-primary/5 text-primary"
        >
          {heroContent.badge}
        </Badge>
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-6xl max-w-4xl bg-clip-text text-transparent bg-linear-to-b from-foreground to-foreground/70">
          {heroContent.title}{" "}
          <span className="text-primary">{heroContent.titleHighlight}</span>
        </h1>
        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-2xl">
          {heroContent.description}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="rounded-full px-8"
            nativeButton={false}
            render={
              <Link href={heroContent.primaryCta.href}>
                {heroContent.primaryCta.label}{" "}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="ml-2 h-4 w-4"
                />
              </Link>
            }
          />
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8"
            nativeButton={false}
            render={
              <Link
                href={heroContent.secondaryCta.href}
                {...(heroContent.secondaryCta.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
              >
                {heroContent.secondaryCta.label}
              </Link>
            }
          />
        </div>
        <CopyCommand />
      </div>
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -z-10 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[100px]" />
    </section>
  );
}
