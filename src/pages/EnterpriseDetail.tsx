import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { GridBackground } from "../components/ui/GridBackground";
import { getEnterpriseTemplates } from "../data/enterpriseTemplates";
import { Template } from "../data/startupTemplates";
import { DetailHero, DetailDescription, DetailRecommendations, StickyBottomBar, AppHeader, DetailShowcase } from "../components/enterprise/DetailSections";
import Footer from "../components/Footer";
import { OrderTunnel } from "../components/enterprise/OrderTunnel";

export default function EnterpriseDetail() {
  const { id } = useParams();
  const [template, setTemplate] = useState<Template | null>(null);
  const [allTemplates, setAllTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOrderOpen, setIsOrderOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    getEnterpriseTemplates().then(data => {
      setAllTemplates(data);
      const found = data.find(t => String(t.id) === id);
      setTemplate(found || null);
      setLoading(false);
    });
  }, [id]);

  const handleOrder = () => {
    if (template) {
      const existing = sessionStorage.getItem('autoslash_selection');
      const context = existing ? JSON.parse(existing) : {};
      sessionStorage.setItem('autoslash_selection', JSON.stringify({
        ...context,
        template_id: String(template.id),
        template_sector: template.category,
        template_name: template.title,
        package_type: 'ENTERPRISE'
      }));
    }
    setIsOrderOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-black min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!template) {
    return <Navigate to="/enterprise-package" replace />;
  }

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-[#A855F7]/30 selection:text-white relative overflow-hidden isolate">
      <GridBackground />
      <AppHeader />
      <main className="w-full pb-32 relative z-10">
        <DetailHero template={template} onOrder={handleOrder} />
        <DetailShowcase template={template} />
        <DetailDescription template={template} />
        <DetailRecommendations currentId={template.id} sector={template.sector} />
        <Footer strokeColor="#A855F7" />
      </main>
      
      <StickyBottomBar template={template} onOrder={handleOrder} />

      <OrderTunnel 
        isOpen={isOrderOpen} 
        onClose={() => setIsOrderOpen(false)} 
        price={template.price} 
      />
    </div>
  );
}
