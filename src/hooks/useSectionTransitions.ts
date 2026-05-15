import { useEffect, useRef } from "react";

export type TransitionType = "reveal-vertical" | "reveal-clip" | "scale-fade";

export function useSectionTransitions() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("section-visible");
          entry.target.classList.remove("exit-above");
        } else {
          entry.target.classList.remove("section-visible");
          
          // Determine if it exited above or below
          const rect = entry.boundingClientRect;
          if (rect.top < 0) {
            entry.target.classList.add("exit-above");
          } else {
            entry.target.classList.remove("exit-above");
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    
    // Find all sections with transition classes
    const sections = containerRef.current?.querySelectorAll(".st-type-a, .st-type-b, .st-type-c") || [];
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return { containerRef };
}
