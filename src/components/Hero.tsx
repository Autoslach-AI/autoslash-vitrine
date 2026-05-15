'use client'

import React from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'
import MotionButton from './ui/motion-button'
import { AnimatedGroup } from './ui/animated-group'
import { Badge } from './ui/badge'
import { motion } from 'motion/react'
import { ContainerScroll } from './ui/container-scroll-animation'
import { SplineSceneBasic } from './SplineHeroContent'

const transitionVariants: any = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export default function Hero({ onCTAClick }: { onCTAClick?: (dest: string) => void }) {
    return (
        <main className="overflow-hidden bg-brand-bg relative pt-20">
            {/* Decorative Background Elements */}
            <div
                aria-hidden
                className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
            </div>

            <section className="relative">
                <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]"></div>
                
                <ContainerScroll
                    titleComponent={
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center">
                                <AnimatedGroup variants={transitionVariants}>
                                    <h1 className="mt-20 max-w-5xl mx-auto text-balance text-6xl md:text-7xl xl:text-[5.5rem] text-white font-medium leading-[1.1]">
                                        L'IA qui travaille, vous qui dominez.
                                    </h1>
                                    <h2 className="sr-only">Solutions d'automation intelligentes</h2>
                                    <p className="mx-auto mt-8 max-w-xl text-balance text-lg md:text-xl text-white/60">
                                        Des agents IA entraînés sur vos données. Livrés en moins de 7 jours. Opérationnels 24h/24.
                                    </p>
                                </AnimatedGroup>

                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.1,
                                                    delayChildren: 0.8,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-8 md:flex-row">
                                    <div 
                                        onClick={() => onCTAClick?.("/pricing")}
                                        className="cursor-pointer"
                                    >
                                        <MotionButton label="Démarrer" />
                                    </div>
                                    <div className="flex items-center">
                                        <Badge 
                                            text="Voir la démo" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                const el = document.getElementById('video-section');
                                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                                            }} 
                                        />
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </div>
                    }
                >
                    <div className="relative h-full w-full overflow-hidden">
                        <SplineSceneBasic />
                    </div>
                </ContainerScroll>
            </section>
        </main>
    )
}
