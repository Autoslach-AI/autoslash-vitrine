import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

interface OrderTunnelProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
}

export const OrderTunnel: React.FC<OrderTunnelProps> = ({ isOpen, onClose, price }) => {
  const navigate = useNavigate();
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
    region: 'Dakar',
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

    try {
      const templateId = sessionStorage.getItem('template_id') || null;
      
      console.log('=== DÉBUT SOUMISSION ===');
      console.log('FormData:', formData);
      console.log('TemplateId:', templateId);

      const payload = {
        name: formData.company || `${formData.firstName} ${formData.lastName}`,
        package_type: 'BUSINESS',
        sector: formData.sector,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        region: formData.region || 'Dakar',
        template_id: templateId,
        status: 'PROSPECT',
        is_test: false
      };

      console.log('Payload envoyé:', payload);

      if (!supabase) {
        throw new Error("Supabase client is not initialized.");
      }

      const { data, error } = await supabase
        .from('enterprises')
        .insert(payload)
        .select()
        .single();

      console.log('Réponse Supabase data:', data);
      console.log('Réponse Supabase error:', error);

      if (error) {
        console.error('ERREUR SUPABASE:', error.message, error.details, error.hint);
        setErrorMsg(`Erreur: ${error.message}`);
        setIsSubmitting(false);
        return;
      }

      // Log NEW_PROSPECT
      if (data) {
        const { error: logError } = await supabase
          .from('admin_intelligence_logs')
          .insert({
            client_id: data.id,
            issue_type: 'NEW_PROSPECT',
            severity_level: 'INFO',
            raw_context: `NOUVEAU PROSPECT — ${data.name} · ${data.sector} · ${data.region} · BUSINESS · ${data.project_id}`
          });
        
        console.log('Log error:', logError);
      }

      setIsSubmitting(false);
      setCurrentStep(5);

    } catch (err) {
      console.error('ERREUR INATTENDUE:', err);
      setErrorMsg(`Erreur inattendue: ${err}`);
      setIsSubmitting(false);
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
        ctx.fillStyle = `rgba(0, 240, 255, ${p.a})`;
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
    1: { s: 'Étape 01 / 05', n: 'Plan de déploiement' },
    2: { s: 'Étape 02 / 05', n: "Conditions d'engagement" },
    3: { s: 'Étape 03 / 05', n: "Injection d'identité" },
    4: { s: 'Étape 04 / 05', n: 'Prise de contact' },
    5: { s: 'Mission activée', n: 'Statut : en cours' },
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
      <div className="dot-grid" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(0, 240, 255, 0.11) 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
      <div className="scan-line" style={{ position: 'fixed', left: 0, right: 0, height: '2px', zIndex: -1, pointerEvents: 'none', background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.16), transparent)', animation: 'scan-y 10s linear infinite' }}></div>

      <div 
        className="progress-bar-tunnel" 
        style={{ width: `${isVisible ? currentStep * 20 : 0}%`, backgroundColor: '#00F0FF' }}
      ></div>

      <div 
        id="tunnel-overlay" 
        className={isVisible ? 'active' : ''} 
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      ></div>

      <div id="tunnel-modal" className={isVisible ? 'open' : ''} style={{ zIndex: 1, borderColor: 'rgba(0, 240, 255, 0.2)' }}>
        <div className="modal-inner">
          <div className="cx-tunnel tl" style={{ borderColor: '#00F0FF' }}></div>
          <div className="cx-tunnel tr" style={{ borderColor: '#00F0FF' }}></div>
          <div className="cx-tunnel bl" style={{ borderColor: '#00F0FF' }}></div>
          <div className="cx-tunnel br" style={{ borderColor: '#00F0FF' }}></div>

          <div className="modal-hdr">
            <span className="step-lbl" style={{ color: '#00F0FF' }}>{meta[currentStep].s}</span>
            <span className="step-nm">{meta[currentStep].n}</span>
          </div>

          <div className="prog-row">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`pd ${i <= currentStep ? 'on' : ''}`}
                style={{ backgroundColor: i <= currentStep ? '#00F0FF' : 'rgba(255,255,255,0.1)' }}
              ></div>
            ))}
          </div>

          {/* STEP 1: Plan de déploiement */}
          <div className={`step-content ${currentStep === 1 ? 'active' : ''}`}>
            <div className="step-eyebrow text-white text-[14px] font-bold">Processus d'activation — 15 à 20 jours</div>
            <div className="step-lead text-white text-[13px] opacity-90 mb-6">Voici comment nous allons déployer et personnaliser votre Business</div>
            <div style={{ position: 'relative', paddingTop: '2px' }}>
              <div 
                style={{ 
                  position: 'absolute', left: 0, right: 0, height: '1px', 
                  background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.45), transparent)', 
                  top: currentStep === 1 ? '100%' : '-2px', 
                  transition: 'top 2.4s linear', zIndex: 2 
                }}
              ></div>

              {[
                { 
                  day: "Jours 01–04", 
                  title: "Audit Stratégique et Injection IA", 
                  desc: "Analyse profonde de votre écosystème et premier entraînement de vos agents IA",
                  hiddenDesc: "Nos ingénieurs procèdent à un audit chirurgical de vos processus métier. Nous injectons vos données (textes, tarifs, documents) pour entraîner vos deux agents IA propriétaires afin qu'ils parlent avec la voix de votre entreprise."
                },
                { 
                  day: "Jours 05–10", 
                  title: "Ingénierie des Flux et Automatisation", 
                  desc: "Configuration des tunnels de vente et activation des workflows marketing",
                  hiddenDesc: "Mise en place des automatisations réseaux sociaux et génération des premiers contenus vidéos. Nous construisons les ponts entre votre base de données et vos canaux de conversion pour un business qui tourne 24/7."
                },
                { 
                  day: "Jours 11–16", 
                  title: "Infrastructure de Pilotage", 
                  desc: "Déploiement de votre centre de contrôle avec intégration WhatsApp Business",
                  hiddenDesc: "Activation de votre Dashboard intelligent. Nous configurons les accès API et l'intégration WhatsApp/SMS pour que vous puissiez piloter vos agents et vos ventes depuis une interface unique et ultra-fluide."
                },
                { 
                  day: "Jours 17–20", 
                  title: "Optimisation et Livraison Finale", 
                  desc: "Tests de charge, formation de votre équipe et mise en ligne officielle",
                  hiddenDesc: "Phase de rodage intensif. Nous testons la résistance de votre moteur de flux sous forte audience. Une session de formation personnalisée est incluse pour garantir que vous exploitez 100% de la puissance d'Autoslash AI."
                }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className={`rm-row ${currentStep === 1 ? 'vis' : ''}`}
                  style={{ transitionDelay: `${idx * 0.3}s` }}
                >
                  <div className="rm-dot-col">
                    <div className="rm-dot" style={{ backgroundColor: '#00F0FF', boxShadow: '0 0 10px #00F0FF' }}></div>
                    {idx < 3 && <div className="rm-line" style={{ background: 'linear-gradient(to bottom, #00F0FF, rgba(0,240,255,0.1))' }}></div>}
                  </div>
                  <div className="flex-1">
                    <div className="rm-day text-[#00F0FF] text-[11px] font-bold uppercase tracking-widest">{item.day}</div>
                    <div className="rm-title text-white text-[16px] font-bold mb-1">{item.title}</div>
                    <div 
                      className="rm-desc text-white opacity-80 text-[13px] mt-1 flex items-center gap-2 cursor-pointer group" 
                      onClick={() => toggleStep(idx)}
                    >
                      <span>{item.desc}</span>
                      <div className={`text-[#00F0FF] blink-dot transition-transform duration-300 ${expandedSteps.includes(idx) ? 'rotate-180' : ''}`}>
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
                            <p className="mt-3 text-[12px] leading-relaxed text-white/50 border-l border-[#00F0FF]/30 pl-3 italic">
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
              <button className="ai-btn flex-1" style={{ backgroundColor: '#00F0FF' }} onClick={() => goStep(2)}>Confirmer →</button>
            </div>
          </div>

          {/* STEP 2: Conditions d'engagement */}
          <div className={`step-content ${currentStep === 2 ? 'active' : ''}`}>
            <div className="step-eyebrow text-white text-[14px] font-bold">Conditions d'engagement Business</div>
            <div className="step-lead text-white text-[13px] opacity-90 mb-6">Paiement sécurisé en 2 temps. Accès immédiat aux ressources IA.</div>
            <div className="p-row py-4" style={{ borderColor: 'rgba(0, 240, 255, 0.1)' }}>
              <div>
                <div className="p-lbl text-white text-[11px] font-bold opacity-70">Investissement total</div>
                <div style={{ color: 'white', fontSize: '18px', letterSpacing: '0.1em', marginTop: '3px', fontWeight: 'bold' }}>{fmt(price)}</div>
              </div>
            </div>
            <div className="p-row py-4" style={{ borderColor: 'rgba(0, 240, 255, 0.1)' }}>
              <div>
                <div className="p-lbl text-white text-[11px] font-bold opacity-70">Acompte initial (50%)</div>
                <div className="p-val text-white text-[24px] font-bold">{fmt(price / 2)}</div>
              </div>
              <div className="p-tag text-[#00F0FF] opacity-60">Lance l'ingénierie IA</div>
            </div>
            <div className="p-row py-4" style={{ borderBottom: 'none' }}>
              <div>
                <div className="p-lbl text-white text-[11px] font-bold opacity-70">Solde à la livraison (50%)</div>
                <div className="p-val text-white/60 text-[24px] font-bold">{fmt(price / 2)}</div>
              </div>
              <div className="p-tag text-white opacity-60">Après validation</div>
            </div>
            <div className="gold-badge mt-6 p-4 text-[11px] border-[#00F0FF]/40 bg-[#00F0FF]/10 text-[#00F0FF]">
              ★ &nbsp;Garantie Business — Inclus 2 agents IA opérationnels et leur maintenance pendant le premier mois. Maintenance et Hébergement : 50 000 FCFA/mois.
            </div>
            <div className="flex gap-4 mt-8">
              <button className="ai-btn-sec flex-1" onClick={() => goStep(1)}>← Précédent</button>
              <button className="ai-btn flex-1" style={{ backgroundColor: '#00F0FF' }} onClick={() => goStep(3)}>Confirmer →</button>
            </div>
          </div>

          {/* STEP 3: Injection d'identité */}
          <div className={`step-content ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-eyebrow text-white text-[14px] font-bold">Votre place est réservée</div>
            <div className="step-lead text-white text-[13px] opacity-90 mb-6">Nos agents IA ont besoin de contexte pour être entraînés efficacement sur votre métier.</div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">Nom du Projet / Entreprise</div>
              <input 
                className="ai-input text-white text-[14px] py-3 focus:border-[#00F0FF]" 
                type="text" 
                name="company"
                placeholder="Ex : Global Tech Solutions" 
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">Secteur / Metier</div>
              <input 
                className="ai-input text-white text-[14px] py-3 focus:border-[#00F0FF]" 
                type="text" 
                name="sector"
                placeholder="Ex : Support WhatsApp 24/7, Leads Facebook..." 
                value={formData.sector}
                onChange={handleInputChange}
              />
            </div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">Région / Pays</div>
              <input 
                className="ai-input text-white text-[14px] py-3 focus:border-[#00F0FF]" 
                type="text" 
                name="region"
                placeholder="Dakar, Sénégal" 
                value={formData.region}
                onChange={handleInputChange}
              />
            </div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">Documentation et Logo</div>
              <div 
                className={`dropzone py-6 ${isLogoUploaded ? 'done' : ''}`}
                style={{ borderColor: isLogoUploaded ? '#00F0FF' : 'rgba(255,255,255,0.1)' }}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('hover'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('hover'); }}
                onDrop={handleDrop}
              >
                {isLogoUploaded ? (
                  <>
                    <span className="text-[#00F0FF] text-[14px] font-bold">✓ Données sécurisées</span><br />
                    <span style={{ opacity: 0.9, fontSize: '11px', letterSpacing: '0.1em', color: 'white' }}>injection en cours...</span>
                  </>
                ) : (
                  <>
                    <span className="text-white text-[14px] font-bold">↑ Déposer votre documentation</span><br />
                    <span style={{ opacity: 0.8, fontSize: '11px', letterSpacing: '0.1em', color: 'white' }}>DOCX · PDF · PNG acceptés</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button className="ai-btn-sec flex-1" onClick={() => goStep(2)}>← Précédent</button>
              <button className="ai-btn flex-1" style={{ backgroundColor: '#00F0FF' }} onClick={() => goStep(4)}>Activer Business →</button>
            </div>
          </div>

          {/* STEP 4: Contact */}
          <div className={`step-content ${currentStep === 4 ? 'active' : ''}`}>
            <main className="py-2">
                <div className="max-w-lg mx-auto space-y-3 text-center">
                    <h3 className="text-[#00F0FF] font-semibold text-[14px] uppercase tracking-widest">
                        Contact Business
                    </h3>
                    <p className="text-white text-2xl font-bold sm:text-3xl">
                        Parlon stratégie
                    </p>
                    <p className="text-white opacity-80 text-[13px]">
                        Laissez-nous vos coordonnées pour lancer l'audit de vos besoins.
                    </p>
                </div>
                <div className="mt-8 max-w-lg mx-auto">
                    <form
                        onSubmit={handleFormSubmit}
                        className="space-y-5"
                    >
                        <div className="flex flex-col items-center gap-y-5 gap-x-6 [&>*]:w-full sm:flex-row">
                            <div>
                                <label className="flbl text-white text-[11px] font-bold">
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    className="ai-input text-white text-[14px] focus:border-[#00F0FF]"
                                    placeholder="Jean"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="flbl text-white text-[11px] font-bold">
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    className="ai-input text-white text-[14px] focus:border-[#00F0FF]"
                                    placeholder="Dupont"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="flbl text-white text-[11px] font-bold">
                                Email Professionnel
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="ai-input text-white text-[14px] focus:border-[#00F0FF]"
                                placeholder="contact@entreprise.com"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="flbl text-white text-[11px] font-bold">
                                téléphone (WhatsApp)
                            </label>
                            <div className="relative mt-2">
                                <div className="absolute inset-y-0 left-3 my-auto h-6 flex items-center border-r border-white/10 pr-2">
                                    <select className="text-sm bg-transparent outline-none rounded-lg h-full text-white cursor-pointer">
                                        <option className='bg-[#050a1a]'>SN</option>
                                        <option className='bg-[#050a1a]'>US</option>
                                        <option className='bg-[#050a1a]'>MR</option>
                                    </select>
                                </div>
                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="+221 ..."
                                    required
                                    className="ai-input text-white text-[14px] pl-[4.5rem] focus:border-[#00F0FF]"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="flbl text-white text-[11px] font-bold">
                                Message / Besoins Spécifiques
                            </label>
                            <textarea 
                              name="message"
                              required 
                              className="ai-input text-white text-[14px] h-32 resize-none focus:border-[#00F0FF]" 
                              placeholder="Détaillez vos besoins IA..."
                              value={formData.message}
                              onChange={handleInputChange}
                            ></textarea>
                        </div>
                        {errorMsg && <div className="text-red-500 text-[11px] font-bold">{errorMsg}</div>}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="ai-btn w-full"
                            style={{ backgroundColor: '#00F0FF' }}
                        >
                            {isSubmitting ? 'Audit en cours...' : "Lancer l'audit"}
                        </button>
                    </form>
                </div>
            </main>
            <div className="flex gap-4 mt-8">
              <button className="ai-btn-sec flex-1" onClick={() => goStep(3)}>← Précédent</button>
            </div>
          </div>

          {/* STEP 5: Mission Activated */}
          <div className={`step-content ${currentStep === 5 ? 'active' : ''}`} style={{ textAlign: 'center' }}>
            <div className="status-ring" style={{ borderColor: '#00F0FF' }}>
              <span style={{ color: '#00F0FF', fontSize: '32px', lineHeight: 1 }}>✓</span>
            </div>
            <div style={{ color: 'white', fontSize: '18px', letterSpacing: '0.26em', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>Mission Business activée</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', letterSpacing: '0.04em', marginBottom: '32px' }}>
              Nos ingénieurs IA analysent votre demande.
            </div>
            <div 
              style={{ padding: '20px', background: 'rgba(5, 10, 28, 0.72)', border: '1px solid rgba(0, 240, 255, 0.14)', borderRadius: '4px', textAlign: 'left', marginBottom: '24px' }}
            >
              <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', letterSpacing: '0.34em', marginBottom: '12px', textTransform: 'uppercase' }}>Statut Infrastructure</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span className="blink-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00F0FF', boxShadow: '0 0 10px #00F0FF' }}></span>
                <span style={{ color: '#00F0FF', fontSize: '13px', letterSpacing: '0.08em', fontWeight: 'bold' }}>Audit stratégique sous 24h</span>
              </div>
              <div style={{ background: 'rgba(0, 240, 255, 0.08)', borderRadius: '2px', height: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #00F0FF, #006FFF)', width: '12%', transition: 'width 4s ease' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '10px' }}>Silo Business lancé</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '10px' }}>Livraison J+15-20</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button 
                className="ai-btn"
                style={{ 
                  flex: 1, 
                  padding: '12px 8px', 
                  marginTop: 0, 
                  backgroundColor: 'transparent', 
                  border: '1px solid #00F0FF',
                  color: '#00F0FF',
                  fontSize: '10px',
                  fontWeight: '900',
                  letterSpacing: '0.2em'
                }}
                onClick={() => {
                  onClose();
                  window.location.href = '/business-package';
                }}
              >
                ← RETOUR CATALOGUE
              </button>
              <button 
                className="ai-btn"
                style={{ 
                  flex: 1, 
                  padding: '12px 8px', 
                  marginTop: 0, 
                  backgroundColor: '#00F0FF', 
                  color: '#050a1b',
                  fontSize: '10px',
                  fontWeight: '900',
                  letterSpacing: '0.2em'
                }}
                onClick={() => {
                  onClose();
                  window.location.href = '/enterprise-package';
                }}
              >
                VITESSE SUPÉRIEURE →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .blink-dot { animation: blink-a 1.1s infinite; }
        @keyframes scan-y {
          0% { top: -2px; }
          100% { top: 100vh; }
        }
        @keyframes blink-a {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};
