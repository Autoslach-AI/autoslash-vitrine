"use client";

import React from "react";
import { motion, useScroll, useTransform, MotionValue } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "../lib/utils";

const bentoImages = [
  {
    type: "circle",
    content: (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-50 to-emerald-200 flex items-center justify-center relative overflow-hidden border border-emerald-100">
            <div className="w-[75%] h-[75%] rounded-full bg-white shadow-2xl flex flex-col items-center justify-center text-neutral-800">
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Peak Time</span>
                <span className="text-6xl font-black tabular-nums">74</span>
                <span className="text-[10px] text-neutral-400 font-medium">Indoor 72</span>
            </div>
            {/* The outer green ring effect */}
            <div className="absolute inset-0 border-[12px] border-emerald-400/20 rounded-full" />
        </div>
    ),
    className: "col-span-12 md:col-span-6 aspect-square",
  },
  {
    type: "phone",
    image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1974&auto=format&fit=crop", // An iPhone screen looking image
    className: "col-span-12 md:col-span-6 aspect-square",
    title: "Eco Power App"
  },
  {
      type: "grey",
      image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop",
      className: "col-span-12 md:col-span-3 aspect-square",
  },
  {
      type: "arrow",
      content: (
          <div className="w-full h-full bg-[#d2a688] flex items-center justify-center rounded-2xl group-hover:scale-105 transition-transform duration-500">
              <ArrowUpRight className="text-white w-10 h-10 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
      ),
      className: "col-span-12 md:col-span-5 aspect-[1.5/1]",
  },
  {
      type: "hand",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2070&auto=format&fit=crop",
      className: "col-span-12 md:col-span-4 aspect-square",
  }
];

