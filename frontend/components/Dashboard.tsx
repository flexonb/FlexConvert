import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { FileText, Image, RefreshCcw, BarChart3 } from "lucide-react";
import Header from "./Header";
import PDFTools from "./pdf/PDFTools";
import ImageTools from "./image/ImageTools";
import ConvertTools from "./convert/ConvertTools";
import StatsView from "./stats/StatsView";
import Footer from "./Footer";
import CommandPalette from "./CommandPalette";
import QuickActionFab from "./QuickActionFab";
import RecentTools from "./RecentTools";
import type { ToolCategory } from "../utils/recentTools";
import SideNav from "./SideNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import QuickLinks from "./QuickLinks";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("pdf");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let raf: number;
    const root = document.documentElement;
    let t = 0;
    const animate = () => {
      t += 0.003;
      root.style.setProperty("--blob-x", `${Math.sin(t) * 15 + 50}%`);
      root.style.setProperty("--blob-y", `${Math.cos(t * 0.8) * 15 + 50}%`);
      root.style.setProperty("--blob2-x", `${Math.cos(t * 1.2) * 12 + 70}%`);
      root.style.setProperty("--blob2-y", `${Math.sin(t * 0.9) * 12 + 30}%`);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleCommandSelect = (val: string) => {
    setActiveTab(val);
  };

  const handleNavigate = (tab: "pdf" | "image" | "convert" | "stats") => {
    setActiveTab(tab);
  };

  const tabMeta = useMemo(
    () => [
      { id: "pdf", title: "PDF Tools", Icon: FileText, color: "text-blue-600 dark:text-blue-400" },
      { id: "image", title: "Image Tools", Icon: Image, color: "text-green-600 dark:text-green-400" },
      { id: "convert", title: "Convert", Icon: RefreshCcw, color: "text-purple-600 dark:text-purple-400" },
      { id: "stats", title: "Stats", Icon: BarChart3, color: "text-amber-600 dark:text-amber-400" },
    ],
    []
  );

  const onSelectRecentCategory = (cat: ToolCategory) => setActiveTab(cat);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-950 dark:via-blue-950/30 dark:to-indigo-950/50">
      <Header onOpenSidebar={() => setMobileNavOpen(true)} onNavigate={handleNavigate} />

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div
          className="absolute w-72 h-72 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse"
          style={{
            left: "var(--blob-x, 20%)",
            top: "var(--blob-y, 20%)",
            transform: "translate(-50%, -50%)"
          }}
        />
        <div
          className="absolute w-64 h-64 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-pulse"
          style={{
            left: "var(--blob2-x, 80%)",
            top: "var(--blob2-y, 80%)",
            transform: "translate(-50%, -50%)",
            animationDelay: "2s"
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px"
          }}
        />
      </div>

      <main className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-20">
              <SideNav
                active={activeTab as any}
                onSelect={(id) => setActiveTab(id)}
                onOpenPalette={() => setPaletteOpen(true)}
              />
            </div>
          </aside>

          {/* Main Content */}
          <section className="col-span-12 lg:col-span-9">
            {/* Tip Section (brand heading removed to avoid duplication) */}
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Tip: <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">⌘K or Ctrl + K</kbd> opens the palette
              </div>
            </div>

            {/* Quick Links: show both PDF and Image actions up front */}
            <QuickLinks onSelectTab={(id) => setActiveTab(id)} />

            <RecentTools onSelectCategory={onSelectRecentCategory} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="pdf" className="focus-visible:outline-none mt-4">
                <PDFTools />
              </TabsContent>

              <TabsContent value="image" className="focus-visible:outline-none mt-4">
                <ImageTools />
              </TabsContent>

              <TabsContent value="convert" className="focus-visible:outline-none mt-4">
                <ConvertTools />
              </TabsContent>

              <TabsContent value="stats" className="focus-visible:outline-none mt-4">
                <StatsView />
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      <QuickActionFab onOpenPalette={() => setPaletteOpen(true)} />

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onSelect={handleCommandSelect} />

      <Footer />

      {/* Mobile Navigation */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-[280px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-gray-200/50 dark:border-gray-700/50">
          <div className="p-6">
            <SideNav
              active={activeTab as any}
              onSelect={(id) => {
                setActiveTab(id);
                setMobileNavOpen(false);
              }}
              onOpenPalette={() => {
                setPaletteOpen(true);
                setMobileNavOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
