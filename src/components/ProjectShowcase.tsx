"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const projectData = [
  { videoSrc: "https://cdn.pixabay.com/video/2023/10/20/185834-876383634_large.mp4", siteUrl: "#", projectName: "Project Alpha" },
  { videoSrc: "https://cdn.pixabay.com/video/2020/09/24/50921-463287340_large.mp4", siteUrl: "#", projectName: "Project Beta" },
  { videoSrc: "https://cdn.pixabay.com/video/2023/11/05/187848-881514781_large.mp4", siteUrl: "#", projectName: "Project Gamma" },
  { videoSrc: "https://cdn.pixabay.com/video/2022/01/18/104689-666355675_large.mp4", siteUrl: "#", projectName: "Project Delta" },
  { videoSrc: "https://cdn.pixabay.com/video/2021/04/12/70881-537449339_large.mp4", siteUrl: "#", projectName: "Project Epsilon" },
  { videoSrc: "https://cdn.pixabay.com/video/2021/01/21/62740-504313364_large.mp4", siteUrl: "#", projectName: "Project Zeta" },
];

const StatItem = ({ end, suffix = "", label }: { end: string; suffix?: string; label: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const targetValue = parseInt(end.replace(/[^0-9]/g, ""));
    const isK = end.includes("K");
    
    ScrollTrigger.create({
      trigger: ref.current,
      start: "top 90%",
      onEnter: () => {
        setCount(0); // Reset before starting
        gsap.to({ val: 0 }, {
          val: targetValue,
          duration: 2,
          ease: "power2.out",
          onUpdate: function() {
            setCount(Math.floor(this.targets()[0].val));
          }
        });
      },
      onEnterBack: () => {
        setCount(0);
        gsap.to({ val: 0 }, {
          val: targetValue,
          duration: 2,
          ease: "power2.out",
          onUpdate: function() {
            setCount(Math.floor(this.targets()[0].val));
          }
        });
      }
    });
  }, [end]);

  return (
    <div ref={ref} className="text-center px-2 flex flex-col items-center">
      <div className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter">
        {count}{end.includes("+") ? "+" : ""}{end.includes("K") ? "K" : ""}
      </div>
      <div className="text-[10px] md:text-[11px] font-black text-white tracking-[0.4em] uppercase whitespace-nowrap">
        {label}
      </div>
    </div>
  );
};

export default function ProjectShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const track1Ref = useRef<HTMLDivElement>(null);
  const track2Ref = useRef<HTMLDivElement>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHoveringCard, setIsHoveringCard] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!track1Ref.current || !track2Ref.current) return;

    const setupInfiniteScroll = (track: HTMLDivElement, direction: 1 | -1) => {
      const items = gsap.utils.toArray(track.children);
      const totalWidth = track.scrollWidth / 2;
      
      const animation = gsap.to(track, {
        x: direction === 1 ? -totalWidth : 0,
        xPercent: direction === 1 ? 0 : 0,
        repeat: -1,
        duration: 40,
        ease: "none",
        modifiers: {
          x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth)
        }
      });

      if (direction === -1) {
        gsap.set(track, { x: -totalWidth });
        animation.vars.x = 0;
        animation.invalidate();
      }

      // Parallax scroll speed
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const velocity = self.getVelocity() / 1000;
          gsap.to(animation, {
            timeScale: 1 + Math.abs(velocity) * 0.5,
            duration: 0.5
          });
        }
      });

      return animation;
    };

    const anim1 = setupInfiniteScroll(track1Ref.current, 1);
    const anim2 = setupInfiniteScroll(track2Ref.current, -1);

    // Pause on hover
    const pauseOnHover = (track: HTMLDivElement, anim: gsap.core.Animation) => {
      track.addEventListener("mouseenter", () => gsap.to(anim, { timeScale: 0.1, duration: 0.8 }));
      track.addEventListener("mouseleave", () => gsap.to(anim, { timeScale: 1, duration: 0.8 }));
    };

    pauseOnHover(track1Ref.current, anim1);
    pauseOnHover(track2Ref.current, anim2);

    return () => {
      anim1.kill();
      anim2.kill();
    };
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative bg-black text-white py-32 overflow-hidden"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 100%, rgba(35, 35, 50, 0.6) 0%, rgba(0, 0, 0, 1) 80%)'
      }}
    >
      {/* Custom Cursor */}
      <AnimatePresence>
        {isHoveringCard && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed pointer-events-none z-[9999] mix-blend-difference hidden md:flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            style={{ left: cursorPos.x, top: cursorPos.y }}
          >
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-black text-[10px] font-bold tracking-widest">
              VISITER
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 text-center mb-24 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-6xl font-black mb-8 tracking-tighter"
        >
          NOS RÉALISATIONS PROUVÉES
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ delay: 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
        >
          Des architectures fluides, des designs immersifs et une conversion optimisée. Cliquez sur un projet pour explorer son univers.
        </motion.p>
      </div>

      {/* Video Showcases */}
      <div className="relative flex flex-col gap-[40px] mt-[100px] mb-12 -rotate-2 scale-100">
        {/* Top Row - Scrolling Right */}
        <div className="overflow-hidden flex">
          <div ref={track1Ref} className="flex gap-[40px] whitespace-nowrap">
            {[...projectData, ...projectData].map((project, i) => (
              <ProjectCard key={`p1-${i}`} project={project} onHover={setIsHoveringCard} />
            ))}
          </div>
        </div>

        {/* Bottom Row - Scrolling Left */}
        <div className="overflow-hidden flex">
          <div ref={track2Ref} className="flex gap-[40px] whitespace-nowrap">
            {[...projectData, ...projectData].map((project, i) => (
              <ProjectCard key={`p2-${i}`} project={project} onHover={setIsHoveringCard} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-32 text-center pb-12">
        <Link 
          to="/client-projects" 
          className="inline-flex items-center justify-center px-12 py-4 rounded-full border border-white/20 text-xs font-bold tracking-[0.3em] text-white overflow-hidden group relative z-20"
        >
          <span className="relative z-10 transition-colors duration-500 group-hover:text-black uppercase">PROJETS RÉALISÉS</span>
          <div className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[0.16,1,0.3,1]" />
        </Link>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 mt-48 grid grid-cols-2 lg:grid-cols-4 gap-y-16 gap-x-8">
        <StatItem end="48" label="EXPERT TEAM MEMBER" />
        <StatItem end="20+" label="YEARS OF EXPERIENCE" />
        <StatItem end="25" label="AWARDS WINNING" />
        <StatItem end="2K" label="PROJECT'S COMPLETE" />
      </div>
    </section>
  );
}

function ProjectCard({ project, onHover }: { project: any; onHover: (v: boolean) => void; key?: any }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(videoRef, { amount: 0.1 });

  useEffect(() => {
    if (videoRef.current) {
      if (isInView) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView]);

  return (
    <a 
      href={project.siteUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block relative w-[256px] md:w-[360px] aspect-video rounded-xl overflow-hidden group cursor-none flex-shrink-0 bg-white/5 border border-white/10"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-0 data-[loaded=true]:opacity-100"
        muted
        loop
        playsInline
        onCanPlay={(e) => (e.currentTarget.dataset.loaded = "true")}
      >
        <source src={project.videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
      <div className="absolute bottom-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-white text-xs font-bold tracking-widest uppercase bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          {project.projectName}
        </span>
      </div>
    </a>
  );
}