const cardData = [
  {
    id: "01",
    title: "Produits et plateformes",
    description: "Nous concevons, développons et optimisons les sites web, applications et plateformes de marque et de commerce pour favoriser la croissance et la productivité.",
    bentoImages: [
      {
        type: "circle",
        content: (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-50 to-emerald-200 flex items-center justify-center relative overflow-hidden border border-emerald-100 shadow-inner">
                <div className="w-[75%] h-[75%] rounded-full bg-white shadow-2xl flex flex-col items-center justify-center text-neutral-800">
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mb-1">Peak Time</span>
                    <span className="text-5xl font-black tabular-nums">74</span>
                    <span className="text-[10px] text-neutral-400 font-medium">Indoor 72</span>
                </div>
            </div>
        ),
        className: "col-span-6 aspect-square",
      },
      {
        type: "phone",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1974&auto=format&fit=crop",
        className: "col-span-6 aspect-square",
      },
      {
          type: "grey",
          image: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop",
          className: "col-span-3 aspect-square",
      },
      {
          type: "arrow",
          content: (
              <div className="w-full h-full bg-[#d2a688] flex items-center justify-center rounded-2xl">
                  <ArrowUpRight className="text-white w-8 h-8" />
              </div>
          ),
          className: "col-span-5 aspect-[1.5/1]",
      },
      {
          type: "hand",
          image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=2070&auto=format&fit=crop",
          className: "col-span-4 aspect-square",
      }
    ]
  },
  {
    id: "02",
    title: "Stratégie et Design",
    description: "Nous définissons l'identité de votre marque à travers des recherches approfondies et un design centré sur l'utilisateur, créant des expériences mémorables.",
    bentoImages: [
      {
        type: "visual",
        image: "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1964&auto=format&fit=crop",
        className: "col-span-6 aspect-square",
      },
      {
        type: "palette",
        content: (
            <div className="w-full h-full bg-neutral-900 flex flex-col gap-1 p-2 rounded-2xl">
                <div className="flex-1 bg-[#3b82f6] rounded-lg" />
                <div className="flex-1 bg-[#60a5fa] rounded-lg" />
                <div className="flex-1 bg-[#93c5fd] rounded-lg" />
            </div>
        ),
        className: "col-span-6 aspect-square",
      },
      {
          type: "abstract",
          image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
          className: "col-span-4 aspect-square",
      },
      {
          type: "black",
          content: (
              <div className="w-full h-full bg-[#111] flex flex-col justify-end p-4 rounded-2xl text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Vision</span>
                  <span className="text-sm font-medium">Identity System</span>
              </div>
          ),
          className: "col-span-5 aspect-[1.5/1]",
      },
      {
          type: "photo",
          image: "https://images.unsplash.com/photo-1507208773393-4019ce3c0d0b?q=80&w=1974&auto=format&fit=crop",
          className: "col-span-3 aspect-square",
      }
    ]
  },
  {
    id: "03",
    title: "Ingénierie et IA",
    description: "Nos solutions techniques exploitent l'intelligence artificielle pour automatiser vos processus et offrir une scalabilité sans précédent à vos outils.",
    bentoImages: [
      {
        type: "ai",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",
        className: "col-span-6 aspect-square",
      },
      {
        type: "code",
        content: (
            <div className="w-full h-full bg-[#1e1e1e] p-4 font-mono text-[10px] text-emerald-400 flex flex-col gap-1 rounded-2xl">
                <div className="opacity-40">const innovate = (idea) ={">"} ...</div>
                <div className="pl-4">{"{"} solution: "AI-Powered" {"}"}</div>
                <div className="mt-auto text-emerald-100 font-bold">Status: Optimized</div>
            </div>
        ),
        className: "col-span-6 aspect-square",
      },
      {
          type: "blue",
          image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
          className: "col-span-4 aspect-square",
      },
      {
          type: "node",
          content: (
              <div className="w-full h-full bg-cyan-950 flex items-center justify-center rounded-2xl">
                  <div className="w-8 h-8 rounded-full border-2 border-cyan-400 animate-pulse flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  </div>
              </div>
          ),
          className: "col-span-5 aspect-[1.5/1]",
      },
      {
          type: "tech",
          image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
          className: "col-span-3 aspect-square",
      }
    ]
  },
  {
    id: "04",
    title: "Croissance et Performance",
    description: "Nous accélérons votre succès commercial grâce à des stratégies data-driven et une optimisation continue du tunnel de conversion.",
    bentoImages: [
      {
        type: "chart",
        image: "https://images.unsplash.com/photo-1551288049-bbbda5366391?q=80&w=2070&auto=format&fit=crop",
        className: "col-span-7 aspect-square",
      },
      {
        type: "kpi",
        content: (
            <div className="w-full h-full bg-orange-500 flex flex-col items-center justify-center p-6 rounded-2xl text-white">
                <span className="text-4xl font-black">+142%</span>
                <span className="text-[10px] uppercase font-bold tracking-widest mt-2">Conversion Rate</span>
            </div>
        ),
        className: "col-span-5 aspect-square",
      },
      {
          type: "growth",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
          className: "col-span-4 aspect-square",
      },
      {
          type: "speed",
          content: (
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center rounded-2xl">
                  <div className="text-center">
                      <div className="text-3xl font-black text-black">99/100</div>
                      <div className="text-[10px] text-neutral-400 uppercase">Core Web Vitals</div>
                  </div>
              </div>
          ),
          className: "col-span-8 aspect-[2/1]",
      }
    ]
  },
  {
    id: "05",
    title: "Cloud et Infrastructure",
    description: "Nous bâtissons des architectures robustes et sécurisées, garantissant une haute disponibilité pour vos services critiques partout dans le monde.",
    bentoImages: [
      {
        type: "server",
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2070&auto=format&fit=crop",
        className: "col-span-6 aspect-square",
      },
      {
        type: "network",
        content: (
            <div className="w-full h-full bg-blue-600 flex items-center justify-center rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:20px_20px]" />
                <span className="text-white text-xs font-bold uppercase tracking-widest relative z-10">Global Network</span>
            </div>
        ),
        className: "col-span-6 aspect-square",
      },
      {
          type: "security",
          image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop",
          className: "col-span-4 aspect-square",
      },
      {
          type: "uptime",
          content: (
              <div className="w-full h-full bg-emerald-500 flex flex-col justify-end p-6 rounded-2xl text-white">
                  <span className="text-3xl font-black">99.99%</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest">SLA Uptime</span>
              </div>
          ),
          className: "col-span-5 aspect-[1.5/1]",
      },
      {
          type: "shield",
          image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop",
          className: "col-span-3 aspect-square",
      }
    ]
  }
];

interface CharacterProps {
  char: string;
  index: number;
  centerIndex: number;
  range: [number, number];
  progress: MotionValue<number>;
  className?: string;
  isOrange?: boolean;
  key?: React.Key;
}

