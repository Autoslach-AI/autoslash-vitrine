import * as React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { RainbowButton } from './ui/rainbow-borders-button';

export const ActionCta = () => {
  return (
    <section className="relative py-32 px-6 flex flex-col items-center justify-center bg-black overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center space-y-8"
        >
          {/* THE RAINBOW BUTTON */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RainbowButton className="px-10 py-5">
              <>
                <span className="text-white text-xl md:text-2xl font-black tracking-tight">
                  Passer à l'action
                </span>
                <ArrowRight className="text-white w-6 h-6 ml-2" />
              </>
            </RainbowButton>
          </motion.div>
          
          <p className="text-white/40 text-sm md:text-base font-medium tracking-[0.2em] uppercase pt-4">
            Autoslash AI — Le Futur est Automatisé
          </p>
        </motion.div>
      </div>

      {/* Decorative lines or patterns could go here, but keeping it clean like the image */}
    </section>
  );
};
