import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { features, featuresSection } from "@/lib/constants";

export function FeaturesSection() {
  return (
    <section className="container px-4 md:px-8 py-24 lg:py-32">
      <div className="mb-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {featuresSection.title}
        </h2>
        <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
          {featuresSection.description}
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
        {features.map((feature, i) => (
          <Card
            key={i}
            className="group bg-card/50 backdrop-blur-sm border-muted/50 hover:bg-card hover:border-primary/20 transition-all duration-300"
          >
            <CardHeader>
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HugeiconsIcon icon={feature.icon} className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}