const CharacterV1 = React.memo(({
  char,
  index,
  centerIndex,
  range,
  progress,
  className,
  isOrange = false
}: CharacterProps) => {
  const isSpace = char === " ";
  
  // Natural Rise Timing
  const transitionSize = 0.25; 
  const input = [range[0] - transitionSize, range[0], range[1], range[1] + transitionSize];
  const isInitial = range[0] <= 0.05;
  const effectiveInput = isInitial ? [0, range[1], range[1] + transitionSize] : input;

  // Vertical Movement: Higher vertical travel for a "natural" feel
  // It moves continuously: [Coming up, slow climb through center, fast climb out]
  const y = useTransform(
    progress, 
    effectiveInput, 
    isInitial 
      ? [0, -40, -600] // Start anchored, small climb, then fly out
      : [600, 40, -40, -600] // Come from deep bottom, slow climb through eye-level, fly out
  );

  const scale = useTransform(progress, effectiveInput, isInitial ? [1, 1, 1.4] : [0.6, 1, 1, 1.4]);
  const opacity = useTransform(progress, effectiveInput, isInitial ? [1, 1, 0] : [0, 1, 1, 0]);
  const blurValue = useTransform(progress, effectiveInput, isInitial ? ["0px", "0px", "20px"] : ["25px", "0px", "0px", "25px"]);
  const blur = useTransform(blurValue, (v) => v === "0px" ? "none" : `blur(${v})`);

  return (
    <motion.span
      className={cn(
          "inline-block will-change-transform", 
          isSpace && "w-[0.25em]",
          isOrange && "text-orange-500",
          className
      )}
      style={{ 
        y,
        scale,
        opacity, 
        filter: blur,
        transformStyle: "preserve-3d",
        color: isOrange ? undefined : "#000000",
        fontWeight: 900,
        textRendering: "optimizeLegibility",
        WebkitFontSmoothing: "antialiased"
      }}
    >
      {char}
    </motion.span>
  );
});

CharacterV1.displayName = "CharacterV1";

function IntroSequence({ progress }: { progress: MotionValue<number> }) {
  const intro1Text = "PARTENAIRE -";
  
  const intro1Chars = React.useMemo(() => intro1Text.split(""), []);
  const intro1Center = Math.floor(intro1Chars.length / 2);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Stage 1: PARTENAIRE - (Noir Vif, Positioned Lower, 1s Delay + Blur Reveal) */}
      <motion.div 
          initial={{ opacity: 0, filter: "blur(20px)" }}
          whileInView={{ opacity: 1, filter: "blur(0px)" }}
          viewport={{ once: true, amount: 0.01, margin: "0px 0px -50px 0px" }}
          transition={{ 
            delay: 1, 
            duration: 1, 
            ease: "easeOut" 
          }}
          className="absolute inset-0 flex items-center justify-center p-8"
      >
          {/* translate-y-32 (~128px) to push it down about 5cm from center */}
          <div className="text-[14vw] font-black tracking-[-0.05em] leading-none text-center flex flex-wrap justify-center text-[#000000] translate-y-32">
              {intro1Chars.map((char, index) => (
                  <CharacterV1 
                      key={index}
                      char={char}
                      index={index}
                      centerIndex={intro1Center}
                      range={[0, 0.8]} // Extended duration since Stage 2 is removed
                      progress={progress}
                      className="text-black"
                  />
              ))}
          </div>
      </motion.div>
    </div>
  );
}

