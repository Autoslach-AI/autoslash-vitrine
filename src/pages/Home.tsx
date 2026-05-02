import React from "react";
import Hero from "../components/Hero";
import Quote from "../components/Quote";
import Benefits from "../components/Benefits";
import SquareFlow from "../components/SquareFlow";
import CinematicVideo from "../components/CinematicVideo";
import ProductsPlatform from "../components/ProductsPlatform";
import ProjectShowcase from "../components/ProjectShowcase";
import { ProcessSection } from "../components/ProcessSection";
import DiscoverSection from "../components/DiscoverSection";

export default function Home() {
  return (
    <>
      <Hero />
      <Quote />
      <Benefits />
      <SquareFlow />
      <CinematicVideo />
      <ProductsPlatform />
      <ProjectShowcase />
      <ProcessSection />
      <DiscoverSection />
    </>
  );
}
