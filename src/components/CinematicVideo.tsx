"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useScroll, useTransform, useInView } from "motion/react";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from "lucide-react";
import { cn } from "../lib/utils";
import HeroText from "./ui/hero-shutter-text";

export default function CinematicVideo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isActivated, setIsActivated] = useState(false);

  const isInView = useInView(containerRef, { amount: 0.1 });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const videoY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  
  // Custom zoom entry for SERVICE - text
  const zoomScroll = useScroll({
    target: containerRef,
    offset: ["start end", "start center"]
  });
  
  const heroScale = useTransform(zoomScroll.scrollYProgress, [0, 1], [0.1, 1]);
  const heroOpacity = useTransform(zoomScroll.scrollYProgress, [0, 0.3, 1], [0, 1, 1]);
  
  useEffect(() => {
    if (videoRef.current && isActivated) {
      if (isInView && isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView, isPlaying, isActivated]);

  const handleActivate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActivated(true);
    // Auto-unmute on first activation for better experience since user clicked
    setHasInteracted(true);
    setIsMuted(false);
    setIsPlaying(true);
  };

  // Custom cursor position
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 300 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
      
      // Show controls on movement
      setShowControls(true);
      const timeout = setTimeout(() => {
        if (isPlaying && !isMuted) setShowControls(false);
      }, 3000);
      return () => clearTimeout(timeout);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isPlaying, isMuted]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        // Pausing: Reset and go back to Service screen
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
        setIsActivated(false);
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMainClick = () => {
    if (!hasInteracted) {
      // First click: Unmute and restart
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.currentTime = 0;
        videoRef.current.play();
        setIsMuted(false);
        setIsPlaying(true);
        setHasInteracted(true);
      }
    } else {
      // Subsequent clicks: Pause and Reset
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
          setIsActivated(false);
        } else {
          videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const clickedPos = (x / rect.width) * videoRef.current.duration;
      videoRef.current.currentTime = clickedPos;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <section 
      id="video-section"
      ref={containerRef}
      className="relative w-full h-[120vh] bg-black overflow-hidden cursor-none"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={!isActivated ? handleActivate : handleMainClick}
    >
      <AnimatePresence mode="wait">
        {!isActivated ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black"
          >
            {/* Background Texture/Grain for extra appeal */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            
            <motion.div
              style={{ scale: heroScale, opacity: heroOpacity }}
              className="flex flex-col items-center justify-center"
            >
              <HeroText 
                text="SERVICE -" 
                className="mb-4 select-none bg-transparent h-auto w-auto" 
              />
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleActivate}
              className="group relative flex items-center justify-center p-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-500 hover:bg-white/10 hover:border-white/20"
            >
              <div className="absolute inset-0 rounded-full bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Play size={40} className="text-white fill-white translate-x-1" />
            </motion.button>
            
            <p className="mt-12 text-[10px] uppercase tracking-[0.5em] text-white/30 font-bold">Cliquez pour l'immersion</p>
          </motion.div>
        ) : (
          <motion.div 
            key="video-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0"
          >
            {/* Parallax Video Container */}
            <motion.div 
              className="absolute inset-0 w-full h-[140%] -top-[20%]"
              style={{ y: videoY }}
            >
              <video
                ref={videoRef}
                className={cn(
                  "w-full h-full object-cover transition-opacity duration-1000",
                  isLoaded ? "opacity-100" : "opacity-0"
                )}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onCanPlay={() => setIsLoaded(true)}
              >
                <source src="https://cdn.pixabay.com/video/2023/10/20/185834-876383634_large.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </motion.div>

            {/* Loading Placeholder for video */}
            {!isLoaded && (
              <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Cursor */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            style={{ x: cursorX, y: cursorY }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-0 left-0 pointer-events-none z-[100] flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          >
            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl">
              <span className="text-white font-bold text-sm uppercase tracking-widest">
                {!hasInteracted ? "Voir" : isPlaying ? "Pause" : "Play"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Controls UI */}
      <AnimatePresence>
        {hasInteracted && (showControls || !isPlaying) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 p-8 z-50 bg-gradient-to-t from-black/80 to-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div 
              className="group relative w-full h-1.5 bg-white/20 rounded-full mb-6 cursor-pointer overflow-hidden"
              onClick={handleSeek}
            >
              <motion.div 
                className="absolute top-0 left-0 h-full bg-white rounded-full"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity bg-white/10" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={togglePlay}
                  className="text-white hover:scale-110 transition-transform"
                >
                  {isPlaying ? <Pause size={24} fill="white" /> : <Play size={24} fill="white" />}
                </button>

                <div className="flex items-center gap-4">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                      if (videoRef.current) videoRef.current.muted = !isMuted;
                    }}
                    className="text-white hover:scale-110 transition-transform"
                  >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                  </button>
                  <span className="text-white/70 text-sm font-mono">
                    {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (videoRef.current?.requestFullscreen) {
                      videoRef.current.requestFullscreen();
                    }
                  }}
                  className="text-white hover:scale-110 transition-transform"
                >
                  <Maximize size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Initial Mute Indicator */}
      {isMuted && hasInteracted === false && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="p-6 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
              <VolumeX size={48} className="text-white" />
            </div>
            <p className="text-white font-bold uppercase tracking-[0.3em] text-xs">Cliquez pour le son</p>
          </motion.div>
        </div>
      )}
    </section>
  );
}