export default function ProductsPlatform() {
  const containerRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Structural Split:
  // 0.0 -> 0.5: Intro Sequence
  // 0.5 -> 1.0: Horizontal Gallery

  const introProgress = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const horizontalProgress = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

  const horizontalOpacity = useTransform(horizontalProgress, [0, 0.1], [0, 1]);
  // 5 cards: 0%, -20%, -40%, -60%, -80%. To see the last card, we move by (5-1)*20% = 80%
  const translateX = useTransform(horizontalProgress, [0.15, 1], ["0%", "-80%"]);
  
  const introDisplay = useTransform(scrollYProgress, (v: number) => v < 0.52 ? "block" : "none");
  const horizontalDisplay = useTransform(scrollYProgress, (v: number) => v >= 0.48 ? "flex" : "none");

  // Progress steps for the side indicator
  const steps = [
    { label: "Intro", range: [0, 0.5] },
    { label: "Projets", range: [0.5, 1.0] }
  ];

  return (
    <section ref={containerRef} className="relative bg-white text-black h-[900vh]">
      {/* Scroll Progress Side Indicator */}
      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] hidden lg:flex flex-col gap-4">
        {steps.map((step, i) => {
          const isActive = useTransform(scrollYProgress, (v) => v >= step.range[0] && v <= step.range[1]);
          return (
            <div key={i} className="flex flex-col items-end group cursor-pointer">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {step.label}
              </span>
              <div className="w-12 h-[2px] bg-neutral-100 relative overflow-hidden">
                <motion.div 
                  style={{ 
                    scaleX: useTransform(scrollYProgress, step.range as [number, number], [0, 1]),
                    transformOrigin: "left",
                    backgroundColor: "#000000"
                  }}
                  className="absolute inset-0"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-30 bg-white">
        
        {/* FIRST HALF: INTRO NARRATIVE (0% to 50% scroll) */}
        <motion.div style={{ display: introDisplay }} className="absolute inset-0 z-10 bg-white">
          <IntroSequence progress={introProgress} />
        </motion.div>

        {/* SECOND HALF: HORIZONTAL GALLERY (50% to 100% scroll) */}
        <motion.div 
            style={{ 
                x: translateX, 
                opacity: horizontalOpacity, 
                display: horizontalDisplay,
                willChange: "transform, opacity"
            }}
            className="absolute top-0 left-0 h-screen flex z-20 bg-white"
        >
          {cardData.map((card, cardIndex) => {
            // Calculate a local progress for this specific card
            // horizontalProgress goes 0.15 -> 1.0 (range of 0.85)
            // 5 cards: Card 0 is 0.0, Card 4 is 1.0
            const cardStep = 1 / (cardData.length - 1);
            const cardCenter = cardIndex * cardStep;
            
            // We want an effect that peaks when the card is centered
            const range = [cardCenter - 0.5, cardCenter, cardCenter + 0.5];
            
            // Subtle internal parallax for the elements
            const internalX = useTransform(horizontalProgress, range, [100, 0, -100]);
            const internalScale = useTransform(horizontalProgress, range, [0.92, 1, 0.92]);
            const internalOpacity = useTransform(horizontalProgress, range, [0.4, 1, 0.4]);

            return (
              <div 
                  key={card.id} 
                  className="w-screen h-screen flex items-center justify-center flex-shrink-0 px-6 md:px-12 lg:px-20 bg-white"
              >
                <motion.div 
                  style={{ 
                    x: internalX, 
                    scale: internalScale, 
                    opacity: internalOpacity,
                    willChange: "transform, opacity"
                  }}
                  className="max-w-[1200px] w-full mx-auto"
                >
                  {/* ID Header Only - Titles Removed */}
                  <div className="flex justify-end items-baseline mb-6 border-b border-neutral-100 pb-4">
                    <span className="text-[3vw] font-light text-neutral-200 tabular-nums">{card.id}</span>
                  </div>

                  {/* Card Content Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Left: Bento Grid */}
                    <div className="lg:col-span-6 grid grid-cols-12 gap-4">
                      {card.bentoImages.map((item, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ margin: "-100px" }}
                          transition={{ delay: i * 0.05, duration: 0.5 }}
                          className={cn(
                              "relative overflow-hidden group rounded-2xl",
                              item.className
                          )}
                        >
                          {item.content ? (
                              item.content
                          ) : (
                              <div className="w-full h-full relative overflow-hidden">
                                   <img 
                                      src={item.image} 
                                      alt="" 
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                      referrerPolicy="no-referrer"
                                  />
                              </div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Right: Text Description */}
                    <div className="lg:col-span-6 flex flex-col gap-8 text-black">
                      <motion.p 
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ margin: "-100px" }}
                        className="text-xl md:text-2xl lg:text-[1.75rem] font-medium tracking-tight text-neutral-900 leading-[1.25] antialiased"
                      >
                        {card.description}
                      </motion.p>
                      <motion.div
                          initial={{ opacity: 0, y: 15 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ margin: "-100px" }}
                      >
                          <button className="inline-flex bg-black text-white px-8 py-4 text-base font-bold items-center gap-3 transition-all hover:bg-neutral-900 group">
                              Explorer 
                              <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                          </button>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
