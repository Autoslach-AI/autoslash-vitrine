/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { BackButton } from "./components/ui/back-button";
import Footer from "./components/Footer";
import LanguageSwitcher from "./components/LanguageSwitcher";
import { useLocation } from "react-router-dom";
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

// Simple Error Boundary to catch silent crashes
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("CRITICAL APP CRASH:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ background: '#050505', width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'sans-serif' }}>
          <div style={{ textAlign: 'center' }}>
            <h2>Something went wrong.</h2>
            <p>Check console for details.</p>
            <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#333', border: '1px solid #555', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppLayout() {
  const location = useLocation();
  const isDashboardPage = location.pathname.startsWith("/startup-package") || 
                          location.pathname.startsWith("/architecture") ||
                          location.pathname.startsWith("/business-package") ||
                          location.pathname.startsWith("/business-details") ||
                          location.pathname.startsWith("/enterprise-package") ||
                          location.pathname.startsWith("/enterprise-details") ||
                          location.pathname === "/client-projects" ||
                          location.pathname === "/contact";

  const isWhiteBgPage = location.pathname === "/contact" || location.pathname === "/elite-plan";
  
  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-500",
      isWhiteBgPage ? "bg-white" : "bg-brand-bg text-white"
    )}>
      <Header />
      <BackButton />
      <main className="flex-grow">
        <Suspense fallback={<div style={{background:'#050505', width:'100vw', height:'100vh'}} />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
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
        <AppLayout />
      </Router>
    </ErrorBoundary>
  );
}
