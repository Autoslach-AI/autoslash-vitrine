import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { GridBackground } from "../components/ui/GridBackground";
import { getStartupTemplates, Template } from "../data/startupTemplates";
import { DetailHero, DetailDescription, DetailRecommendations, StickyBottomBar, AppHeader, DetailShowcase } from "../components/startup/DetailSections";
import Footer from "../components/Footer";
import { OrderTunnel } from "../components/startup/OrderTunnel";

export default function ArchitectureDetail() {
  const { id } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getStartupTemplates().then(data => {
      setAllTemplates(data);
      const found = data.find(t => String(t.id) === id);
      setTemplate(found || null);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="bg-zinc-950 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!template) {
    return <Navigate to="/startup-package" replace />;
  }

  return (
    <div className="bg-zinc-950 min-h-screen text-white font-sans selection:bg-[#2a6df5]/30 selection:text-white relative overflow-hidden isolate">
      <GridBackground />
      <AppHeader />
      <main className="w-full pb-32 relative z-10">
        <DetailHero template={template} onOrder={() => setIsOrderOpen(true)} />
        <DetailShowcase template={template} />
        <DetailDescription template={template} />
        <DetailRecommendations currentId={template.id} templates={allTemplates} category={template.category} />
        <Footer strokeColor="white" />
      </main>
      
      <StickyBottomBar template={template} onOrder={() => setIsOrderOpen(true)} />

      <OrderTunnel 
        isOpen={isOrderOpen} 
        onClose={() => setIsOrderOpen(false)} 
        price={150000} 
      />
    </div>
  );
}
