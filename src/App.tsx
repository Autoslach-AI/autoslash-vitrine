/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { Header } from "./components/Header";
import { BackButton } from "./components/ui/back-button";
import Footer from "./components/Footer";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { cn } from "@/lib/utils";

// Lazy loading page components
const Home = lazy(() => import("./pages/Home"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const StartupPackagePage = lazy(() => import("./pages/StartupPackage"));
const BusinessPackagePage = lazy(() => import("./pages/BusinessPackage"));
const EnterprisePackagePage = lazy(() => import("./pages/EnterprisePackage"));
const ArchitectureDetail = lazy(() => import("./pages/ArchitectureDetail"));
const BusinessDetail = lazy(() => import("./pages/BusinessDetail"));
const EnterpriseDetail = lazy(() => import("./pages/EnterpriseDetail"));
const ElitePlanPage = lazy(() => import("./pages/ElitePlanPage"));
const ClientProjects = lazy(() => import("./pages/ClientProjects"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const AgentsDemo = lazy(() => import("./pages/AgentsDemo"));
const RuixenDemo = lazy(() => import("./pages/RuixenDemo"));
const OnboardingPage = lazy(() => import("./pages/onboarding/index"));
const ProfilePage = lazy(() => import("./pages/profile/index"));

import { useAuth, useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { checkOnboardingStatus } from "./lib/supabase-onboarding";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

class ErrorBoundary extends React.Component<any, any> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("CRITICAL APP CRASH:", error, errorInfo);
  }

  render() {
    if ((this.state as any).hasError) {
      return (
        <div style={{
          background: '#050505',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'monospace',
          padding: '40px'
        }}>
          <p style={{color:'#ff4444', fontSize:'18px', marginBottom:'20px'}}>
            ERREUR DÉTECTÉE :
          </p>
          <p style={{color:'#ffffff', fontSize:'14px', textAlign:'center'}}>
            {(this.state as any).error?.message}
          </p>
          <p style={{color:'#888', fontSize:'12px', marginTop:'20px', 
          textAlign:'center', maxWidth:'800px', whiteSpace: 'pre-wrap', overflow: 'auto'}}>
            {(this.state as any).error?.stack}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{marginTop:'30px', padding:'10px 20px', 
            background:'#2a6df5', color:'white', border:'none', 
            borderRadius:'6px', cursor:'pointer'}}>
            Reload
          </button>
        </div>
      );
    }
    return (this as any).props.children;
  }
}

function AppLayout() {
  const location = useLocation();
  const isOnboardingPage = location.pathname === "/onboarding";
  const isDashboardPage = location.pathname.startsWith("/startup-package") || 
                          location.pathname.startsWith("/architecture") ||
                          location.pathname.startsWith("/business-package") ||
                          location.pathname.startsWith("/business-details") ||
                          location.pathname.startsWith("/enterprise-package") ||
                          location.pathname.startsWith("/enterprise-details") ||
                          location.pathname === "/client-projects" ||
                          location.pathname === "/agents-demo" ||
                          location.pathname === "/contact" ||
                          location.pathname === "/profile" ||
                          isOnboardingPage;

  const isWhiteBgPage = location.pathname === "/contact" || location.pathname === "/elite-plan" || location.pathname === "/profile";
  
  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-500",
      isOnboardingPage ? "bg-black" : isWhiteBgPage ? "bg-white" : "bg-brand-bg text-white"
    )}>
      {!isDashboardPage && <Header />}
      <BackButton />
      <main className="flex-grow">
        <Suspense fallback={<div style={{background:'#000000', width:'100vw', height:'100vh'}} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/startup-package" element={<StartupPackagePage />} />
            <Route path="/architecture/:id" element={<ArchitectureDetail />} />
            <Route path="/business-package" element={<BusinessPackagePage />} />
            <Route path="/business-details/:id" element={<BusinessDetail />} />
            <Route path="/enterprise-package" element={<EnterprisePackagePage />} />
            <Route path="/enterprise-details/:id" element={<EnterpriseDetail />} />
            <Route path="/elite-plan" element={<ElitePlanPage />} />
            <Route path="/client-projects" element={<ClientProjects />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/agents-demo" element={<AgentsDemo />} />
            <Route path="/ruixen-demo" element={<RuixenDemo />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Suspense>
      </main>
      {!isDashboardPage && <Footer />}
      {!isDashboardPage && <LanguageSwitcher />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <AppLayout />
      </Router>
    </ErrorBoundary>
  );
}
