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
            <strong className="font-medium">Migration in progress:</strong>
            <span>Migrating to the framework-agnostic, headless BuzzForm. Some builder features and exports may be incomplete.</span>
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
