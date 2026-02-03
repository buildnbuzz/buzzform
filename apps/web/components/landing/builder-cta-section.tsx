import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BuilderCtaSection() {
  return (
    <section className="container px-4 md:px-8 py-20">
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 px-6 py-12 text-center shadow-lg ring-1 ring-border/20 sm:px-12">
        <div className="absolute -top-16 right-8 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-16 left-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          BuzzForm Builder
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Build forms visually in minutes
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          Drag, drop, and customize with a live preview. Export clean      code when you are ready.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="rounded-full px-8"
            nativeButton={false}
            render={<Link href="/builder">Open Builder</Link>}
          />
        </div>
      </div>
    </section>
  );
}
