"use client";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Lenis from "lenis";
import * as THREE from "three";
import { 
  HoverSlider, 
  HoverSliderImage, 
  HoverSliderImageWrap, 
  TextStaggerHover 
} from "../components/ui/animated-slideshow";
import { ActionCta } from "../components/ActionCta";

const TL_CARDS = [
  { label: "01 · ÉVEIL", title: "Éveil IA", text: "Des entrepreneurs brillants, des idées qui méritaient le monde — paralysés par des systèmes qui n'étaient pas faits pour eux. J'ai décidé que ça s'arrêtait là." },
  { label: "02 · MISSION", title: "L'IA n'était pas accessible", text: "Trop chère, trop complexe, réservée aux géants. Autoslash AI est née pour changer ça — une infrastructure mondiale, livrée clé en main." },
  { label: "03 · ARCHITECTURE", title: "Une architecture conçue pour l'élite", text: "Des agents qui travaillent quand vous dormez. Votre croissance, automatisée." },
  { label: "04 · INFRASTRUCTURE", title: "Autoslash AI ne vend pas un outil", text: "Nous construisons l'infrastructure de votre prochain niveau. Des agents entraînés sur vos données. Opérationnels 24h/24. Nos clients ne gèrent plus leur croissance — ils la regardent se déployer pendant qu'ils font ce qui compte vraiment." },
];
const TL_N = TL_CARDS.length;

