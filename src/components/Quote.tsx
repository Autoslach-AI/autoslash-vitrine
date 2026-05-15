import { motion, useScroll, useTransform } from "motion/react";
import { Star } from "lucide-react";
import { useRef } from "react";
import MotionButton from "./ui/motion-button";

const Word = ({ children, progress, range }: any) => {
  const opacity = useTransform(progress, range, [0.1, 1]);
  const blur = useTransform(progress, range, [6, 0]);
  const brightness = useTransform(progress, range, [0.5, 1.5]);
  const shadow = useTransform(progress, range, [0, 20]);
  
  const filter = useTransform(
    [blur, brightness],
    ([vBlur, vBright]) => `blur(${vBlur}px) brightness(${vBright})`
  );

  const textShadow = useTransform(shadow, (v) => `0 0 ${v}px rgba(255,255,255,0.4)`);

  return (
    <span className="relative inline-block mr-[0.25em]">
      <motion.span
        style={{ 
          opacity,
          filter,
          textShadow,
          color: useTransform(progress, range, ["rgba(255,255,255,0.1)", "rgba(255,255,255,1)"]),
        }}
        className="transition-all duration-300"
      >
        {children}
      </motion.span>
    </span>
  );
};

const PersonaItem = ({ children }: any) => {
  const itemRef = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start 60%", "start 45%", "start 30%"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.05, 1, 0.05]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1.08, 0.9]);
  const brightness = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1.8, 0.5]);
  
  const filter = useTransform(brightness, (v) => `brightness(${v})`);
  const textShadow = useTransform(scrollYProgress, [0, 0.5, 1], [
    "0 0 0px rgba(255,255,255,0)",
    "0 0 30px rgba(255,255,255,0.6)",
    "0 0 0px rgba(255,255,255,0)"
  ]);

  return (
    <motion.li
      ref={itemRef}
      style={{ opacity, scale, filter, textShadow }}
      className="text-3xl md:text-5xl lg:text-6xl font-bold py-5 will-change-transform whitespace-nowrap"
    >
      {children}
    </motion.li>
  );
};

export default function Quote({ onCTAClick }: { onCTAClick?: (dest: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });

  const animatedText = "Libérez-vous des tâches répétitives qui freinent votre impact pendant que vos concurrents s'arment d'IA. Autoslash AI déploie des solutions simples, sécurisées et de confiance pour vous faire gagner un temps précieux et multiplier vos revenus.";
  const words = animatedText.split(" ");

  const personas = [
    "Artiste",
    "Startup",
    "Étudiant",
    "Professionnel",
    "E-commerçant",
    "Entrepreneur",
    "Personne Ambitieuse",
    "Cabinet de Conseil"
  ];

  return (
    <section ref={containerRef} className="py-48 px-8 md:px-16 lg:px-20 relative min-h-[500vh] flex flex-col items-start justify-start">
      <div className="w-full text-left sticky top-1/4">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest font-bold text-white/50 mb-12"
        >
          <Star className="w-3 h-3 fill-white/50" />
          NOTRE VISION
        </motion.div>

        <div className="relative mb-16">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-medium leading-[1.6] tracking-tight text-white/40 flex flex-wrap max-w-lg">
            {words.map((word, i) => {
              const start = (i / words.length) * 0.15;
              const end = start + 0.05;
              return (
                <Word key={i} progress={scrollYProgress} range={[start, Math.min(end, 1)]}>
                  {word}
                </Word>
              );
            })}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-x-[380px] relative">
          <div className="sticky top-[45vh] z-10">
            <span className="text-2xl md:text-4xl lg:text-5xl font-bold text-white whitespace-nowrap opacity-100 tracking-tighter">
              QUE VOUS SOYEZ
            </span>
          </div>
          
          <ul className="list-none p-0 m-0 flex-1 pt-[10vh] pb-[20vh]">
            {personas.map((persona, i) => (
              <PersonaItem key={i}>
                {persona}
              </PersonaItem>
            ))}
          </ul>
        </div>

        <div className="mt-40 w-full flex justify-center">
          <div onClick={() => onCTAClick?.("/about")} className="block cursor-pointer">
            <MotionButton label="Découvrir" />
          </div>
        </div>
      </div>
    </section>
  );
}

