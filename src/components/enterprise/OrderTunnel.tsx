import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { saveOrder } from '../../lib/supabaseClient';

interface OrderTunnelProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
}

export const OrderTunnel: React.FC<OrderTunnelProps> = ({ isOpen, onClose, price }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLogoUploaded, setIsLogoUploaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    sector: '',
    message: ''
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('tunnel-body-locked');
      setTimeout(() => setIsVisible(true), 10);
      initParticles();

      // Read context from session storage
      const saved = sessionStorage.getItem('autoslash_selection');
      if (saved) {
        try {
          const context = JSON.parse(saved);
          setFormData(prev => ({
            ...prev,
            company: context.template_name || '',
            sector: context.template_sector || ''
          }));
        } catch (e) {
          console.error('Context parse error', e);
        }
      }
    } else {
      document.body.classList.remove('tunnel-body-locked');
      setIsVisible(false);
      setTimeout(() => {
        setCurrentStep(1);
        setErrorMsg(null);
      }, 500);
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const { error } = await saveOrder({
      name: formData.company || `${formData.firstName} ${formData.lastName}`,
      package_type: 'ENTERPRISE',
      sector: formData.sector,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      comm_mode: 'WHATSAPP',
      region: 'Dakar'
    });

    setIsSubmitting(false);
    if (!error) {
      setCurrentStep(5);
    } else {
      setErrorMsg("Échec de l'activation. Veuillez vérifier votre connexion.");
    }
  };

  const toggleStep = (idx: number) => {
    setExpandedSteps(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('tunnel-body-locked');
      setTimeout(() => setIsVisible(true), 10);
      initParticles();
    } else {
      document.body.classList.remove('tunnel-body-locked');
      setIsVisible(false);
      setTimeout(() => setCurrentStep(1), 500);
    }
  }, [isOpen]);

  const initParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const pts: any[] = [];

    const onResize = () => {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    for (let i = 0; i < 60; i++) {
      pts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * 0.4 + 0.08
      });
    }

    let rafId: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(42, 109, 245, ${p.a})`;
        ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(rafId);
    };
  };

  const fmt = (n: number) => {
    return Math.round(n).toLocaleString('fr-FR') + ' FCFA';
  };

  const meta: Record<number, { s: string; n: string }> = {
    1: { s: 'Étape 01 / 05', n: 'Plan stratégique Premium' },
    2: { s: 'Étape 02 / 05', n: "Protocole d'engagement" },
    3: { s: 'Étape 03 / 05', n: 'Contexte Organisationnel' },
    4: { s: 'Étape 04 / 05', n: 'Contact Direction' },
    5: { s: 'Silo Enterprise', n: 'Statut : Programmation en cours' },
  };

  const goStep = (n: number) => {
    setCurrentStep(n);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLogoUploaded(true);
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: isVisible ? 'auto' : 'none', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }} />
      <div className="dot-grid" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(42, 109, 245, 0.11) 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
      <div className="scan-line" style={{ position: 'fixed', left: 0, right: 0, height: '2px', zIndex: -1, pointerEvents: 'none', background: 'linear-gradient(90deg, transparent, rgba(42, 109, 245, 0.16), transparent)', animation: 'scan-y 10s linear infinite' }}></div>

      <div 
        className="progress-bar-tunnel" 
        style={{ width: `${isVisible ? currentStep * 20 : 0}%`, backgroundColor: '#2a6df5' }}
      ></div>

      <div 
        id="tunnel-overlay" 
        className={isVisible ? 'active' : ''} 
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      ></div>

      <div id="tunnel-modal" className={isVisible ? 'open' : ''} style={{ zIndex: 1, borderColor: 'rgba(42, 109, 245, 0.2)' }}>
        <div className="modal-inner">
          <div className="cx-tunnel tl" style={{ borderColor: '#2a6df5' }}></div>
          <div className="cx-tunnel tr" style={{ borderColor: '#2a6df5' }}></div>
          <div className="cx-tunnel bl" style={{ borderColor: '#2a6df5' }}></div>
          <div className="cx-tunnel br" style={{ borderColor: '#2a6df5' }}></div>

          <div className="modal-hdr">
            <span className="step-lbl" style={{ color: '#2a6df5' }}>{meta[currentStep].s}</span>
            <span className="step-nm">{meta[currentStep].n}</span>
          </div>

          <div className="prog-row">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`pd ${i <= currentStep ? 'on' : ''}`}
                style={{ backgroundColor: i <= currentStep ? '#2a6df5' : 'rgba(255,255,255,0.1)' }}
              ></div>
            ))}
          </div>

          {/* STEP 1: Plan stratégique */}
          <div className={`step-content ${currentStep === 1 ? 'active' : ''}`}>
            <div className="step-eyebrow text-white text-[14px] font-bold">Processus Master — 21 à 30 jours</div>
            <div className="step-lead text-white text-[13px] opacity-90 mb-6">Voici comment nous allons déployer et personnaliser votre Infrastructure Master</div>
            <div style={{ position: 'relative', paddingTop: '2px' }}>
              {[
                { 
                  day: "Jours 01–06", 
                  title: "Audit Global et Cartographie des Données", 
                  desc: "Audit exhaustif de votre structure et injection massive de votre patrimoine de données",
                  hiddenDesc: "Nos ingénieurs réalisent une cartographie complète de vos processus métier. Nous procédons à l'injection sécurisée de l'ensemble de vos données (documents, historiques, process sectoriels) pour configurer la base de connaissance de votre organisation."
                },
                { 
                  day: "Jours 07–14", 
                  title: "Ingénierie Multi-Agents et Flux Autonomes", 
                  desc: "Déploiement et entraînement de votre équipe de 3 à 5 agents IA experts",
                  hiddenDesc: "Configuration de vos agents spécialisés (Commercial, Contenu, RAG). Nous créons les protocoles de collaboration entre vos agents pour qu'ils gèrent de manière autonome vos leads, vos réseaux sociaux et vos outils professionnels 24h/24."
                },
                { 
                  day: "Jours 15–24", 
                  title: "Déploiement de l'Admin Platform Prestige", 
                  desc: "Mise en place de votre infrastructure de gestion alimentée par l'IA",
                  hiddenDesc: "Installation de votre Admin Platform personnalisée. Nous connectons votre centre de contrôle central à vos flux de données pour générer des rapports intelligents et piloter l'intégralité de vos opérations depuis une interface unique."
                },
                { 
                  day: "Jours 25–30", 
                  title: "Optimisation Critique et Livraison Prestige", 
                  desc: "Tests de haute performance, validation Prestige-Slashed et mise en service globale",
                  hiddenDesc: "Phase finale de tests de résistance et d'optimisation des réponses IA. Nous finalisons votre infrastructure avec une garantie de performance absolue. Une session stratégique de passation est organisée pour le lancement officiel de votre empire technologique."
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className={`rm-row ${currentStep === 1 ? 'vis' : ''}`}
                  style={{ transitionDelay: `${idx * 0.3}s` }}
                >
                  <div className="rm-dot-col">
                    <div className="rm-dot" style={{ backgroundColor: '#2a6df5', boxShadow: '0 0 10px #2a6df5' }}></div>
                    {idx < 3 && <div className="rm-line" style={{ background: 'linear-gradient(to bottom, #2a6df5, rgba(42,109,245,0.1))' }}></div>}
                  </div>
                  <div className="flex-1">
                    <div className="rm-day text-[#2a6df5] text-[11px] font-bold uppercase tracking-widest">{item.day}</div>
                    <div className="rm-title text-white text-[16px] font-bold mb-1">{item.title}</div>
                    <div 
                      className="rm-desc text-white opacity-80 text-[13px] mt-1 flex items-center gap-2 cursor-pointer group" 
                      onClick={() => toggleStep(idx)}
                    >
                      <span>{item.desc}</span>
                      <div className={`text-[#2a6df5] blink-dot transition-transform duration-300 ${expandedSteps.includes(idx) ? 'rotate-180' : ''}`}>
                        <ChevronDown size={14} strokeWidth={3} />
                      </div>
                    </div>
                    <div className="rm-desc text-white opacity-80 text-[13px]">
                      <AnimatePresence>
                        {expandedSteps.includes(idx) && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="mt-3 text-[12px] leading-relaxed text-white/50 border-l border-[#2a6df5]/30 pl-3 italic">
                              {item.hiddenDesc}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <div className="flex-1"></div>
              <button className="ai-btn flex-1" style={{ backgroundColor: '#2a6df5' }} onClick={() => goStep(2)}>Confirmer →</button>
            </div>
          </div>

          {/* STEP 2: Conditions */}
          <div className={`step-content ${currentStep === 2 ? 'active' : ''}`}>
            <div className="step-eyebrow text-white text-[14px] font-bold">Conditions Prestige Enterprise</div>
            <div className="step-lead text-white text-[13px] opacity-90 mb-6">Investissement sécurisé. Priorité maximale d'ingénierie.</div>
            <div className="p-row py-4" style={{ borderColor: 'rgba(42, 109, 245, 0.1)' }}>
              <div>
                <div className="p-lbl text-white text-[11px] font-bold opacity-70">Investissement Premium</div>
                <div style={{ color: 'white', fontSize: '18px', letterSpacing: '0.1em', marginTop: '3px', fontWeight: 'bold' }}>{fmt(price)}</div>
              </div>
            </div>
            <div className="p-row py-4" style={{ borderColor: 'rgba(42, 109, 245, 0.1)' }}>
              <div>
                <div className="p-lbl text-white text-[11px] font-bold opacity-70">Acompte Lancement (50%)</div>
                <div className="p-val text-white text-[24px] font-bold">{fmt(price / 2)}</div>
              </div>
              <div className="p-tag text-[#2a6df5] opacity-60">Activation immédiate</div>
            </div>
            <div className="p-row py-4" style={{ borderBottom: 'none' }}>
              <div>
                <div className="p-lbl text-white text-[11px] font-bold opacity-70">Solde Déploiement Final (50%)</div>
                <div className="p-val text-white/60 text-[24px] font-bold">{fmt(price / 2)}</div>
              </div>
              <div className="p-tag text-white opacity-60">Validation J+30</div>
            </div>
            <div className="gold-badge mt-6 p-4 text-[11px] border-[#2a6df5]/40 bg-[#2a6df5]/10 text-[#2a6df5]">
              ★ &nbsp;Garantie Prestige — Inclus maintenance complète, 5M tokens/mois et support VIP 24/7 pendant les 6 premiers mois. Maintenance et Hébergement : 100 000 FCFA/mois.
            </div>
            <div className="flex gap-4 mt-8">
              <button className="ai-btn-sec flex-1" onClick={() => goStep(1)}>← Précédent</button>
              <button className="ai-btn flex-1" style={{ backgroundColor: '#2a6df5' }} onClick={() => goStep(3)}>Confirmer →</button>
            </div>
          </div>

          {/* STEP 3: Context */}
          <div className={`step-content ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-eyebrow text-white text-[14px] font-bold">Configuration du Silo Prestige</div>
            <div className="step-lead text-white text-[13px] opacity-90 mb-6">Nous construisons une intelligence qui vous ressemble.</div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">Organisation / Groupe Enterprise</div>
              <input 
                className="ai-input text-white text-[14px] py-3 focus:border-[#2a6df5]" 
                type="text" 
                name="company"
                placeholder="Ex : Global Industries Worldwide" 
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">Vision IA Stratégique (Secteur)</div>
              <input 
                className="ai-input text-white text-[14px] py-3 focus:border-[#2a6df5]" 
                type="text" 
                name="sector"
                placeholder="Dites-nous quel processus vous voulez automatiser totalement..." 
                value={formData.sector}
                onChange={handleInputChange}
              />
            </div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">Documentation et Logos</div>
              <div 
                className={`dropzone py-6 ${isLogoUploaded ? 'done' : ''}`}
                style={{ borderColor: isLogoUploaded ? '#2a6df5' : 'rgba(255,255,255,0.1)' }}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('hover'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('hover'); }}
                onDrop={handleDrop}
              >
                {isLogoUploaded ? (
                  <>
                    <span className="text-[#2a6df5] text-[14px] font-bold">✓ Documents Enterprise Chiffrés</span><br />
                    <span style={{ opacity: 0.9, fontSize: '11px', letterSpacing: '0.1em', color: 'white' }}>analyse par agent master...</span>
                  </>
                ) : (
                  <>
                    <span className="text-white text-[14px] font-bold">↑ Charger votre stack documentaire</span><br />
                    <span style={{ opacity: 0.8, fontSize: '11px', letterSpacing: '0.1em', color: 'white' }}>ZIP · PDF · ASSETS acceptés</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button className="ai-btn-sec flex-1" onClick={() => goStep(2)}>← Précédent</button>
              <button className="ai-btn flex-1" style={{ backgroundColor: '#2a6df5' }} onClick={() => goStep(4)}>Lancer Ingénierie Master →</button>
            </div>
          </div>

          {/* STEP 4: Contact Direction */}
          <div className={`step-content ${currentStep === 4 ? 'active' : ''}`}>
             <main className="py-2">
                <div className="max-w-lg mx-auto space-y-3 text-center">
                    <h3 className="text-[#2a6df5] font-semibold text-[14px] uppercase tracking-widest">
                        Ligne Directe Enterprise
                    </h3>
                    <p className="text-white text-2xl font-bold sm:text-3xl">
                        Audit Stratégique VIP
                    </p>
                    <p className="text-white opacity-80 text-[13px]">
                        Un expert IA senior vous recontacte pour finaliser le blueprint de votre infrastructure.
                    </p>
                </div>
                <div className="mt-8 max-w-lg mx-auto">
                    <form onSubmit={handleFormSubmit} className="space-y-5">
                        <div className="flex flex-col items-center gap-y-5 gap-x-6 [&>*]:w-full sm:flex-row">
                            <div>
                                <label className="flbl text-white text-[11px] font-bold">Prénom (Direction)</label>
                                <input 
                                  type="text" 
                                  name="firstName"
                                  required 
                                  className="ai-input text-white text-[14px] focus:border-[#2a6df5]" 
                                  placeholder="Jean" 
                                  value={formData.firstName}
                                  onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="flbl text-white text-[11px] font-bold">Nom</label>
                                <input 
                                  type="text" 
                                  name="lastName"
                                  required 
                                  className="ai-input text-white text-[14px] focus:border-[#2a6df5]" 
                                  placeholder="Dupont" 
                                  value={formData.lastName}
                                  onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="flbl text-white text-[11px] font-bold">Email Institutionnel</label>
                            <input 
                              type="email" 
                              name="email"
                              required 
                              className="ai-input text-white text-[14px] focus:border-[#2a6df5]" 
                              placeholder="ceo@groupe.com" 
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="flbl text-white text-[11px] font-bold">Contact Privé (WhatsApp)</label>
                            <input 
                              type="text" 
                              name="phone"
                              placeholder="+221 ..." 
                              required 
                              className="ai-input text-white text-[14px] focus:border-[#2a6df5]" 
                              value={formData.phone}
                              onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="flbl text-white text-[11px] font-bold">Notes Stratégiques Importantes</label>
                            <textarea 
                              name="message"
                              required 
                              className="ai-input text-white text-[14px] h-24 resize-none focus:border-[#2a6df5]" 
                              placeholder="Confidentialité requise, délais spécifiques..."
                              value={formData.message}
                              onChange={handleInputChange}
                            ></textarea>
                        </div>
                        {errorMsg && <div className="text-red-500 text-[11px] font-bold">{errorMsg}</div>}
                        <button 
                          type="submit" 
                          disabled={isSubmitting}
                          className="ai-btn w-full" 
                          style={{ backgroundColor: '#2a6df5' }}
                        >
                            {isSubmitting ? 'Réservation en cours...' : 'Confirmer la Réservation Prestige'}
                        </button>
                    </form>
                </div>
            </main>
            <div className="flex gap-4 mt-8">
              <button className="ai-btn-sec flex-1" onClick={() => goStep(3)}>← Précédent</button>
            </div>
          </div>

          {/* STEP 5: Success */}
          <div className={`step-content ${currentStep === 5 ? 'active' : ''}`} style={{ textAlign: 'center' }}>
            <div className="status-ring" style={{ borderColor: '#2a6df5' }}>
              <span style={{ color: '#2a6df5', fontSize: '32px', lineHeight: 1 }}>★</span>
            </div>
            <div style={{ color: 'white', fontSize: '22px', letterSpacing: '0.26em', marginBottom: '8px', fontWeight: 900, textTransform: 'uppercase' }}>IA Master Activée</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', letterSpacing: '0.04em', marginBottom: '32px' }}>
              Votre demande a été placée en priorité absolue.
            </div>
            <div 
              style={{ padding: '24px', background: 'rgba(5, 10, 28, 0.72)', border: '1px solid rgba(42, 109, 245, 0.14)', borderRadius: '4px', textAlign: 'left', marginBottom: '24px' }}
            >
              <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', letterSpacing: '0.34em', marginBottom: '12px', textTransform: 'uppercase' }}>Provisionnement Enterprise</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span className="blink-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2a6df5', boxShadow: '0 0 10px #2a6df5' }}></span>
                <span style={{ color: '#2a6df5', fontSize: '14px', letterSpacing: '0.08em', fontWeight: 'bold' }}>Audit direction programmé sous 12h</span>
              </div>
              <div style={{ background: 'rgba(42, 109, 245, 0.08)', borderRadius: '2px', height: '6px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #2a6df5, #1a5de5)', width: '7%', transition: 'width 6s ease' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '10px' }}>Système Initialisé</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '10px' }}>Livraison Prestige J+30</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="ai-btn" style={{ flex: 1, padding: '16px', marginTop: 0, backgroundColor: '#2a6df5' }} onClick={onClose}>
                ← Quitter le Hub Prestige
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