export default function AboutPage() {
  const navigate = useNavigate();
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
  const tlTrackRef = useRef<HTMLDivElement>(null);
  const tlFillRef = useRef<HTMLDivElement>(null);
  const tlCardRefs = useRef<(HTMLElement | null)[]>([]);
  const tlNodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaInnerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  const rupFrameRef = useRef<HTMLDivElement>(null);
  const rupGlowRef = useRef<HTMLDivElement>(null);
  const rupKickerRef = useRef<HTMLSpanElement>(null);
  const rupStrikeRef = useRef<HTMLElement>(null);
  const rupWordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const rupEcgRef = useRef<SVGPathElement>(null);
  const rupContentRef = useRef<HTMLDivElement>(null);
  const rupIrisRef = useRef<HTMLDivElement>(null);
  const rupORef = useRef<HTMLSpanElement>(null);
  const scrollSpacerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // --- SECTION 1: TUNNEL CONFIG & SETUP ---
    const Z_GAP = 600;
    const ITEM_COUNT = 15;
    const LOOP_SIZE = ITEM_COUNT * Z_GAP;
    const STAR_COUNT = 100;
    const TEXTS = ["AVENIR", "SYSTÈME", "IMPACT", "VITESSE", "Agent IA", "CONTRÔLE", "VISION", "RÉSULTAT", "AUTOSLASH"];
    const CARD_DATA = [
      { 
        title: "CHAQUE HEURE PERDUE", 
        phrase: "Un entrepreneur passe 60% de son temps sur des tâches que l'IA peut faire en 3 secondes. C'est votre vie qui s'écoule." 
      },
      { 
        title: "VOS CONCURRENTS BOUGENT", 
        phrase: "Pendant que vous gérez l'opérationnel, ceux qui ont automatisé capturent vos clients. Le fossé se creuse chaque jour." 
      },
      { 
        title: "L'ÉQUIPE S'ÉPUISE", 
        phrase: "Les meilleurs talents ne partent pas pour le salaire. Ils partent quand le travail n'a plus de sens et que la répétition tue la créativité." 
      },
      { 
        title: "LES DONNÉES S'ÉCHAPPENT", 
        phrase: "Chaque décision prise sans données fiables est un pari. Et dans un marché mondial, les paris coûtent des marchés entiers." 
      },
      { 
        title: "LE TEMPS N'ATTEND PAS", 
        phrase: "L'IA n'est plus le futur — c'est le présent. Chaque jour sans infrastructure intelligente est un jour offert à la concurrence." 
      }
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

    let tlRow = 0;
    let tlMobile = false;
    const layoutTimeline = () => {
      tlRow = window.innerHeight * 0.62;
      tlMobile = window.innerWidth < 768;
      tlCardRefs.current.forEach((el, i) => { if (el) el.style.top = `${i * tlRow}px`; });
      tlNodeRefs.current.forEach((el, i) => { if (el) el.style.top = `${i * tlRow}px`; });
      if (tlTrackRef.current) {
        tlTrackRef.current.style.setProperty('--tl-line-top', `${-tlRow * 0.6}px`);
        tlTrackRef.current.style.setProperty('--tl-line-h', `${TL_N * tlRow}px`);
      }
    };
    layoutTimeline();

    let rupMeasure: { ox: number; oy: number; cx: number; cy: number; hr: number } | null = null;

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
      const spacerBottom = scrollSpacerRef.current ? scrollSpacerRef.current.getBoundingClientRect().bottom : Infinity;
      velocity += (targetSpeed - velocity) * 0.1;

      const sp = scrollState.progress;

      // Reset filters and transforms
      if (section1Ref.current) { section1Ref.current.style.filter = 'none'; section1Ref.current.style.transform = 'none'; }
      if (section2Ref.current) { section2Ref.current.style.filter = 'none'; section2Ref.current.style.transform = 'none'; }
      if (siliconCanvasRef.current) { siliconCanvasRef.current.style.filter = 'none'; }
      if (section3Ref.current) { section3Ref.current.style.filter = 'none'; section3Ref.current.style.transform = 'none'; }
      if (section4Ref.current) { section4Ref.current.style.filter = 'none'; section4Ref.current.style.transform = 'none'; }
      if (section5Ref.current) { section5Ref.current.style.filter = 'none'; section5Ref.current.style.transform = 'none'; }

      // Transition progress
      const t12 = Math.max(0, Math.min(1, (sp - 0.18) / 0.07));
      const t23 = Math.max(0, Math.min(1, (sp - 0.48) / 0.07));
      const t34 = Math.max(0, Math.min(1, (sp - 0.77) / 0.05));
      const t45 = Math.max(0, Math.min(1, (sp - 0.90) / 0.05));

      if (flashRef.current && t12 === 0 && t23 === 0 && t34 === 0 && t45 === 0) {
        flashRef.current.style.opacity = '0';
      }

      // --- SECTION ALPHA & CROSSFADES (Direct DOM) ---
      const s1A = sp < 0.20 ? 1 : Math.max(0, 1 - (sp - 0.20) / 0.05);
      const s2A = sp < 0.25 ? 0 : sp < 0.665 ? Math.min(1, (sp - 0.25) / 0.05) : Math.max(0, 1 - (sp - 0.665) / 0.025);
      const s3A = sp < 0.69 ? 0 : sp < 0.83 ? Math.min(1, (sp - 0.69) / 0.015) : Math.max(0, 1 - (sp - 0.83) / 0.05);
      const s4A = sp < 0.83 ? 0 : sp < 0.905 ? 1 : sp < 0.925 ? 1 - (sp - 0.905) / 0.02 : 0;

      // Flash & Transition Effects
      if (flashRef.current) {
        if (t12 > 0 && t12 < 1) {
          flashRef.current.style.opacity = '0';
        } else if (t23 > 0 && t23 < 1) {
          flashRef.current.style.opacity = '0';
        } else if (t34 > 0 && t34 < 1) {
          // Flash removed for t34
          flashRef.current.style.opacity = '0';
        } else if (t45 > 0 && t45 < 1) {
          const f = t45 < 0.5 ? t45 * 2 : 1 - (t45 - 0.5) * 2;
          flashRef.current.style.opacity = (f * 0.7).toString();
          flashRef.current.style.background = '#000000';
        } else {
          flashRef.current.style.opacity = '0';
        }
      }

      if (section1Ref.current) {
          section1Ref.current.style.opacity = s1A.toString();
          if (t12 > 0) {
            section1Ref.current.style.transform = `scale(${1 + t12 * 0.15})`;
          } else {
            section1Ref.current.style.transform = `translate3d(0, ${(1 - s1A) * -30}px, 0)`;
          }
      }
      if (section2Ref.current) {
          section2Ref.current.style.opacity = s2A.toString();
          section2Ref.current.style.background = s2A > 0.5 ? '#000' : 'transparent';
          section2Ref.current.style.visibility = s2A > 0 ? 'visible' : 'hidden';

          if (t12 > 0 && t12 < 1) {
            section2Ref.current.style.transform = `scale(${1.1 - t12 * 0.1})`;
          } else {
            const ty = (1 - s2A) * 60;
            const sc = 0.95 + (s2A * 0.05);
            section2Ref.current.style.transform = `translate3d(0, ${ty}px, 0) scale3d(${sc}, ${sc}, 1)`;
          }
      }
      if (section3Ref.current) {
          section3Ref.current.style.opacity = s3A.toString();
          section3Ref.current.style.visibility = s3A > 0 ? 'visible' : 'hidden';

          if (t23 > 0 && t23 < 1) {
            section3Ref.current.style.transform = `scale(${1.2 - t23 * 0.2})`;
          } else if (t34 > 0 && t34 < 1) {
            section3Ref.current.style.transform = 'none';
          } else {
            const ty = (1 - s3A) * 40;
            section3Ref.current.style.transform = `translate3d(0, ${ty}px, 0)`;
          }
      }
      if (section4Ref.current) {
          const el = section4Ref.current;
          el.style.opacity = s4A.toString();
          el.style.background = '#faf9f5';
          el.style.visibility = s4A > 0 ? 'visible' : 'hidden';
          el.style.pointerEvents = s4A > 0 ? 'auto' : 'none';

          // Révélation circulaire depuis le "O" (point où la plongée se termine)
          const W = window.innerWidth;
          const H = window.innerHeight;
          const cx = rupMeasure ? rupMeasure.cx : W / 2;
          const cy = rupMeasure ? rupMeasure.cy : H / 2;
          const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 40;
          const rv = Math.max(0, Math.min(1, (sp - 0.835) / 0.05));
          const rEase = 1 - Math.pow(1 - rv, 3);
          el.style.clipPath = rv >= 1 ? 'none' : `circle(${rEase * maxR}px at ${cx}px ${cy}px)`;
          el.style.transform = 'none';
      }

      const s5A = sp < 0.93 ? 0 : Math.min(1, (sp - 0.93) / 0.025);

      if (section5Ref.current) {
          const vhNow = window.innerHeight;
          // Le footer monte du bas : le bouton s'efface avant qu'ils se croisent
          const footerTop = spacerBottom + 96;
          const k = Math.max(0, Math.min(1, (0.9 * vhNow - footerTop) / (0.35 * vhNow)));
          const s5Vis = s5A * (1 - k);
          section5Ref.current.style.opacity = s5Vis.toString();
          section5Ref.current.style.visibility = s5Vis > 0 ? 'visible' : 'hidden';
          section5Ref.current.style.pointerEvents = s5Vis > 0.05 ? 'auto' : 'none';

          if (t45 > 0 && t45 < 1) {
            section5Ref.current.style.transform = 'none';
            if (ctaInnerRef.current) {
              const scale = 0.5 + (t45 * 0.5);
              const opacity = t45;
              ctaInnerRef.current.style.transform = `scale3d(${scale}, ${scale}, 1) translateY(${(1 - t45) * 80}px)`;
              ctaInnerRef.current.style.opacity = opacity.toString();
            }
          } else {
            section5Ref.current.style.transform = `translate3d(0, ${-k * vhNow * 0.1}px, 0)`;
            if (ctaInnerRef.current) {
               ctaInnerRef.current.style.transform = 'none';
               ctaInnerRef.current.style.opacity = '1';
            }
          }
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
          
          if (tlTrackRef.current) {
              const vh = window.innerHeight;
              const row = tlRow;
              const p = Math.max(0, Math.min(1, (sp - 0.27) / 0.37));
              const travel = (TL_N - 1) * row + row * 1.3;
              const ty = vh * 0.5 + row * 0.9 - p * travel;
              tlTrackRef.current.style.transform = `translate3d(0, ${ty}px, 0)`;

              const lineTop = -row * 0.6;
              const fillBottom = vh * 0.5 - ty;
              if (tlFillRef.current) {
                  const k = Math.max(0, Math.min(1, (fillBottom - lineTop) / (TL_N * row)));
                  tlFillRef.current.style.transform = `scaleY(${k})`;
              }
              for (let i = 0; i < TL_N; i++) {
                  const y = i * row;
                  const d = Math.abs(y - fillBottom) / row;
                  const raw = y >= fillBottom ? 1 - (d - 0.28) / 0.32 : 1 - (d - 0.7) / 0.3;
                  const v = Math.max(0, Math.min(1, raw));
                  const card = tlCardRefs.current[i];
                  if (card) {
                      const dir = tlMobile ? 1 : (i % 2 === 0 ? -1 : 1);
                      card.style.opacity = v.toString();
                      card.style.transform = `translate3d(${dir * (1 - v) * 60}px, -50%, 0) scale(${0.88 + 0.12 * v})`;
                      card.style.filter = v >= 0.999 ? 'none' : `blur(${(1 - v) * 6}px)`;
                  }
                  const node = tlNodeRefs.current[i];
                  if (node) node.classList.toggle('lit', fillBottom >= y);
              }
          }
      }
      
      // --- SECTION 3: RUPTURE (cadre qui s'agrandit + texte) ---
      if (sp > 0.66 && sp < 0.90) {
          const u = Math.max(0, Math.min(1, (sp - 0.69) / 0.11));
          const seg = (a: number, b: number) => Math.max(0, Math.min(1, (u - a) / (b - a)));
          const ease = (x: number) => 0.5 - Math.cos(Math.PI * x) / 2;
          const e = ease(seg(0.20, 0.68));

          if (rupFrameRef.current) {
              const f = rupFrameRef.current.style;
              const iv = 32 * (1 - e);
              const ih = (window.innerWidth < 768 ? 14 : 26) * (1 - e);
              const pulse = 0.85 + 0.15 * Math.sin(time / 350);
              f.top = `${iv}vh`; f.bottom = `${iv}vh`;
              f.left = `${ih}vw`; f.right = `${ih}vw`;
              f.borderRadius = `${20 * (1 - e)}px`;
              f.borderWidth = '2px';
              f.borderColor = `rgba(255,60,75,${0.95 * (1 - e)})`;
              f.boxShadow = `0 0 ${70 * (1 - e)}px rgba(220,20,40,${0.55 * pulse * (1 - e)}), 0 0 ${18 * (1 - e)}px rgba(255,60,75,${0.6 * (1 - e)}), inset 0 0 ${80 * (1 - e)}px rgba(193,18,35,${0.18 * (1 - e)})`;
          }
          if (rupKickerRef.current) {
              const a = seg(0.28, 0.42);
              rupKickerRef.current.style.opacity = a.toString();
              rupKickerRef.current.style.transform = `translate3d(0, ${(1 - a) * 20}px, 0)`;
          }
          const wins = [[0.50, 0.62], [0.60, 0.72], [0.70, 0.82]];
          // Battement de coeur sur "MORT" : s'affaiblit puis s'arrête (ligne plate)
          const env = seg(0.78, 0.84) * (1 - seg(0.86, 0.98));
          const phase = ((time / 1000) / 0.9) % 1;
          const beat = Math.max(
            Math.exp(-Math.pow((phase - 0.08) / 0.05, 2)),
            0.6 * Math.exp(-Math.pow((phase - 0.30) / 0.06, 2))
          ) * env;
          rupWordRefs.current.forEach((el, i) => {
              if (!el) return;
              const a = seg(wins[i][0], wins[i][1]);
              let op = a;
              if (i === 0) op = a * (1 - 0.55 * seg(0.80, 0.90));
              el.style.opacity = op.toString();
              const sc = i === 2 ? 1 + 0.045 * beat : 1;
              el.style.transform = `translate3d(0, ${(1 - a) * 40}px, 0) scale(${sc})`;
              el.style.filter = a >= 0.999 ? 'none' : `blur(${(1 - a) * 8}px)`;
              if (i === 2) el.style.textShadow = `0 0 ${12 + 22 * beat}px rgba(193,18,35,${0.2 + 0.4 * beat})`;
          });
          if (rupEcgRef.current) rupEcgRef.current.style.strokeDashoffset = (1 - seg(0.78, 1)).toString();
          if (rupStrikeRef.current) rupStrikeRef.current.style.transform = `scaleX(${seg(0.80, 0.90)})`;
          if (rupGlowRef.current) rupGlowRef.current.style.opacity = (0.35 + 0.65 * seg(0.68, 0.86)).toString();

          // Plongée dans le "O" de MORT
          const v = Math.max(0, Math.min(1, (sp - 0.80) / 0.03));
          const content = rupContentRef.current;
          const iris = rupIrisRef.current;
          if (content && iris) {
              if (v > 0) {
                  if (!rupMeasure && rupORef.current) {
                      content.style.transform = 'none';
                      const o = rupORef.current.getBoundingClientRect();
                      const c = content.getBoundingClientRect();
                      const cx = o.left + o.width / 2;
                      const cy = o.top + o.height / 2;
                      rupMeasure = { ox: cx - c.left, oy: cy - c.top, cx, cy, hr: o.width * 0.2 };
                  }
                  if (rupMeasure) {
                      const S = Math.exp(v * Math.log(14));
                      content.style.transformOrigin = `${rupMeasure.ox}px ${rupMeasure.oy}px`;
                      content.style.transform = `scale(${S})`;
                      const r = rupMeasure.hr * S * (1 + 6 * v * v * v);
                      iris.style.clipPath = `circle(${r}px at ${rupMeasure.cx}px ${rupMeasure.cy}px)`;
                  }
              } else {
                  content.style.transform = 'none';
                  iris.style.clipPath = 'circle(0px at 50% 50%)';
              }
          }
          rupWordRefs.current.forEach((el, i) => {
              if (!el) return;
              el.style.willChange = v > 0 ? 'auto' : 'transform, opacity, filter';
              if (v > 0) {
                  if (i < 2) el.style.opacity = (parseFloat(el.style.opacity || '1') * (1 - Math.min(1, v * 3))).toString();
                  if (i === 2) el.style.textShadow = 'none';
              }
          });
          const ecg = rupEcgRef.current?.ownerSVGElement;
          if (ecg) ecg.style.opacity = (1 - Math.min(1, v * 3)).toString();
      }

      rafHandle = requestAnimationFrame(raf);
    };
    rafHandle = requestAnimationFrame(raf);

    const handleResize = () => {
        rupMeasure = null;
        layoutTimeline();
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

        /* SECTION 2 : TIMELINE DE CARTES */
        .tl-viewport { position: absolute; inset: 0; z-index: 20; pointer-events: none; overflow: hidden; }
        .tl-track { position: absolute; left: 0; top: 0; width: 100%; height: 0; will-change: transform; }
        .tl-line-bg, .tl-line-fill { position: absolute; left: 50%; width: 2px; margin-left: -1px; top: var(--tl-line-top, 0px); height: var(--tl-line-h, 0px); }
        .tl-line-bg { background: rgba(0, 208, 255, 0.15); }
        .tl-line-fill { background: linear-gradient(to bottom, #00d0ff, #ffffff, #00d0ff); box-shadow: 0 0 16px rgba(0, 208, 255, 0.9); transform-origin: top; transform: scaleY(0); }
        .tl-node { position: absolute; left: 50%; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%; background: #05080c; border: 3px solid rgba(0, 208, 255, 0.35); transition: all 0.5s ease; z-index: 3; }
        .tl-node.lit { border-color: #00d0ff; box-shadow: 0 0 16px rgba(0, 208, 255, 0.8); }
        .tl-card { position: absolute; width: min(540px, 42vw); padding: 2rem 2.35rem; background: rgba(8, 10, 14, 0.82); border: 1px solid rgba(0, 208, 255, 0.25); border-radius: 16px; box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 208, 255, 0.08); backdrop-filter: blur(6px); will-change: transform, opacity, filter; opacity: 0; }
        .tl-card.tl-left { right: calc(50% + 56px); text-align: right; }
        .tl-card.tl-right { left: calc(50% + 56px); text-align: left; }
        .tl-card::after { content: ""; position: absolute; top: 50%; width: 40px; height: 2px; background: rgba(0, 208, 255, 0.4); }
        .tl-card.tl-left::after { right: -40px; }
        .tl-card.tl-right::after { left: -40px; }
        .tl-label { display: inline-block; margin-bottom: 0.5rem; font-family: monospace; font-size: 0.9rem; letter-spacing: 0.15em; color: #00d0ff; }
        .tl-card h3 { margin: 0 0 0.75rem; font-size: 1.85rem; font-weight: 500; line-height: 1.2; letter-spacing: -0.01em; color: #ffffff; }
        .tl-card p { margin: 0; font-size: 1.12rem; line-height: 1.7; font-weight: 300; color: rgba(255, 255, 255, 0.82); }
        @media (max-width: 768px) {
          .tl-line-bg, .tl-line-fill, .tl-node { left: 20px; }
          .tl-card, .tl-card.tl-left, .tl-card.tl-right { left: 48px; right: auto; width: calc(100vw - 68px); text-align: left; }
          .tl-card.tl-left::after, .tl-card.tl-right::after { left: -28px; right: auto; width: 28px; }
          .tl-card h3 { font-size: 1.5rem; }
          .tl-card p { font-size: 1rem; }
          .tl-card { padding: 1.5rem 1.5rem; }
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
            letter-spacing: 0.1em;
            text-transform: uppercase;
            font-weight: 900;
            z-index: 50;
            text-align: center;
            color: #ffffff;
            text-shadow: 0 20px 80px rgba(0,0,0,1), 0 0 100px rgba(0,0,0,0.8);
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

        /* SECTION 3 : RUPTURE */
        .rup { position: absolute; inset: 0; background: #000; overflow: hidden; }
        .rup-frame { position: absolute; top: 24vh; bottom: 24vh; left: 18vw; right: 18vw; border-radius: 20px; border: 1px solid rgba(0, 208, 255, 0.5); overflow: hidden; background: #05080c; }
        .rup-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(0, 208, 255, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 208, 255, 0.07) 1px, transparent 1px); background-size: 64px 64px; -webkit-mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%); mask-image: radial-gradient(ellipse at center, #000 30%, transparent 75%); }
        .rup-glow { position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 50%, rgba(0, 208, 255, 0.22), transparent 62%); opacity: 0.35; }
        .rup-content { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 5vw; }
        .rup-kicker { font-family: monospace; font-size: 0.85rem; letter-spacing: 0.35em; color: #00d0ff; margin-bottom: 1.5rem; opacity: 0; }
        .rup-title { margin: 0; font-size: clamp(2.6rem, 11vw, 10rem); font-weight: 900; line-height: 1.02; letter-spacing: 0.04em; text-transform: uppercase; color: #ffffff; display: flex; flex-direction: column; align-items: center; }
        .rup-word { position: relative; display: inline-block; opacity: 0; will-change: transform, opacity, filter; }
        .rup-accent { color: #00d0ff; text-shadow: 0 0 40px rgba(0, 208, 255, 0.7); }
        .rup-strike { position: absolute; left: -2%; right: -2%; top: 52%; height: 0.08em; background: #00d0ff; box-shadow: 0 0 20px rgba(0, 208, 255, 0.9); transform-origin: left; transform: scaleX(0); }

        /* SECTION 3 : thème rouge sang */
        .rup-frame { background: #030203; }
        .rup-grid { background-image: none; }
        .rup-glow { background: radial-gradient(ellipse at 50% 105%, rgba(150, 10, 25, 0.38), transparent 62%); }
        .rup-accent { color: #c1121f; text-shadow: 0 0 18px rgba(193, 18, 35, 0.4); }
        .rup-strike { background: #c1121f; box-shadow: 0 0 10px rgba(193, 18, 35, 0.5); }
        .rup-ecg path { stroke: #c1121f; filter: drop-shadow(0 0 4px rgba(193, 18, 35, 0.6)); }

        /* SECTION 3 : hiérarchie + battement */
        .rup-title { font-size: clamp(2.2rem, 8vw, 7rem); line-height: 1.12; letter-spacing: 0.06em; }
        .rup-word:nth-child(1) { font-weight: 200; color: rgba(255, 255, 255, 0.6); }
        .rup-word:nth-child(2) { font-weight: 300; font-size: 0.32em; letter-spacing: 0.5em; margin: 0.6em 0; }
        .rup-accent { font-weight: 900; }
        .rup-strike { top: 50%; height: 0.03em; background: #d91425; }
        .rup-ecg { width: min(640px, 70vw); height: 64px; margin-top: 2.5rem; overflow: visible; }
        .rup-ecg path { fill: none; stroke: #c1121f; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; vector-effect: non-scaling-stroke; stroke-dasharray: 1; stroke-dashoffset: 1; filter: drop-shadow(0 0 4px rgba(193, 18, 35, 0.6)); }

        /* SECTION 3 : plongée dans le O */
        .rup-o { display: inline-block; }
        .rup-iris { position: absolute; inset: 0; background: #000; clip-path: circle(0px at 50% 50%); pointer-events: none; z-index: 5; }

        /* SECTION 4 : FONDATEUR (fond clair) */
        .fd-wrap { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; gap: clamp(2rem, 8vw, 7rem); padding: 0 6vw; color: #0b0b0d; font-family: 'Helvetica Neue', 'Arial', sans-serif; }
        .fd-col { display: flex; flex-direction: column; }
        .fd-left { gap: 2.5rem; align-items: flex-start; }
        .fd-right { gap: 1.75rem; width: min(520px, 42vw); }
        .fd-item { opacity: 0; will-change: transform, opacity; }
        .fd-label { display: block; font-family: monospace; font-size: 0.78rem; letter-spacing: 0.3em; color: #087a91; margin-bottom: 1.25rem; }
        .fd-name { margin: 0; font-size: clamp(2.6rem, 6.4vw, 6rem); font-weight: 200; line-height: 1.02; letter-spacing: -0.03em; }
        .fd-role { margin: 1.25rem 0 0; font-size: 1.05rem; font-weight: 400; letter-spacing: 0.04em; color: rgba(11, 11, 13, 0.6); }
        .fd-portrait { width: min(240px, 26vw); aspect-ratio: 3 / 4; border-radius: 14px; border: 1px solid rgba(11, 11, 13, 0.15); background: #e6e3db; display: flex; align-items: center; justify-content: center; }
        .fd-portrait span { font-size: 3.2rem; font-weight: 200; letter-spacing: 0.12em; color: rgba(11, 11, 13, 0.25); }
        .fd-pillar { display: grid; grid-template-columns: 3rem 1fr; gap: 1rem; padding-top: 1.25rem; border-top: 1px solid rgba(11, 11, 13, 0.18); }
        .fd-num { font-family: monospace; font-size: 0.8rem; letter-spacing: 0.2em; color: #087a91; padding-top: 0.35rem; }
        .fd-pillar h3 { margin: 0 0 0.4rem; font-size: clamp(1.25rem, 2vw, 1.7rem); font-weight: 500; letter-spacing: -0.01em; }
        .fd-pillar p { margin: 0; font-size: 1rem; font-weight: 300; line-height: 1.6; color: rgba(11, 11, 13, 0.65); }
        .fd-team { padding-top: 1.25rem; border-top: 1px solid rgba(11, 11, 13, 0.18); }
        .fd-team .fd-label { margin-bottom: 0.9rem; }
        .fd-slots { display: flex; gap: 0.6rem; }
        .fd-slot { width: 2.4rem; height: 2.4rem; border-radius: 50%; border: 1px dashed rgba(11, 11, 13, 0.35); display: block; }
        @media (max-width: 768px) {
          .fd-wrap { flex-direction: column; justify-content: center; gap: 1.5rem; padding: 0 7vw; overflow: hidden; }
          .fd-left { flex-direction: row; align-items: center; gap: 1.25rem; }
          .fd-portrait { width: 96px; flex-shrink: 0; }
          .fd-name { font-size: clamp(2rem, 9vw, 3rem); }
          .fd-right { width: 100%; gap: 1rem; }
          .fd-pillar p { font-size: 0.9rem; }
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
      <div 
        ref={flashRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#ffffff',
          opacity: 0,
          zIndex: 100,
          pointerEvents: 'none',
          transition: 'opacity 0.05s ease',
        }}
      />

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

        <div className="tl-viewport">
          <div className="tl-track" ref={tlTrackRef}>
            <div className="tl-line-bg" />
            <div className="tl-line-fill" ref={tlFillRef} />
            {TL_CARDS.map((c, i) => (
              <React.Fragment key={c.title}>
                <div className="tl-node" ref={(el) => { tlNodeRefs.current[i] = el; }} />
                <article
                  className={`tl-card ${i % 2 === 0 ? 'tl-left' : 'tl-right'}`}
                  ref={(el) => { tlCardRefs.current[i] = el; }}
                >
                  <span className="tl-label">{c.label}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                </article>
              </React.Fragment>
            ))}
          </div>
        </div>
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
        <div className="rup">
          <div className="rup-frame" ref={rupFrameRef}>
            <div className="rup-grid" />
            <div className="rup-glow" ref={rupGlowRef} />
            <div className="rup-content" ref={rupContentRef}>
              <h1 className="rup-title">
                <span className="rup-word" ref={(el) => { rupWordRefs.current[0] = el; }}>
                  LE MANUEL
                  <i className="rup-strike" ref={rupStrikeRef} />
                </span>
                <span className="rup-word" ref={(el) => { rupWordRefs.current[1] = el; }}>EST</span>
                <span className="rup-word rup-accent" ref={(el) => { rupWordRefs.current[2] = el; }}>M<span className="rup-o" ref={rupORef}>O</span>RT</span>
              </h1>
              <svg className="rup-ecg" viewBox="0 0 600 80" preserveAspectRatio="none" aria-hidden="true">
                <path ref={rupEcgRef} pathLength={1} d="M0 40 H100 L112 40 L124 6 L140 74 L152 22 L160 40 H240 L250 40 L258 18 L268 60 L276 32 L282 40 H350 L356 40 L362 30 L368 50 L372 40 H600" />
              </svg>
            </div>
          </div>
          <div className="rup-iris" ref={rupIrisRef} />
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
        <HoverSlider className="min-h-screen flex flex-col justify-center py-16 px-6 md:px-24 bg-[#faf9f5] text-[#3d3929]">
          <div className="flex flex-wrap items-center justify-between gap-12 md:gap-20 max-w-7xl mx-auto w-full">
            <div className="flex flex-col space-y-2 md:space-y-3 flex-1 min-w-[300px]">
              {[
                { title: "PAPE AMADOU MBAYE" },
                { title: "FONDATEUR & ARCHITECTE IA" },
                { title: "STRATÉGIE & VISION" },
                { title: "AGENTS & AUTOMATISATION" },
                { title: "CROISSANCE & CLIENTS" }
              ].map((slide, index) => (
                <TextStaggerHover
                  key={slide.title}
                  index={index}
                  className="cursor-pointer text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter transition-all duration-500 whitespace-nowrap"
                  text={slide.title}
                />
              ))}
            </div>
            <HoverSliderImageWrap className="w-full max-w-[280px] aspect-[3/4] flex-shrink-0">
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
          background: '#000',
          isolation: 'isolate',
        }}
      >
        <div ref={ctaInnerRef} className="h-full w-full flex items-center justify-center">
          <ActionCta onCTAClick={(dest) => navigate(dest)} />
        </div>
      </section>

      {/* SCROLL TRIGGER */}
      <div className="scroll-spacer" ref={scrollSpacerRef}></div>
    </div>
  );
}
