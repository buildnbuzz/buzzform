import Link from "next/link";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "../components/header";
import { Sidebar } from "../components/sidebar";
import { BuilderDndProvider } from "../components/provider";
import { PropertiesPanel } from "../components/properties/properties-panel";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <BuilderDndProvider>
        <SidebarProvider defaultOpen={true} className="flex flex-col h-full">
          <SiteHeader />
          <div className="flex items-center justify-center gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-950 dark:text-amber-200">
            <strong className="font-medium">New Builder available:</strong>
            <span>
              The all-new BuzzForm Builder is now in public preview. We
              recommend using it for new projects.
            </span>
            <Link
              href="/builder/v2"
              className="font-semibold underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Try New Builder →
            </Link>
          </div>
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <SidebarInset>{children}</SidebarInset>
            <PropertiesPanel />
          </div>
        </SidebarProvider>
      </BuilderDndProvider>
    </div>
  );
}
