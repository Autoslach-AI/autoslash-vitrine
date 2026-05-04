import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';

interface OrderTunnelProps {
  isOpen: boolean;
  onClose: () => void;
  price: number;
}

export const OrderTunnel: React.FC<OrderTunnelProps> = ({ isOpen, onClose, price }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLogoUploaded, setIsLogoUploaded] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [isManualPhoneCode, setIsManualPhoneCode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCode: '+221',
    phoneNumber: '',
    company: '',
    sector: '',
    region: 'Dakar',
    message: ''
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('tunnel-body-locked');
      setTimeout(() => setIsVisible(true), 10);
      initParticles();

      // Read context from session storage
      const saved = sessionStorage.getItem('autoslash_selection');
      if (saved) {
        try {
          // context sector automatic input disabled as requested
          /*
          const context = JSON.parse(saved);
          setFormData(prev => ({
            ...prev,
            sector: context.template_sector || ''
          }));
          */
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
      const saved = sessionStorage.getItem('autoslash_selection');
      const templateId = saved ? JSON.parse(saved).template_id || null : null;
      
      console.log('=== DÉBUT SOUMISSION (STARTUP) ===');
      console.log('FormData:', formData);
      console.log('TemplateId:', templateId);
  
      // --- UPLOAD DES ASSETS ---
      const assetUrls: string[] = [];
      if (uploadedFiles.length > 0) {
        console.log(`Uploading ${uploadedFiles.length} files...`);
        for (const file of uploadedFiles) {
          const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('prospect-fichiers')
            .upload(fileName, file);
          
          if (uploadError) {
            console.error('Erreur upload bucket:', uploadError);
          } else if (uploadData) {
            const { data: urlData } = supabase.storage
              .from('prospect-fichiers')
              .getPublicUrl(fileName);
            assetUrls.push(urlData.publicUrl);
          }
        }
      }

      const payload = {
        name: formData.company || `${formData.firstName} ${formData.lastName}`,
        package_type: 'STARTUP',
        sector: formData.sector,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        region: formData.region || 'Dakar',
        template_id: templateId,
        status: 'PROSPECT',
        is_test: false,
        assets_urls: assetUrls
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
  
      setIsSubmitting(false);
      setCurrentStep(5);
  
    } catch (err) {
      console.error('ERREUR INATTENDUE:', err);
      setErrorMsg(`Erreur inattendue: ${err}`);
      setIsSubmitting(false);
    }
  };

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
        ctx.fillStyle = `rgba(0, 170, 255, ${p.a})`;
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
    if (e.dataTransfer.files?.length) {
      setIsLogoUploaded(true);
      setUploadedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: isVisible ? 'auto' : 'none', overflow: 'hidden' }}>
      {/* Background elements from provided HTML */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none' }} />
      <div className="dot-grid" style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, rgba(0, 170, 255, 0.11) 1px, transparent 1px)', backgroundSize: '28px 28px' }}></div>
      <div className="scan-line" style={{ position: 'fixed', left: 0, right: 0, height: '2px', zIndex: -1, pointerEvents: 'none', background: 'linear-gradient(90deg, transparent, rgba(0, 170, 255, 0.16), transparent)', animation: 'scan-y 10s linear infinite' }}></div>

      {/* ProgressBar */}
      <div 
        className="progress-bar-tunnel" 
        style={{ width: `${isVisible ? currentStep * 20 : 0}%` }}
      ></div>

      {/* Overlay */}
      <div 
        id="tunnel-overlay" 
        className={isVisible ? 'active' : ''} 
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      ></div>

      {/* Modal */}
      <div id="tunnel-modal" className={isVisible ? 'open' : ''} style={{ zIndex: 1 }}>
        <div className="modal-inner">
          <div className="cx-tunnel tl"></div>
          <div className="cx-tunnel tr"></div>
          <div className="cx-tunnel bl"></div>
          <div className="cx-tunnel br"></div>

          <div className="modal-hdr">
            <span className="step-lbl">{meta[currentStep].s}</span>
            <span className="step-nm">{meta[currentStep].n}</span>
          </div>

          <div className="prog-row">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`pd ${i <= currentStep ? 'on' : ''}`}
              ></div>
            ))}
          </div>

          {/* STEP 1: Plan de déploiement */}
          <div className={`step-content ${currentStep === 1 ? 'active' : ''}`}>
            <div className="step-eyebrow text-white text-[14px] font-bold">Processus d'activation — 10 à 15 jours</div>
            <div className="step-lead text-white text-[13px] opacity-90 mb-6">Voici comment nous allons déployer et personnaliser votre infrastructure.</div>
            <div style={{ position: 'relative', paddingTop: '2px' }}>
              {/* Scan line effect */}
              <div 
                style={{ 
                  position: 'absolute', left: 0, right: 0, height: '1px', 
                  background: 'linear-gradient(90deg, transparent, rgba(0, 170, 255, 0.45), transparent)', 
                  top: currentStep === 1 ? '100%' : '-2px', 
                  transition: 'top 2.4s linear', zIndex: 2 
                }}
              ></div>

              {[
                { day: "Jours 01–03", title: "Collecte et Injection", desc: "Récupération de vos Donnés. Nos experts les intègrent chirurgicalement dans le template choisi en foction de vos demande." },
                { day: "Jours 04–08", title: "Finitions et Touches Autoslash", desc: "Animations, formulaires connectés à Supabase, expérience utilisateur taillée pour votre métier." },
                { day: "Jours 09–12", title: "Configuration du Dashboard", desc: "Votre espace de contrôle : gérez réservations, clients ou produits aussi simplement qu'un tableur." },
                { day: "Jours 13–15", title: "Livraison et Garantie", desc: "Mise en ligne officielle. Vous validez. Le projet n'est terminé que lorsque vous êtes 100% satisfait." }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className={`rm-row ${currentStep === 1 ? 'vis' : ''}`}
                  style={{ transitionDelay: `${idx * 0.3}s` }}
                >
                  <div className="rm-dot-col">
                    <div className="rm-dot"></div>
                    {idx < 3 && <div className="rm-line"></div>}
                  </div>
                  <div>
                    <div className="rm-day text-white text-[11px] font-bold">{item.day}</div>
                    <div className="rm-title text-white text-[16px] font-bold">{item.title}</div>
                    <div className="rm-desc text-white opacity-80 text-[13px] mt-1">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-row flex-nowrap items-center justify-center mt-8 gap-4">
              <button className="ai-btn whitespace-nowrap" onClick={() => goStep(2)}>Confirmer →</button>
            </div>
          </div>

          {/* STEP 2: Conditions d'engagement (swapped) */}
          <div className={`step-content ${currentStep === 2 ? 'active' : ''}`}>
            <div className="step-eyebrow text-white text-[14px] font-bold">Conditions d'engagement Startup</div>
            <div className="step-lead text-white text-[13px] opacity-90 mb-6">Paiement sécurisé en 2 temps. Zéro risque financier pour vous.</div>
            <div className="p-row py-4">
              <div>
                <div className="p-lbl text-white text-[11px] font-bold opacity-70">Investissement total</div>
                <div style={{ color: 'white', fontSize: '18px', letterSpacing: '0.1em', marginTop: '3px', fontWeight: 'bold' }}>{fmt(price)}</div>
              </div>
            </div>
            <div className="p-row py-4">
              <div>
                <div className="p-lbl text-white text-[11px] font-bold opacity-70">Acompte initial (50%)</div>
                <div className="p-val text-white text-[24px] font-bold">{fmt(price / 2)}</div>
              </div>
              <div className="p-tag text-white opacity-60">Lance l'ingénierie</div>
            </div>
            <div className="p-row py-4" style={{ borderBottom: 'none' }}>
              <div>
                <div className="p-lbl text-white text-[11px] font-bold opacity-70">Solde à la livraison (50%)</div>
                <div className="p-val text-white/60 text-[24px] font-bold">{fmt(price / 2)}</div>
              </div>
              <div className="p-tag text-white opacity-60">Après validation</div>
            </div>
            <div className="gold-badge mt-6 p-4 text-[11px] border-yellow-500/40 bg-yellow-500/10 text-yellow-400">
              ★ &nbsp;Garantie de résultat — Maintenance et Hébergement : 25 000 FCFA/mois. Si le livrable ne vous satisfait pas, un remboursement total ou partiel est garanti par contrat.
            </div>
            <div className="flex flex-row flex-nowrap items-center justify-center mt-8 gap-4">
              <button className="ai-btn-sec whitespace-nowrap" onClick={() => goStep(1)}>← Précédent</button>
              <button className="ai-btn whitespace-nowrap" onClick={() => goStep(3)}>Confirmer →</button>
            </div>
          </div>

          {/* STEP 3: Injection d'identité (swapped) */}
          <div className={`step-content ${currentStep === 3 ? 'active' : ''}`}>
            <div className="step-eyebrow text-white text-[14px] font-bold">Votre place est réservée</div>
            <div className="step-lead text-white text-[13px] opacity-90 mb-6">Dites-nous qui vous êtes. Nos ingénieurs adapteront chaque détail à votre univers métier.</div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">Nom de votre Entreprise / Organisation</div>
              <input 
                className="ai-input text-white text-[14px] py-3 placeholder:opacity-30" 
                type="text" 
                name="company"
                autoComplete="off"
                placeholder="Ex : Restaurant Le Gourmet" 
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">Secteur / Métier</div>
              <input 
                className="ai-input text-white text-[14px] py-3 placeholder:opacity-30" 
                type="text" 
                name="sector"
                autoComplete="off"
                placeholder="Quel est votre secteur / métier ?" 
                value={formData.sector}
                onChange={handleInputChange}
              />
            </div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">Région / Pays</div>
              <input 
                className="ai-input text-white text-[14px] py-3 placeholder:opacity-30" 
                type="text" 
                name="region"
                placeholder="Dakar, Sénégal" 
                value={formData.region}
                onChange={handleInputChange}
              />
            </div>
            <div className="frow">
              <div className="flbl text-white text-[11px] font-bold">
                Documents & Fichiers (optionnel)
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".png,.jpg,.jpeg,.svg,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) {
                    setIsLogoUploaded(true);
                    setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
              />
              <div 
                className={`dropzone py-6 ${isLogoUploaded ? 'done' : ''}`}
                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('hover'); }}
                onDragLeave={(e) => { e.currentTarget.classList.remove('hover'); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {isLogoUploaded ? (
                  <>
                    <span className="text-white text-[14px] font-bold">
                      ✓ {uploadedFiles.length} fichier(s) prêt(s)
                    </span><br />
                    <span style={{ fontSize: '11px', color: 'white', opacity: 0.7 }} className="mt-1 px-4 text-center">
                      {uploadedFiles.map(f => f.name).join(', ')}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-white text-[14px] font-bold">↑ Déposer vos fichiers ici</span><br />
                    <span style={{ opacity: 0.8, fontSize: '11px', color: 'white' }}>
                      PNG · JPG · SVG · PDF · DOC · DOCX · XLS · ZIP acceptés
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-row flex-nowrap items-center justify-center mt-8 gap-4">
              <button className="ai-btn-sec whitespace-nowrap" onClick={() => goStep(2)}>← Précédent</button>
              <button className="ai-btn whitespace-nowrap" onClick={() => goStep(4)}>Commander</button>
            </div>
          </div>

          {/* STEP 4: Mission activée / Contact */}
          <div className={`step-content ${currentStep === 4 ? 'active' : ''}`}>
            <main className="py-2">
                <div className="max-w-lg mx-auto space-y-3 text-center">
                    <h3 className="text-[#00AAFF] font-semibold text-[14px] uppercase tracking-widest">
                        Contact Startup
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
                                    className="ai-input text-white text-[14px]"
                                    placeholder="John"
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
                                    className="ai-input text-white text-[14px]"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="flbl text-white text-[11px] font-bold">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                className="ai-input text-white text-[14px]"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label className="flbl text-white text-[11px] font-bold">
                                NUMÉRO DE TÉLÉPHONE
                            </label>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                {isManualPhoneCode ? (
                                    <input
                                        type="text"
                                        style={{ 
                                            width: '110px', 
                                            flexShrink: 0,
                                            background: 'rgba(0,10,30,0.8)',
                                            border: '1px solid rgba(0,170,255,0.4)',
                                            color: 'white',
                                            padding: '12px 8px',
                                            borderRadius: '4px',
                                            fontSize: '13px'
                                        }}
                                        value={formData.phoneCode || ''}
                                        onDoubleClick={() => setIsManualPhoneCode(false)}
                                        onChange={(e) => {
                                            const newCode = e.target.value;
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                phoneCode: newCode,
                                                phone: newCode + ' ' + prev.phoneNumber
                                            }))
                                        }}
                                    />
                                ) : (
                                    <select
                                        style={{ 
                                            width: '110px', 
                                            flexShrink: 0,
                                            background: 'rgba(0,10,30,0.8)',
                                            border: '1px solid rgba(0,170,255,0.2)',
                                            color: 'white',
                                            padding: '12px 8px',
                                            borderRadius: '4px',
                                            fontSize: '13px'
                                        }}
                                        value={formData.phoneCode || '+221'}
                                        onDoubleClick={() => setIsManualPhoneCode(true)}
                                        onChange={(e) => {
                                            const newCode = e.target.value;
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                phoneCode: newCode,
                                                phone: newCode + ' ' + prev.phoneNumber
                                            }))
                                        }}
                                    >
                                        <option value="+221">🇸🇳 SN +221</option>
                                        <option value="+223">🇲🇱 ML +223</option>
                                        <option value="+224">🇬🇳 GN +224</option>
                                        <option value="+225">🇨🇮 CI +225</option>
                                        <option value="+226">🇧🇫 BF +226</option>
                                        <option value="+227">🇳🇪 NE +227</option>
                                        <option value="+228">🇹🇬 TG +228</option>
                                        <option value="+229">🇧🇯 BJ +229</option>
                                        <option value="+230">🇲🇺 MU +230</option>
                                        <option value="+233">🇬🇭 GH +233</option>
                                        <option value="+234">🇳🇬 NG +234</option>
                                        <option value="+237">🇨🇲 CM +237</option>
                                        <option value="+212">🇲🇦 MA +212</option>
                                        <option value="+213">🇩🇿 DZ +213</option>
                                        <option value="+216">🇹🇳 TN +216</option>
                                        <option value="+20">🇪🇬 EG +20</option>
                                        <option value="+243">🇨🇩 CD +243</option>
                                        <option value="+33">🇫🇷 FR +33</option>
                                        <option value="+32">🇧🇪 BE +32</option>
                                        <option value="+41">🇨🇭 CH +41</option>
                                        <option value="+1">🇺🇸 US +1</option>
                                        <option value="+44">🇬🇧 GB +44</option>
                                        <option value="+49">🇩🇪 DE +49</option>
                                        <option value="+34">🇪🇸 ES +34</option>
                                        <option value="+39">🇮🇹 IT +39</option>
                                        <option value="+351">🇵🇹 PT +351</option>
                                        <option value="+7">🇷🇺 RU +7</option>
                                        <option value="+86">🇨🇳 CN +86</option>
                                        <option value="+91">🇮🇳 IN +91</option>
                                        <option value="+55">🇧🇷 BR +55</option>
                                        <option value="+52">🇲🇽 MX +52</option>
                                        <option value="+971">🇦🇪 AE +971</option>
                                        <option value="+966">🇸🇦 SA +966</option>
                                        <option value="+974">🇶🇦 QA +974</option>
                                        <option value="+965">🇰🇼 KW +965</option>
                                        <option value="+254">🇰🇪 KE +254</option>
                                        <option value="+255">🇹🇿 TZ +255</option>
                                        <option value="+256">🇺🇬 UG +256</option>
                                        <option value="+27">🇿🇦 ZA +27</option>
                                        <option value="+57">🇨🇴 CO +57</option>
                                        <option value="+54">🇦🇷 AR +54</option>
                                        <option value="+56">🇨🇱 CL +56</option>
                                        <option value="+81">🇯🇵 JP +81</option>
                                        <option value="+82">🇰🇷 KR +82</option>
                                        <option value="+61">🇦🇺 AU +61</option>
                                        <option value="+64">🇳🇿 NZ +64</option>
                                        <option value="+31">🇳🇱 NL +31</option>
                                        <option value="+46">🇸🇪 SE +46</option>
                                        <option value="+47">🇳🇴 NO +47</option>
                                        <option value="+45">🇩🇰 DK +45</option>
                                        <option value="+48">🇵🇱 PL +48</option>
                                        <option value="+90">🇹🇷 TR +90</option>
                                        <option value="+92">🇵🇰 PK +92</option>
                                        <option value="+880">🇧🇩 BD +880</option>
                                        <option value="+60">🇲🇾 MY +60</option>
                                        <option value="+62">🇮🇩 ID +62</option>
                                        <option value="+63">🇵🇭 PH +63</option>
                                        <option value="+66">🇹🇭 TH +66</option>
                                        <option value="+84">🇻🇳 VN +84</option>
                                    </select>
                                )}
                                <input
                                    type="text"
                                    placeholder="77 000 00 00"
                                    required
                                    style={{ flex: 1 }}
                                    className="ai-input text-white text-[14px]"
                                    value={formData.phoneNumber || ''}
                                    onChange={(e) => {
                                        const newNum = e.target.value.replace(formData.phoneCode, '').replace('+', '').trim();
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            phoneNumber: newNum,
                                            phone: prev.phoneCode + ' ' + newNum
                                        }))
                                    }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="flbl text-white text-[11px] font-bold">
                                Message
                            </label>
                            <textarea 
                              name="message"
                              required 
                              className="ai-input text-white text-[14px] h-32 resize-none" 
                              placeholder="Votre message..."
                              value={formData.message}
                              onChange={handleInputChange}
                            ></textarea>
                        </div>
                        {errorMsg && <div className="text-red-500 text-[11px] font-bold">{errorMsg}</div>}
                        <div className="flex flex-row flex-nowrap items-center justify-center gap-4 mt-8">
                            <button type="button" className="ai-btn-sec whitespace-nowrap" onClick={() => goStep(3)}>← Précédent</button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="ai-btn whitespace-nowrap"
                            >
                                {isSubmitting ? 'Activation...' : 'Commander'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
          </div>

          {/* STEP 5: Mission Activated */}
          <div className={`step-content ${currentStep === 5 ? 'active' : ''}`} style={{ textAlign: 'center' }}>
            <div className="status-ring">
              <span style={{ color: '#00AAFF', fontSize: '32px', lineHeight: 1 }}>✓</span>
            </div>
            <div style={{ color: 'white', fontSize: '18px', letterSpacing: '0.26em', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase' }}>Votre demande est envoyée</div>
            <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '13px', letterSpacing: '0.04em', marginBottom: '32px' }}>
              Merci de votre confiance, notre équipe vous contactera sous 24H pour un audit personnalisé à vos besoins.
            </div>
            <div 
              style={{ padding: '20px', background: 'rgba(5, 10, 28, 0.72)', border: '1px solid rgba(0, 170, 255, 0.14)', borderRadius: '4px', textAlign: 'left', marginBottom: '24px' }}
            >
              <div style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '10px', letterSpacing: '0.34em', marginBottom: '12px', textTransform: 'uppercase' }}>Statut de la mission</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span className="blink-dot" style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00AAFF', boxShadow: '0 0 10px #00AAFF' }}></span>
                <span style={{ color: '#00AAFF', fontSize: '13px', letterSpacing: '0.08em', fontWeight: 'bold' }}>Prise de contact sous 24h</span>
              </div>
              <div style={{ background: 'rgba(0, 170, 255, 0.08)', borderRadius: '2px', height: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #00AAFF, #006FFF)', width: '12%', transition: 'width 4s ease' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '10px' }}>Mission lancée</span>
                <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: '10px' }}>Livraison J+15</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'center', flexWrap: 'nowrap' }}>
              <button 
                className="ai-btn"
                style={{ 
                  padding: '8px 16px', 
                  marginTop: 0, 
                  backgroundColor: 'transparent', 
                  border: '1px solid #00AAFF',
                  color: '#00AAFF',
                  fontSize: '10px',
                  fontWeight: '900',
                  letterSpacing: '0.2em',
                  minWidth: '150px',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => {
                  onClose();
                  window.location.href = '/startup-package';
                }}
              >
                ← RETOUR CATALOGUE
              </button>
              <button 
                className="ai-btn"
                style={{ 
                  padding: '8px 16px', 
                  marginTop: 0, 
                  backgroundColor: '#00AAFF', 
                  color: '#050a1b',
                  fontSize: '10px',
                  fontWeight: '900',
                  letterSpacing: '0.2em',
                  minWidth: '150px',
                  whiteSpace: 'nowrap'
                }}
                onClick={() => {
                  onClose();
                  window.location.href = '/business-package';
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
