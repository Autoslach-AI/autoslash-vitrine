"use client";

import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import * as THREE from "three";
import { 
  HoverSlider, 
  HoverSliderImage, 
  HoverSliderImageWrap, 
  TextStaggerHover 
} from "../components/ui/animated-slideshow";
import { ActionCta } from "../components/ActionCta";

export default function AboutPage() {
  const worldRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const siliconCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Section Refs for direct-DOM fluidity
  const section1Ref = useRef<HTMLElement>(null);
  const section2Ref = useRef<HTMLElement>(null);
  const section3Ref = useRef<HTMLElement>(null);
  const section4Ref = useRef<HTMLElement>(null);
  const section5Ref = useRef<HTMLElement>(null);
  
  // Narrative element refs for direct-DOM fluidity
  const declicTitleRef = useRef<HTMLDivElement>(null);
  const narrative1Ref = useRef<HTMLDivElement>(null);
  const narrative2Ref = useRef<HTMLDivElement>(null);
  const solutionTitleRef = useRef<HTMLDivElement>(null);
  const narrative3Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const heroSceneRef = useRef<HTMLImageElement>(null);
  const heroStarshipRef = useRef<HTMLImageElement>(null);
  const heroTitleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // --- SECTION 1: TUNNEL CONFIG & SETUP ---
    const Z_GAP = 600;
    const ITEM_COUNT = 15;
    const LOOP_SIZE = ITEM_COUNT * Z_GAP;
    const STAR_COUNT = 100;
    const TEXTS = ["SYSTEM", "DESIGN", "FUTURE", "BRUTAL", "Agent IA", "IMPACT", "CODE", "Automation", "VISION"];
    const CARD_DATA = [
      { title: "PERTE DE TEMPS", phrase: "Vos journées s'épuisent dans des tâches répétitives sans valeur ajoutée." },
      { title: "ERREURS COÛTEUSES", phrase: "Chaque petite faute manuelle impacte directement votre rentabilité nette." },
      { title: "FATIGUE MENTALE", phrase: "Votre équipe sature, le travail est négligé et la motivation s'effondre." },
      { title: "FUITE DE DONNÉES", phrase: "Des informations critiques s'échappent par manque de structure et de contrôle." },
      { title: "OPPORTUNITÉS MANQUÉES", phrase: "Pendant que vous gérez l'urgence, vos futurs clients partent à la concurrence." }
    ];

    const world = worldRef.current;
    const viewport = viewportRef.current;
    const tunnelItems: any[] = [];

    const initTunnel = () => {
      if (!world) return;
      world.innerHTML = '';
      tunnelItems.length = 0;
      let cardCounter = 0;
      for (let i = 0; i < ITEM_COUNT; i++) {
        const isText = i % 3 === 0;
        const el = document.createElement('div');
        el.className = 'item';
        if (isText) {
          const txt = document.createElement('div');
          txt.className = 'big-text';
          txt.innerText = TEXTS[i % TEXTS.length];
          el.appendChild(txt);
        } else {
          const content = CARD_DATA[cardCounter % CARD_DATA.length];
          cardCounter++;
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <div class="index">0${i} // ${Math.random().toFixed(4)}</div>
            <h2>${content.title}</h2>
            <p style="color:#eee; font-size:1.15rem; font-weight: 700; margin-top: 1.5rem; line-height: 1.4;">${content.phrase}</p>
            <p style="color:#666; font-size:0.8rem; margin-top: auto;">COORD: [${Math.random().toFixed(0)}, ${Math.random().toFixed(0)}]</p>
          `;
          el.appendChild(card);
        }
        const x = (Math.random() - 0.5) * window.innerWidth * 0.8;
        const y = (Math.random() - 0.5) * window.innerHeight * 0.8;
        const rotZ = (Math.random() - 0.5) * 20;
        world.appendChild(el);
        tunnelItems.push({ el, x, y, rotZ, baseZ: -i * Z_GAP, type: isText ? 'text' : 'card' });
      }
      for (let i = 0; i < STAR_COUNT; i++) {
        const el = document.createElement('div');
        el.className = 'particle';
        world.appendChild(el);
        tunnelItems.push({ el, x: (Math.random() - 0.5) * 2000, y: (Math.random() - 0.5) * 2000, rotZ: 0, baseZ: -(Math.random() * LOOP_SIZE), type: 'star' });
      }
    };
    initTunnel();

    // --- SECTION 2: SILICON SHADER SETUP ---
    let siliconRenderer: THREE.WebGLRenderer | null = null;
    let siliconScene: THREE.Scene | null = null;
    let siliconCamera: THREE.OrthographicCamera | null = null;
    let siliconMaterial: THREE.ShaderMaterial | null = null;

    if (siliconCanvasRef.current) {
        siliconScene = new THREE.Scene();
        siliconCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        siliconCamera.position.z = 1;

        siliconRenderer = new THREE.WebGLRenderer({ 
            canvas: siliconCanvasRef.current,
            antialias: false, 
            powerPreference: "high-performance" 
        });
        siliconRenderer.setSize(window.innerWidth, window.innerHeight);
        siliconRenderer.setPixelRatio(1.0);

        const uniforms = {
            uTime: { value: 0.0 },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uZoomSpeed: { value: 0.174 },
            uCamDist: { value: 11.232 },
            uCamHeight: { value: 3.024 },
            uFOV: { value: 6.0 }, 
            uPatternScale: { value: 0.4843 },
            uExtrusion: { value: 0.0568 },
            uBaseColor: { value: new THREE.Color(0x505a66) },   
            uTraceColor: { value: new THREE.Color(0x3a4048) },  
            uGlowColor: { value: new THREE.Color(0x00d0ff) },   
            uTrailColor: { value: new THREE.Color(0xffffff) },
            uTrailSpeed: { value: 0.5 },
            uTrailLength: { value: 12.0 },
            uParticleColor: { value: new THREE.Color(0xffffff) },
            uParticleSpeed: { value: 1.5 },
            uParticleDensity: { value: 15.0 },
            uParticleSize: { value: 0.008 }, 
            uDotDensity: { value: 38.0 }, 
            uDotOpacity: { value: 0.2 }, 
            uIterations: { value: 2 },
            uGlowIntensity: { value: 1.14 },
            uFogDensity: { value: 0.005 },
            uAA: { value: true } 
        };

        const vertexShader = `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            #define MAX_STEPS 80
            #define MAX_DIST 40.0
            #define SURF_DIST 0.002
            uniform float uTime;
            uniform vec2 uResolution;
            uniform float uZoomSpeed;
            uniform float uCamDist;
            uniform float uCamHeight;
            uniform float uFOV;
            uniform float uPatternScale;
            uniform float uExtrusion;
            uniform vec3 uBaseColor;
            uniform vec3 uTraceColor;
            uniform vec3 uGlowColor;
            uniform vec3 uTrailColor;
            uniform float uTrailSpeed;
            uniform float uTrailLength;
            uniform vec3 uParticleColor;
            uniform float uParticleSpeed;
            uniform float uParticleDensity;
            uniform float uParticleSize;
            uniform float uDotDensity;
            uniform float uDotOpacity;
            uniform int uIterations;
            uniform float uGlowIntensity;
            uniform float uFogDensity;
            uniform bool uAA;
            varying vec2 vUv;
            float rand2(vec2 co){ return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453); }
            vec2 rot(vec2 p, float a) { float s = sin(a), c = cos(a); return p * mat2(c, -s, s, c); }
            float getPatternClean(vec2 p) {
                vec2 g = floor(p); vec2 lp = fract(p); vec2 e = g; float lines = 0.0;
                for(int i = 0; i < 10; i++) {
                    if (i >= uIterations) break; 
                    float w = exp2(float(i)); float fX, fY;
                    float thick = 0.02 + 0.01 * float(i); float bevel = 0.025; 
                    fX = rand2(e + vec2(0.0, float(i)));
                    if(lp.x < fX) e.x += w; else e.x -= w;
                    float lineX = smoothstep(thick + bevel, thick, abs(lp.x - fX));
                    fY = rand2(e + vec2(1.0, float(i)));
                    if(lp.y < fY) e.y += w; else e.y -= w;
                    float lineY = smoothstep(thick + bevel, thick, abs(lp.y - fY));
                    lines = max(lines, max(lineX, lineY));
                }
                return 1.0 - lines; 
            }
            float getDist(vec3 p) {
                float chip = getPatternClean(p.xz * uPatternScale);
                float h = chip * uExtrusion; 
                return (p.y - h) * 0.45; 
            }
            vec3 getNormal(vec3 p) {
                vec2 e = vec2(0.003, -0.003); 
                return normalize(
                    e.xyy * getDist(p + e.xyy) + e.yyx * getDist(p + e.yyx) +
                    e.yxy * getDist(p + e.yxy) + e.xxx * getDist(p + e.xxx)
                );
            }
            float getShadow(vec3 ro, vec3 rd) {
                float res = 1.0; float t = 0.05;
                for(int i = 0; i < 8; i++) {
                    float h = getDist(ro + rd * t);
                    if(h < 0.001) return 0.1;
                    res = min(res, 8.0 * h / t); t += h * 1.5;
                }
                return res;
            }
            vec3 renderScene(vec2 uv) {
                float flightProgress = uTime * uZoomSpeed * 2.5; 
                vec3 ro = vec3(uCamDist - flightProgress, uCamHeight, uCamDist - flightProgress); 
                vec3 ta = vec3(-flightProgress, 0.0, -flightProgress); 
                vec3 forward = normalize(ta - ro);
                vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), forward));
                vec3 up = cross(forward, right);
                vec3 rd = normalize(uv.x * right + uv.y * up + forward * uFOV);
                float distTotal = 0.0; vec3 p;
                for(int i = 0; i < MAX_STEPS; i++) {
                    p = ro + rd * distTotal; float distStep = getDist(p);
                    distTotal += distStep; if(distTotal > MAX_DIST || abs(distStep) < SURF_DIST) break;
                }
                vec3 col = uBaseColor * 0.1; 
                if(distTotal < MAX_DIST) {
                    vec3 n = getNormal(p); vec3 ref = reflect(rd, n);
                    float chip = getPatternClean(p.xz * uPatternScale); float gap = 1.0 - chip; 
                    float isTop = smoothstep(0.95, 1.0, chip);
                    vec3 matColor = mix(uBaseColor, uTraceColor, isTop);
                    vec3 lightDir = normalize(vec3(0.8, 1.0, 0.5));
                    float dif = max(dot(n, lightDir), 0.0);
                    float shadow = getShadow(p + n * 0.01, lightDir);
                    float spec = pow(max(dot(ref, lightDir), 0.0), 32.0) * isTop;
                    col = matColor * (dif * shadow + 0.15); 
                    col += spec * shadow * vec3(1.0);       
                    float deepGap = smoothstep(0.3, 0.0, p.y / uExtrusion);
                    col += uGlowColor * gap * deepGap * uGlowIntensity * (shadow + 0.5);
                    float tFreq = uPatternScale * 2.0;
                    float idX = floor(p.z * tFreq * 8.0); float idZ = floor(p.x * tFreq * 8.0);
                    float rX = rand2(vec2(idX, 12.3)); float rZ = rand2(vec2(idZ, 45.6));
                    float dirX = sign(rX - 0.5); float dirZ = sign(rZ - 0.5);
                    float speedX = uTime * uTrailSpeed * (rX * 0.5 + 0.5); float speedZ = uTime * uTrailSpeed * (rZ * 0.5 + 0.5);
                    float pulseX = fract(p.x * tFreq * dirX - speedX + rX * 10.0);
                    float pulseZ = fract(p.z * tFreq * dirZ - speedZ + rZ * 10.0);
                    float trailX = pow(pulseX, uTrailLength) * step(0.6, rX);
                    float trailZ = pow(pulseZ, uTrailLength) * step(0.6, rZ);
                    float trailMask = max(trailX, trailZ); col += uTrailColor * trailMask * gap * deepGap * 3.0;
                    float pFreq = uPatternScale * 2.0; float pidX = floor(p.z * pFreq * 8.0); float pidZ = floor(p.x * pFreq * 8.0);
                    float prX = rand2(vec2(pidX, 77.7)); float prZ = rand2(vec2(pidZ, 88.8));
                    float pdirX = sign(prX - 0.5); float pdirZ = sign(prZ - 0.5);
                    float pspeedX = uTime * uParticleSpeed * (prX * 0.5 + 0.5); float pspeedZ = uTime * uParticleSpeed * (prZ * 0.5 + 0.5);
                    float pDens = uPatternScale * uParticleDensity;
                    float lineCoordX = p.x * pDens * pdirX - pspeedX + prX * 10.0;
                    float cellIdX = floor(lineCoordX); float cellFractX = fract(lineCoordX);
                    float dotPosX = rand2(vec2(cellIdX, prX)) * 0.6 + 0.2; 
                    float pdistX = abs(cellFractX - dotPosX); float showDotX = step(0.4, rand2(vec2(cellIdX, prX * 1.337))); 
                    float lineCoordZ = p.z * pDens * pdirZ - pspeedZ + prZ * 10.0;
                    float cellIdZ = floor(lineCoordZ); float cellFractZ = fract(lineCoordZ);
                    float dotPosZ = rand2(vec2(cellIdZ, prZ)) * 0.6 + 0.2;
                    float pdistZ = abs(cellFractZ - dotPosZ); float showDotZ = step(0.4, rand2(vec2(cellIdZ, prZ * 1.337)));
                    float dotScale = uParticleSize * max(0.5, distTotal * 0.5);
                    float dotSmooth = dotScale * 0.3; 
                    float partX = smoothstep(dotScale + dotSmooth, dotScale, pdistX) * step(0.4, prX) * showDotX;
                    float partZ = smoothstep(dotScale + dotSmooth, dotScale, pdistZ) * step(0.4, prZ) * showDotZ;
                    float partMask = max(partX, partZ); col += uParticleColor * partMask * gap * deepGap * 4.0;
                    if (isTop > 0.5) {
                        float dotScaleUv = uPatternScale * uDotDensity;
                        vec2 dotUv = fract(p.xz * dotScaleUv); vec2 dotId = floor(p.xz * dotScaleUv);
                        float dotMaskX = 1.0 - smoothstep(0.15, 0.25, abs(dotUv.x - 0.5));
                        float dotMaskY = 1.0 - smoothstep(0.15, 0.25, abs(dotUv.y - 0.5));
                        float dotGridMask = dotMaskX * dotMaskY;
                        float dotRnd = rand2(dotId * 1.337);
                        float twinkle = sin(uTime * 2.5 + dotRnd * 6.2831) * 0.5 + 0.5;
                        float distanceFade = smoothstep(MAX_DIST * 0.6, MAX_DIST * 0.2, distTotal);
                        float finalDotAlpha = uDotOpacity * (0.2 + 0.8 * twinkle) * distanceFade;
                        col += vec3(1.0) * dotGridMask * finalDotAlpha * isTop;
                    }
                }
                float fog = 1.0 - exp(-distTotal * distTotal * uFogDensity);
                vec3 fogColor = mix(uBaseColor, vec3(0.0), 0.5); col = mix(col, fogColor, fog);
                float vig = length(uv) * 0.25; col -= vig * vig * 0.3;
                col = smoothstep(0.0, 1.1, col); return col;
            }
            void main() {
                vec3 totalCol = vec3(0.0);
                vec2 uv = (vUv - 0.5) * 2.0;
                uv.x *= uResolution.x / uResolution.y;
                totalCol = renderScene(uv);
                gl_FragColor = vec4(totalCol, 1.0);
            }
        `;

        const geometry = new THREE.PlaneGeometry(2, 2);
        siliconMaterial = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
        const mesh = new THREE.Mesh(geometry, siliconMaterial);
        siliconScene.add(mesh);
    }

    // --- SHARED SCROLL & RAF LOOP ---
    const lenis = new Lenis({ lerp: 0.1 });
    let velocity = 0;
    let targetSpeed = 0;
    const scrollState = { pos: 0, progress: 0 }; // Use ref-like object for performance

    lenis.on('scroll', (e: any) => {
      scrollState.pos = e.scroll;
      targetSpeed = e.velocity;
      
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = e.scroll / (totalHeight || 1);
      scrollState.progress = progress;
    });

    const updateTunnel = (scroll: number, vel: number) => {
      if (!viewport || !world) return;
      const warp = Math.min(Math.abs(vel) * 2, 400);
      viewport.style.perspective = `${800 - warp}px`;
      const tilt = vel * 0.05;
      world.style.transform = `rotateX(${-tilt}deg)`;
      const speedFactor = 2.5;
      const currentDist = scroll * speedFactor;
      tunnelItems.forEach(item => {
        let z = item.baseZ + currentDist;
        let vizZ = z % LOOP_SIZE;
        if (vizZ > 500) vizZ -= LOOP_SIZE;
        if (vizZ < -LOOP_SIZE + 500) vizZ += LOOP_SIZE;
        while (vizZ > 500) vizZ -= LOOP_SIZE;
        let alpha = 1;
        const maxDist = -3000;
        if (vizZ < maxDist) alpha = 0;
        else if (vizZ < maxDist + 1000) alpha = (vizZ - maxDist) / 1000;
        if (vizZ > 0) alpha = 1 - (vizZ / 400);
        if (alpha < 0) alpha = 0;
        
        // Performance optimization: Only update style if necessary
        if (item.el.style.opacity !== alpha.toString()) {
            item.el.style.opacity = alpha.toString();
        }

        if (alpha > 0) {
          if (item.type === 'star') {
            const stretch = Math.max(1, Math.min(1 + Math.abs(vel) * 0.05, 5));
            item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, ${vizZ}px) scale3d(1, ${stretch}, 1)`;
          } else {
            const floatRot = Math.sin(Date.now() * 0.001 + item.baseZ) * 5;
            item.el.style.transform = `translate3d(${item.x}px, ${item.y}px, ${vizZ}px) rotateZ(${item.rotZ + floatRot}deg)`;
          }
          if (item.el.style.visibility !== 'visible') item.el.style.visibility = 'visible';
        } else {
          if (item.el.style.visibility !== 'hidden') item.el.style.visibility = 'hidden';
        }
      });
    };

    const clock = new THREE.Clock();
    let rafHandle: number;
    const raf = (time: number) => {
      lenis.raf(time);
      velocity += (targetSpeed - velocity) * 0.1;

      const sp = scrollState.progress;

      // --- SECTION ALPHA & CROSSFADES (Direct DOM) ---
      const s1A = sp < 0.20 ? 1 : Math.max(0, 1 - (sp - 0.20) / 0.05);
      const s2A = sp < 0.25 ? 0 : sp < 0.50 ? Math.min(1, (sp - 0.25) / 0.05) : Math.max(0, 1 - (sp - 0.50) / 0.05);
      const s3A = sp < 0.50 ? 0 : sp < 0.65 ? Math.min(1, (sp - 0.50) / 0.05) : Math.max(0, 1 - (sp - 0.65) / 0.05);
      // Team fades out earlier to reveal CTA
      const s4A = sp < 0.70 ? 0 : sp < 0.82 ? Math.min(1, (sp - 0.70) / 0.05) : Math.max(0, 1 - (sp - 0.82) / 0.06);
      // CTA section
      const s5A = sp < 0.88 ? 0 : sp < 0.96 ? Math.min(1, (sp - 0.88) / 0.04) : Math.max(0, 1 - (sp - 0.96) / 0.04);

      if (section1Ref.current) section1Ref.current.style.opacity = s1A.toString();
      if (section2Ref.current) {
          section2Ref.current.style.opacity = s2A.toString();
          section2Ref.current.style.background = s2A > 0.5 ? '#000' : 'transparent';
      }
      if (section3Ref.current) {
          section3Ref.current.style.opacity = s3A.toString();
      }
      if (section4Ref.current) {
          section4Ref.current.style.opacity = s4A.toString();
          section4Ref.current.style.background = '#faf9f5';
          section4Ref.current.style.visibility = s4A > 0 ? 'visible' : 'hidden';
          section4Ref.current.style.pointerEvents = s4A > 0 ? 'auto' : 'none';
          
          // Slight lift when moving to cta starts earlier
          const yOffset = sp > 0.82 ? (sp - 0.82) * -150 : 0;
          section4Ref.current.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      }
      if (section5Ref.current) {
          section5Ref.current.style.opacity = s5A.toString();
          section5Ref.current.style.visibility = s5A > 0 ? 'visible' : 'hidden';
          section5Ref.current.style.pointerEvents = s5A > 0 ? 'auto' : 'none';
          
          // Slight lift for CTA section too
          const yOffset = sp > 0.94 ? (sp - 0.94) * -100 : 0;
          section5Ref.current.style.transform = `translate3d(0, ${yOffset}px, 0)`;
      }

      // --- SECTION 1: TUNNEL ---
      if (s1A > 0) {
          updateTunnel(scrollState.pos, velocity);
      }
      
      // --- SECTION 2: SILICON NARRATIVE ---
      if (s2A > 0) {
          if (siliconMaterial && siliconRenderer && siliconScene && siliconCamera) {
              siliconMaterial.uniforms.uTime.value = clock.getElapsedTime();
              siliconRenderer.render(siliconScene, siliconCamera);
          }
          
          // Éveil IA scroll (Horizontal)
          if (declicTitleRef.current) {
              const x = (100 - (Math.max(0, sp - 0.25) / 0.12) * 220); 
              const alpha = Math.max(0, Math.min(1, (sp - 0.25) * 25) * (1 - Math.max(0, (sp - 0.35) * 25)));
              declicTitleRef.current.style.transform = `translate3d(${x}vw, 35vh, 0)`;
              declicTitleRef.current.style.opacity = alpha.toString();
          }
          if (narrative1Ref.current) {
              const y = (1 - (Math.max(0, sp - 0.35) / 0.08)) * 140 - 20;
              const alpha = Math.max(0, Math.min(1, (sp - 0.35) * 25) * (1 - Math.max(0, (sp - 0.43) * 25)));
              narrative1Ref.current.style.transform = `translate3d(0, ${y}vh, 0)`;
              narrative1Ref.current.style.opacity = alpha.toString();
          }
          if (narrative2Ref.current) {
              const y = (1 - (Math.max(0, sp - 0.43) / 0.06)) * 140 - 20;
              const alpha = Math.max(0, Math.min(1, (sp - 0.43) * 30) * (1 - Math.max(0, (sp - 0.49) * 30)));
              narrative2Ref.current.style.transform = `translate3d(0, ${y}vh, 0)`;
              narrative2Ref.current.style.opacity = alpha.toString();
          }
          // Architecture block scroll (Horizontal)
          if (solutionTitleRef.current) {
              const x = (100 - (Math.max(0, sp - 0.50) / 0.12) * 220);
              const alpha = Math.max(0, Math.min(1, (sp - 0.50) * 25) * (1 - Math.max(0, (sp - 0.60) * 25)));
              solutionTitleRef.current.style.transform = `translate3d(${x}vw, 40vh, 0)`;
              solutionTitleRef.current.style.opacity = alpha.toString();
          }
          if (narrative3Ref.current) {
              const y = (1 - (Math.max(0, sp - 0.56) / 0.03)) * 140 - 20;
              const alpha = Math.max(0, Math.min(1, (sp - 0.56) * 80) * (1 - Math.max(0, (sp - 0.59) * 100)));
              narrative3Ref.current.style.transform = `translate3d(0, ${y}vh, 0)`;
              narrative3Ref.current.style.opacity = alpha.toString();
          }
          if (ctaRef.current) {
              const x = (100 - (Math.max(0, sp - 0.60) / 0.05) * 350);
              const alpha = sp < 0.65 ? Math.max(0, Math.min(1, (sp - 0.60) * 100)) : 0;
              ctaRef.current.style.transform = `translate3d(${x}vw, 0, 0)`;
              ctaRef.current.style.opacity = alpha.toString();
          }
      }
      
      // --- SECTION 3: FUTURE HERO ---
      if (sp > 0.50 && sp < 0.72) {
          if (heroSceneRef.current) {
              const scale = 1 + (Math.max(0, sp - 0.55) * 0.2);
              heroSceneRef.current.style.transform = `scale3d(${scale}, ${scale}, 1)`;
          }
          if (heroStarshipRef.current) {
              const scale = 1 + (Math.max(0, sp - 0.51) * 8);
              const opacity = 1 - Math.max(0, (sp - 0.65) * 10);
              heroStarshipRef.current.style.transform = `scale3d(${scale}, ${scale}, 1)`;
              heroStarshipRef.current.style.opacity = opacity.toString();
          }
          if (heroTitleRef.current) {
              const scale = 0.5 + (Math.max(0, sp - 0.6) * 1.5);
              const opacity = Math.max(0, Math.min(1, (sp - 0.6) * 15)) * (1 - Math.max(0, (sp - 0.68) * 15));
              heroTitleRef.current.style.transform = `translate3d(-50%, -50%, 0) scale3d(${scale}, ${scale}, 1)`;
              heroTitleRef.current.style.opacity = opacity.toString();
          }
      }

      rafHandle = requestAnimationFrame(raf);
    };
    rafHandle = requestAnimationFrame(raf);

    const handleResize = () => {
        if (siliconRenderer && siliconMaterial) {
            siliconRenderer.setSize(window.innerWidth, window.innerHeight);
            siliconMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(rafHandle);
      lenis.destroy();
      if (siliconRenderer) siliconRenderer.dispose();
    };
  }, []);

  return (
    <div className="about-page-container">
      <style>{`
        :root {
          --bg-about: #000000;
          --card-about: #0a0a0a;
          --text-about: #ffffff;
          --accent-about: #ff003c;
          --border-about: rgba(255, 255, 255, 0.15);
        }
        .about-page-container {
          background: var(--bg-about);
          color: var(--text-about);
          font-family: 'Helvetica Neue', 'Arial', sans-serif;
          min-height: 100vh;
        }
        .section-sticky {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100vh;
            pointer-events: none;
            overflow: hidden;
            transition: opacity 0.5s ease;
        }
        .section-sticky.active {
            pointer-events: auto;
        }

        /* SECTION 1 STYLES */
        .viewport {
          perspective: 800px;
        }
        .world {
          position: absolute;
          top: 50%;
          left: 50%;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .item {
          position: absolute;
          left: 0;
          top: 0;
          backface-visibility: hidden;
          transform-origin: center center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card {
          width: 300px;
          height: 420px;
          background: rgba(10, 10, 10, 0.6);
          border: 1px solid var(--border-about);
          border-radius: 4px;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.8);
          transform: translate(-50%, -50%);
          backdrop-filter: blur(5px);
          transition: border-color 0.3s, background 0.3s;
        }
        .card:hover {
          border-color: var(--accent-about);
          background: rgba(20, 20, 20, 0.9);
          z-index: 100;
        }
        .card h2 {
          font-size: 2.5rem;
          line-height: 0.85;
          margin: 0;
          text-transform: uppercase;
          font-weight: 800;
          letter-spacing: -1px;
        }
        .card .index {
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--accent-about);
          border: 1px solid var(--accent-about);
          display: inline-block;
          padding: 2px 6px;
          margin-bottom: 20px;
          align-self: flex-start;
        }
        .big-text {
          font-size: 10vw;
          font-weight: 900;
          color: transparent;
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.1);
          text-transform: uppercase;
          white-space: nowrap;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .particle {
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          position: absolute;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        }
        .depth-mask {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at center, transparent 40%, rgba(0,0,0,0.7) 100%);
          z-index: 11;
          pointer-events: none;
        }
        .noise {
          position: fixed;
          inset: 0;
          background: url('data:image/svg+xml;utf8,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.05"/%3E%3C/svg%3E');
          z-index: 12;
          pointer-events: none;
          opacity: 0.4;
        }

        /* SECTION 2 STYLES */
        .silicon-canvas {
            display: block;
            width: 100vw;
            height: 100vh;
        }

        .declic-title {
            position: absolute;
            left: 0;
            top: 0;
            font-size: 10vw;
            font-weight: 400;
            color: #ffffff;
            white-space: nowrap;
            letter-spacing: -0.02em;
            line-height: 1;
            z-index: 20;
            pointer-events: none;
            will-change: transform, opacity;
            text-shadow: 0 0 20px rgba(0,0,0,0.5);
        }

        .declic-title.arch {
            font-size: 4vw;
            line-height: 1.1;
            font-weight: 300;
            width: fit-content;
        }

        .narrative-phrase {
            position: absolute;
            right: 5vw;
            top: 0;
            width: 45vw;
            font-size: 3.5vw;
            font-weight: 300;
            color: #ffffff;
            text-align: right;
            line-height: 1.25;
            z-index: 21;
            pointer-events: none;
            will-change: transform, opacity;
            letter-spacing: -0.01em;
            text-shadow: 0 0 20px rgba(0,0,0,0.8);
        }

        .narrative-phrase strong {
            font-weight: 300;
            display: block;
            margin-top: 1rem;
            color: #ffffff;
        }

        .narrative-phrase b {
            font-weight: 800;
            color: #00d0ff;
        }

        .narrative-phrase.left {
            right: auto;
            left: 5vw;
            text-align: left;
            width: 50vw;
        }

        .horizontal-scroll-brand {
            position: absolute;
            bottom: 12vh;
            left: 0;
            font-size: 10vw;
            font-weight: 900;
            color: #ffffff;
            white-space: nowrap;
            line-height: 1;
            z-index: 10;
            pointer-events: none;
            will-change: transform, opacity;
            opacity: 1;
            letter-spacing: -0.02em;
            text-shadow: 0 0 30px rgba(0,0,0,0.5);
        }

        .bottom-blur-mask {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 35vh;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            backdrop-filter: blur(15px);
            -webkit-mask-image: linear-gradient(to top, black 25%, transparent 100%);
            z-index: 30;
            pointer-events: none;
        }

        /* SECTION 3: FUTURE HERO */
        .hero {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            z-index: 5;
            background: #000;
        }
        .hero__title {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-family: var(--font-geist), sans-serif;
            font-size: 10vw;
            line-height: 1.1;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            font-weight: 900;
            z-index: 50;
            text-align: center;
            color: #ffffff;
            text-shadow: 0 0 50px rgba(0,0,0,0.5);
            will-change: transform, opacity;
            width: 100%;
        }
        .hero__scene {
            position: absolute;
            width: 100%;
            height: 100%;
            object-fit: cover;
            z-index: 10; /* The City Background */
            filter: brightness(0.9) contrast(1.1);
            will-change: transform;
        }
        .hero__starship {
            position: absolute;
            width: 100vw;
            height: 100vh;
            object-fit: cover;
            z-index: 40; /* The Door/Interior Layer */
            will-change: transform, opacity;
        }

        .scroll-spacer {
          height: 2800vh;
          width: 100%;
          position: relative;
          z-index: 1;
        }
      `}</style>

      {/* FIXED UI ELEMENTS */}
      <div className="depth-mask"></div>
      <div className="noise"></div>

      {/* SECTION 1: TUNNEL */}
      <section 
        ref={section1Ref}
        className="section-sticky active"
        style={{ zIndex: 10 }}
      >
        <div className="viewport h-full w-full" ref={viewportRef}>
            <div className="world" ref={worldRef}></div>
        </div>
      </section>

      {/* SECTION 2: SILICON */}
      <section 
        ref={section2Ref}
        className="section-sticky active"
        style={{ zIndex: 20 }}
      >
        <canvas className="silicon-canvas" ref={siliconCanvasRef} />
        
        {/* MONUMENTAL TITLE SECTION 2 */}
        <div 
          ref={declicTitleRef}
          className="declic-title"
        >
          ÉVEIL IA —
        </div>

        {/* NARRATIVE PHRASE SECTION 2 */}
        <div 
          ref={narrative1Ref}
          className="narrative-phrase"
        >
          j'ai vu des entrepreneurs talentueux se noyer sous des tâches répétitives pendant que le monde avançait à la vitesse de l'IA. 
          <br/>
          <b>C'était inacceptable</b>
        </div>

        {/* SECOND NARRATIVE PHRASE SECTION 2 (LEFT) */}
        <div 
          ref={narrative2Ref}
          className="narrative-phrase left"
        >
          L'innovation semblait réservée aux géants technologiques, <b>laissant nos entreprises locales face à un mur</b> de complexité. Le fossé se creusait chaque jour.
        </div>

        {/* NEW TITLE: ARCHITECTURE SECTION 2 (LEFT) */}
        <div 
          ref={solutionTitleRef}
          className="declic-title arch"
        >
          Une architecture conçue pour l'élite.<br/>
          Transformez chaque seconde en profit.<br/>
          Le futur d'Autoslash commence ici.
        </div>

        {/* FINAL NARRATIVE PHRASE SECTION 2 (LEFT) */}
        <div 
          ref={narrative3Ref}
          className="narrative-phrase left"
        >
          <b>Autoslash AI est née pour briser ce plafond</b>.
          <br/>
          Nous avons créé une infrastructure où l'IA absorbe le chaos 
          <br/>
          pour <b>libérer votre génie créatif</b>.
          <br/>
          <strong>Désormais, nos clients ne subissent plus leur croissance <b>ils la pilotent. L'efficacité automatisée</b> n'est plus un rêve c'est leur nouveau standard.</strong>
        </div>

        {/* MONUMENTAL CALL TO ACTION */}
        <div 
          ref={ctaRef}
          className="horizontal-scroll-brand"
        >
          La Décision De La Franchir Cette Porte Vous Appartient
        </div>

        {/* ATMOSPHERIC BOTTOM BLUR */}
        <div className="bottom-blur-mask"></div>
      </section>

      {/* SECTION 3: FUTURE HERO (THE STARSHIP) */}
      <section 
        ref={section3Ref}
        className="section-sticky active"
        style={{ 
          zIndex: 30,
          background: '#000'
        }}
      >
        <div className="hero">
          {/* THE CITY LANDSCAPE (revealed as we go through the door) */}
          <img 
            ref={heroSceneRef}
            src="https://design-fenix.com.ar/codepen/scroll/scene.webp" 
            alt="Space Scene" 
            className="hero__scene" 
            referrerPolicy="no-referrer"
          />
          {/* THE COCKPIT / DOOR (zooms past the camera) */}
          <img 
            ref={heroStarshipRef}
            src="https://design-fenix.com.ar/codepen/scroll/starship.webp" 
            alt="Door Interior" 
            className="hero__starship" 
            referrerPolicy="no-referrer"
          />
          {/* THE FINAL TEXT (zooms in after transition) */}
          <h1 
            ref={heroTitleRef}
            className="hero__title"
          >
            LE MANUEL<br/>APPARTIENT AU<br/>PASSÉ
          </h1>
        </div>
      </section>

      {/* SECTION 4: THE TEAM (ANIMATED SLIDESHOW) */}
      <section 
        ref={section4Ref}
        className="section-sticky active"
        style={{ 
          zIndex: 40,
          background: '#faf9f5'
        }}
      >
        <HoverSlider className="min-h-screen flex flex-col justify-start pt-16 pb-12 px-6 md:px-24 bg-[#faf9f5] text-[#3d3929]">
          <div className="flex flex-wrap items-center justify-between gap-12 md:gap-20 max-w-7xl mx-auto w-full">
            <div className="flex flex-col space-y-2 md:space-y-3 flex-1 min-w-[300px]">
              {[
                { title: "PAPE AMADOU MBAYE", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop" },
                { title: "AI STRATEGY LEAD", imageUrl: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=2574&auto=format&fit=crop" },
                { title: "CREATIVE DIRECTOR", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop" },
                { title: "TECH ARCHITECT", imageUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop" },
                { title: "GROWTH SPECIALIST", imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop" }
              ].map((slide, index) => (
                <TextStaggerHover
                  key={slide.title}
                  index={index}
                  className="cursor-pointer text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter transition-all duration-500 whitespace-nowrap"
                  text={slide.title}
                />
              ))}
            </div>
            <HoverSliderImageWrap className="w-full max-w-[340px] aspect-[3/4] flex-shrink-0">
              {[
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2574&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?q=80&w=2574&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2574&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop"
              ].map((url, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-2xl">
                  <HoverSliderImage
                    index={index}
                    imageUrl={url}
                    src={url}
                    alt="Service detail"
                    className="size-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              ))}
            </HoverSliderImageWrap>
          </div>
        </HoverSlider>
      </section>

      {/* SECTION 5: CTA */}
      <section 
        ref={section5Ref}
        className="section-sticky"
        style={{ 
          zIndex: 45,
          background: '#000'
        }}
      >
        <div className="h-full w-full flex items-center justify-center">
          <ActionCta />
        </div>
      </section>

      {/* SCROLL TRIGGER */}
      <div className="scroll-spacer"></div>
    </div>
  );
}
