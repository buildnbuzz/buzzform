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
