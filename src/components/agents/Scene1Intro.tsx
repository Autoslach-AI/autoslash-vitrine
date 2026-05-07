/**
 * Scene1Intro.tsx
 * ───────────────
 * Sphère portail Three.js — orange → bleu
 * Scroll : zoom progressif vers le portail
 * Crash  : flash blanc → onComplete()
 *
 * Dépendance : npm install three @types/three
 */

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import * as THREE from "three";

// ── Shader bruit Simplex 3D (Ian McEwan / Stefan Gustavson) ──────────────────
const NOISE_3D = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);
  const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.0-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+2.0*C.xxx;
  vec3 x3=x0-1.0+3.0*C.xxx;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(
    i.z+vec4(0.0,i1.z,i2.z,1.0))
    +i.y+vec4(0.0,i1.y,i2.y,1.0))
    +i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;
  vec4 s1=floor(b1)*2.0+1.0;
  vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
  m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

interface Scene1Props {
  onComplete: () => void;
}

export default function Scene1Intro({ onComplete }: Scene1Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);

  const triggerComplete = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    // ── Scene & Camera ─────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    const CAM_START_Z = 4;
    const CAM_END_Z = -0.5; // passe à travers le portail
    camera.position.set(0, 0, CAM_START_Z);

    // ── Uniforms ───────────────────────────────────────────────────────────
    const uniforms = {
      time:     { value: 0 },
      progress: { value: 0 }, // 0 = loin, 1 = crash
    };

    // ── Sphère centrale avec shader bleu ──────────────────────────────────
    const sphereGeo = new THREE.SphereGeometry(0.75, 64, 32);
    const sphereMat = new THREE.MeshBasicMaterial({ color: "#000" });
    sphereMat.onBeforeCompile = (shader) => {
        shader.uniforms.time     = uniforms.time;
        shader.uniforms.progress = uniforms.progress;
        shader.vertexShader = `
          varying vec3 vPos;
          varying vec3 mvPos;
          varying vec3 vNor;
          ${shader.vertexShader}
        `.replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
            vPos  = position;
            mvPos = -vec3(modelViewMatrix * vec4(position, 1.));
            vNor  = normalMatrix * normal;
          `
        );
        shader.fragmentShader = `
          uniform float time;
          uniform float progress;
          varying vec3 vPos;
          varying vec3 mvPos;
          varying vec3 vNor;
          ${NOISE_3D}
          ${shader.fragmentShader}
        `.replace(
          `#include <color_fragment>`,
          `#include <color_fragment>
          // Bleu Autoslash AI — de #0066ff (loin) → #60c8ff (proche)
          vec3 baseCol = mix(
            vec3(0.0, 0.4, 1.0),
            vec3(0.376, 0.784, 1.0),
            progress
          );

          vec3 col = vec3(0);

          float fDot  = dot(normalize(mvPos), normalize(vNor));
          float haloF = smoothstep(-0.25, 0.4, fDot) - smoothstep(0.4, 0.875, fDot);
          haloF = pow(haloF, 2.);
          col = mix(col, baseCol, haloF * 0.5);

          float fN   = snoise(vec3(vPos.xz * 3., time * 0.5)) * 0.1;
          float colF = 1. - smoothstep(-0.7 + fN, 0.75, vPos.y);
          colF = pow(colF, 4.);
          colF = 0.05 + colF * 0.95;
          col  = mix(col, baseCol, colF);

          diffuseColor.rgb = col;
          `
        );
    };
    (sphereMat as any).defines = { USE_UV: "" };
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    sphere.position.y = -0.25;

    // ── Pyramide / Hut (triangle bleu) ────────────────────────────────────
    const hutGeo = new THREE.CylinderGeometry(2, 2, 4, 3, 1, true)
      .rotateX(Math.PI * 0.5)
      .rotateZ(Math.PI);
    const hutMat = new THREE.MeshLambertMaterial({
      color: "#1a4aff",
      side: THREE.BackSide,
      emissive: new THREE.Color("#0033aa"),
      emissiveIntensity: 0.3,
    });
    const hut = new THREE.Mesh(hutGeo, hutMat);

    // ── Lumière point bleue ────────────────────────────────────────────────
    const pointLight = new THREE.PointLight(0x0066ff, 5, 2, 5);
    pointLight.position.set(0, -0.25, 0);

    // ── Anneau de portail ─────────────────────────────────────────────────
    const ringGeo = new THREE.TorusGeometry(0.82, 0.04, 16, 120);
    const ringMat = new THREE.MeshBasicMaterial({ color: "#60c8ff" });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = -0.25;

    // ── Particules orbitales ───────────────────────────────────────────────
    const particleCount = 300;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI;
      const r     = 0.85 + Math.random() * 0.3;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) - 0.25;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: "#60c8ff",
      size: 0.015,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);

    scene.add(pointLight, hut, sphere, ring, particles);

    // ── Scroll → progress ─────────────────────────────────────────────────
    let scrollY      = 0;
    let targetScroll = 0;
    const MAX_SCROLL = 600; // px pour traverser le portail

    const onWheel = (e: WheelEvent) => {
      targetScroll = Math.min(Math.max(targetScroll + e.deltaY * 0.6, 0), MAX_SCROLL);
    };
    const onTouch = (() => {
      let startY = 0;
      const start = (e: TouchEvent) => { startY = e.touches[0].clientY; };
      const move  = (e: TouchEvent) => {
        const dy = startY - e.touches[0].clientY;
        targetScroll = Math.min(Math.max(targetScroll + dy * 1.2, 0), MAX_SCROLL);
        startY = e.touches[0].clientY;
      };
      return { start, move };
    })();

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouch.start, { passive: true });
    window.addEventListener("touchmove",  onTouch.move,  { passive: true });

    // ── Resize ────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ────────────────────────────────────────────────────
    let raf: number;
    let t = 0;
    let crashed = false;

    const animate = () => {
      raf = requestAnimationFrame(animate);

      // Smooth scroll
      scrollY += (targetScroll - scrollY) * 0.05;
      const progress = Math.min(scrollY / MAX_SCROLL, 1);

      // Le temps (t) suit maintenant le scroll pour figer les effets textures/rotations
      const t = scrollY * 0.01;

      uniforms.time.value     = t;
      uniforms.progress.value = progress;

      // Camera zoom
      camera.position.z = CAM_START_Z + (CAM_END_Z - CAM_START_Z) * progress;

      // Rotation et animations liées au scroll
      sphere.rotation.y   = scrollY * 0.001;
      ring.rotation.x     = scrollY * 0.0005;
      ring.rotation.y     = scrollY * 0.0008;
      particles.rotation.y = scrollY * 0.0006;
      hut.rotation.z      = Math.sin(scrollY * 0.002) * 0.02;

      // Glow ring au fur et à mesure du zoom
      (ringMat as THREE.MeshBasicMaterial).color.setHSL(
        0.58, 1, 0.5 + progress * 0.3
      );

      // Crash
      if (progress >= 0.98 && !crashed) {
        crashed = true;
        triggerComplete();
      }

      renderer.render(scene, camera);
    };

    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouch.start);
      window.removeEventListener("touchmove",  onTouch.move);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      hutGeo.dispose();
      hutMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [triggerComplete]);

  return (
    <div className="fixed inset-0 z-10 bg-black overflow-hidden">
      {/* Canvas Three.js */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* Overlay texte bas */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-12 pointer-events-none z-20">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-2 mb-6"
        >
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-blue-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span
            className="text-white/25 text-[10px] font-bold tracking-[0.6em] uppercase"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Autoslash AI
          </span>
        </motion.div>

        {/* Titre principal */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-6xl font-black text-white text-center leading-tight mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Entrez dans l'écosystème
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="text-white/30 text-sm mb-10"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          L'intelligence artificielle au service de votre croissance
        </motion.p>

        {/* Hint scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ delay: 2.5, duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span
            className="text-white/20 text-[10px] font-bold uppercase tracking-widest"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Scrollez pour entrer
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
}
