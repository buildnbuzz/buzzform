import { redirect } from "next/navigation";
import { defaultExample } from "@/lib/examples";
export default function ExamplesPage() {
  redirect(`/examples/${defaultExample.slug}`);
}
