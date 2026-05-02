/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { BackButton } from "./components/ui/back-button";
import Footer from "./components/Footer";
import LanguageSwitcher from "./components/LanguageSwitcher";
import Home from "./pages/Home";
import PricingPage from "./pages/PricingPage";
import AboutPage from "./pages/AboutPage";
import StartupPackagePage from "./pages/StartupPackage";
import BusinessPackagePage from "./pages/BusinessPackage";
import EnterprisePackagePage from "./pages/EnterprisePackage";
import ArchitectureDetail from "./pages/ArchitectureDetail";
import BusinessDetail from "./pages/BusinessDetail";
import EnterpriseDetail from "./pages/EnterpriseDetail";
import ElitePlanPage from "./pages/ElitePlanPage";
import ClientProjects from "./pages/ClientProjects";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

function AppLayout() {
  const location = useLocation();
  const isAboutPage = location.pathname === "/about";
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
      </main>
      {!isDashboardPage && <Footer />}
      {!isDashboardPage && <LanguageSwitcher />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
