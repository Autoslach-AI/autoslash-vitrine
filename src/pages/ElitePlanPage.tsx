import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { supabase } from "../lib/supabaseClient";

// Register GSAP plugins
gsap.registerPlugin(Draggable);

const ElitePlanPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    societe: "",
    fonction: "",
    secteur: "",
    region: "Dakar",
    email: "",
    telephone: "",
    message: "",
    appointmentDate: new Date(),
    appointmentTime: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // Read context if any
    const saved = sessionStorage.getItem('autoslash_selection');
    if (saved) {
      try {
        const context = JSON.parse(saved);
        if (context.template_name) {
          setFormData(prev => ({
            ...prev,
            societe: context.template_name,
            message: `Template choisi : ${context.template_name} (${context.template_sector})`
          }));
        }
      } catch (e) {
        console.error('Context parse error', e);
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (value: any) => {
    setFormData((prev) => ({ ...prev, appointmentDate: value }));
  };

  const nextStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from('enterprises')
      .insert({
        name: formData.societe || `${formData.nom} ${formData.prenom}`,
        package_type: 'ELITE',
        sector: formData.secteur || 'Général Elite',
        email: formData.email,
        phone: formData.telephone,
        message: `${formData.message}\nRendez-vous : ${format(formData.appointmentDate, "dd/MM/yyyy")} à ${formData.appointmentTime}`,
        region: formData.region || 'Dakar',
        status: 'PROSPECT',
        is_test: false
      })
      .select()
      .single();
    
    setIsSubmitting(false);
    if (!error) {
      setIsSuccess(true);
      setCurrentStep(3);
    } else {
      console.error('Supabase error:', error);
      setErrorMsg("Une erreur est survenue lors de l'envoi. Veuillez vérifier votre connexion.");
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    function generateTableOfContents() {
      const tocElement = containerRef.current?.querySelector('.table-of-contents')
      if (!tocElement) return

      const article = containerRef.current?.querySelector('article')
      if (!article) return

      // Find all headings within the article (h2 and below only)
      const headings = Array.from(article.querySelectorAll('h2, h3, h4, h5, h6'))
      if (headings.length === 0) return

      // Build hierarchical structure
      const buildTOC = (items: Element[], startIndex = 0, currentLevel = 1) => {
        const list = document.createElement('ol')
        let index = startIndex
        
        while (index < items.length) {
          const item = items[index]
          const level = parseInt(item.tagName.charAt(1))
          
          if (level < currentLevel) {
            break
          }
          
          if (level === currentLevel) {
            const listItem = document.createElement('li')
            const link = document.createElement('a')
            
            const id = item.id || item.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || `heading-${index}`
            if (!item.id) {
              item.id = id
            }
            
            link.href = `#${id}`
            link.textContent = item.textContent?.trim() || ''
            
            listItem.appendChild(link)
            index++
            
            // Check if there are nested items
            if (index < items.length) {
              const nextLevel = parseInt(items[index].tagName.charAt(1))
              if (nextLevel > currentLevel) {
                const result = buildTOC(items, index, currentLevel + 1)
                listItem.appendChild(result.list)
                index = result.nextIndex
              }
            }
            
            list.appendChild(listItem)
          } else {
            break
          }
        }
        
        return { list, nextIndex: index }
      }

      // Create nav element with proper accessibility
      const nav = document.createElement('nav')
      nav.setAttribute('aria-label', 'Table of Contents')
      
      const heading = document.createElement('h2')
      heading.textContent = 'Contents'
      nav.appendChild(heading)
      
      const result = buildTOC(headings as any, 0, 2)
      nav.appendChild(result.list)
      const split = document.createElement('hr')
      split.classList.add('split')
      nav.appendChild(split)
      const backToTop = document.createElement('div')
      backToTop.classList.add('back-to-top')
      backToTop.innerHTML = `
      <a aria-label="Back to Top" href="#pre">
      top <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 24px; height: 24px; display: inline-block;">
        <path stroke-linecap="round" stroke-linejoin="round" d="m11.99 7.5 3.75-3.75m0 0 3.75 3.75m-3.75-3.75v16.499H4.49" />
      </svg>
      </a>
      `

      nav.appendChild(backToTop)
      tocElement.innerHTML = '';
      tocElement.appendChild(nav)
    }

    generateTableOfContents()
  }, []);

  return (
    <div className="elite-plan-page bg-[#050505] min-h-screen text-white" ref={containerRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;500;600;700&display=swap');

        .elite-plan-page {
          --font-size-min: 16;
          --font-size-max: 20;
          --font-ratio-min: 1.2;
          --font-ratio-max: 1.33;
          --font-width-min: 375;
          --font-width-max: 1500;
          --accent-gold: #FFD700;
          font-family: 'Inter', sans-serif;
          color: hsl(0 0% 98%);
          letter-spacing: -0.01em;
          scroll-behavior: smooth;
        }

        .elite-plan-page h1, .elite-plan-page h2.fluid {
          font-family: 'Playfair Display', serif;
          color: var(--accent-gold);
        }

        .elite-plan-page .container {
          display: grid;
          max-width: 1400px;
          padding-inline: 1rem;
          margin: 0 auto;
          grid-template-columns: 1fr auto 1fr;
          gap: 2rem;
        }

        .elite-plan-page .fluid {
          --fluid-min: calc(var(--font-size-min) * pow(var(--font-ratio-min), var(--font-level, 0)));
          --fluid-max: calc(var(--font-size-max) * pow(var(--font-ratio-max), var(--font-level, 0)));
          --fluid-preferred: calc((var(--fluid-max) - var(--fluid-min)) / (var(--font-width-max) - var(--font-width-min)));
          --fluid-type: clamp(
            (var(--fluid-min) / 16) * 1rem,
            ((var(--fluid-min) / 16) * 1rem) - (((var(--fluid-preferred) * var(--font-width-min)) / 16) * 1rem) + (var(--fluid-preferred) * 100vi),
            (var(--fluid-max) / 16) * 1rem
          );
          font-size: var(--fluid-type);
        }

        .elite-plan-page header {
          min-height: 70vh;
          display: grid;
          align-content: end;
          padding-block: 4rem;
          grid-column: 2;
          width: 60ch;
          max-width: 100%;
        }

        .elite-plan-page h1 {
          --font-level: 4.5;
          line-height: 1.05;
          margin: 0;
          margin-bottom: 2rem;
          text-wrap: balance;
          font-weight: 900;
        }

        .elite-plan-page main {
          grid-column: 2;
          width: 60ch;
          max-width: 100%;
        }

        .elite-plan-page section {
          margin-bottom: 8rem;
        }

        .elite-plan-page article p {
          line-height: 1.8;
          margin: 0;
          margin-bottom: 1.5rem;
          font-size: 1.15rem;
          font-weight: 300;
          opacity: 0.9;
        }

        .elite-plan-page .table-of-contents {
          grid-column: 3;
          position: sticky;
          top: 4rem;
          align-self: start;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .elite-plan-page .table-of-contents nav ol {
          list-style: none;
          padding-left: 1rem;
          margin: 0;
          border-left: 1px solid rgba(255, 215, 0, 0.2);
        }

        .elite-plan-page .table-of-contents a {
          text-decoration: none;
          display: block;
          padding-block: 0.5rem;
          transition: all 0.3s cubic-bezier(0.215, 0.61, 0.355, 1);
          color: rgba(255, 255, 255, 0.4);
        }

        .elite-plan-page .table-of-contents a:hover {
          color: var(--accent-gold);
          padding-left: 0.5rem;
        }

        .elite-plan-page .table-of-contents h2 {
          font-size: 0.7rem;
          margin-bottom: 1rem;
          color: var(--accent-gold);
          opacity: 0.6;
        }

        .elite-plan-page footer {
          grid-column: 2;
          width: 100%;
          padding-block: 4rem;
          border-top: 1px solid rgba(255, 215, 0, 0.1);
        }

        /* Conversion Tunnel Styles */
        .conversion-tunnel {
          grid-column: 2;
          width: 60ch;
          max-width: 100%;
          margin-top: 10vh;
        }

        .tunnel-step {
          min-height: 90vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          transition: opacity 0.8s;
        }

        .tunnel-card {
          background: #0a0a0a;
          padding: 4rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(255, 215, 0, 0.1);
          box-shadow: 0 40px 100px rgba(0,0,0,0.8);
          position: relative;
          overflow: hidden;
        }

        .tunnel-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent-gold), transparent);
        }

        .input-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 768px) {
          .input-group {
            grid-template-columns: 1fr;
          }
        }

        .elite-input {
          width: 100%;
          padding: 1.25rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: white;
          outline: none;
          transition: all 0.3s;
          font-size: 0.95rem;
        }

        .elite-input:focus {
          border-color: var(--accent-gold);
          background: rgba(255, 215, 0, 0.05);
          box-shadow: 0 0 20px rgba(255, 215, 0, 0.05);
        }

        .elite-button {
          background: var(--accent-gold);
          color: black;
          padding: 1.25rem 2.5rem;
          border-radius: 0.5rem;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          justify-content: center;
          width: 100%;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .elite-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.3);
          filter: brightness(1.1);
        }

        .calendar-container {
          display: flex;
          flex-direction: column;
          gap: 3rem;
          align-items: center;
        }

        /* React Calendar Dark Theme Override */
        .react-calendar {
          width: 100% !important;
          max-width: 400px;
          border: none !important;
          background: #0a0a0a !important;
          font-family: inherit !important;
          color: white !important;
        }

        .react-calendar__navigation button {
          color: white !important;
          font-size: 1.2rem !important;
        }

        .react-calendar__navigation button:enabled:hover,
        .react-calendar__navigation button:enabled:focus {
          background-color: rgba(255, 215, 0, 0.1) !important;
        }

        .react-calendar__month-view__weekdays {
          color: var(--accent-gold) !important;
          text-transform: uppercase;
          font-weight: 700;
          font-size: 0.7rem;
          opacity: 0.8;
        }

        .react-calendar__tile {
          color: white !important;
          padding: 1rem 0.5rem !important;
          transition: all 0.2s !important;
        }

        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background-color: rgba(255, 215, 0, 0.15) !important;
          border-radius: 0.5rem;
        }

        .react-calendar__tile--now {
          background: transparent !important;
          border: 1px solid var(--accent-gold) !important;
          border-radius: 0.5rem;
        }

        .react-calendar__tile--active {
          background: var(--accent-gold) !important;
          color: black !important;
          border-radius: 0.5rem;
          font-weight: 700;
        }

        .time-slots {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          width: 100%;
        }

        .time-slot {
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          font-weight: 500;
        }

        .time-slot:hover {
          border-color: var(--accent-gold);
          background: rgba(255, 215, 0, 0.05);
        }

        .time-slot.active {
          background: var(--accent-gold);
          color: black;
          border-color: var(--accent-gold);
          font-weight: 700;
        }
      `}</style>

      <div className="container">
        <div className="table-of-contents"></div>
        
        <header id="pre">
          <h1 className="fluid uppercase tracking-tight">L'INGÉNIERIE DE RÉSULTAT ABSOLU</h1>
          <p className="text-xl mb-12 opacity-80 leading-relaxed font-light">
            Pour les leaders exigeant une automatisation intégrale et un accompagnement business total jusqu'à l'obtention matérielle de vos résultats. Le Plan Élite est l'architecture la plus puissante jamais conçue par Autoslash AI.
          </p>
        </header>

        <main>
          <article>
            <p className="intro">
              Le plan Élite représente le sommet de notre expertise. Ce n'est pas seulement un outil, c'est une transformation radicale de votre infrastructure opérationnelle par l'IA et l'automatisation.
            </p>

            <section id="strategie">
              <h2>Stratégie & Vision</h2>
              <p>Nous commençons par une analyse profonde de vos processus business pour identifier les leviers d'automatisation les plus impactants.</p>
            </section>

            <section id="expertise">
              <h2>Expertise Dédiée</h2>
              <p>Une équipe d'agents IA experts est entraînée spécifiquement sur vos données pour répondre à vos besoins 24/7.</p>
            </section>

            <section id="conversion" className="conversion-tunnel">
              <div className={`tunnel-step ${currentStep >= 1 ? 'active' : ''}`}>
                <div className="tunnel-card">
                  <h2 className="text-3xl font-bold mb-8 uppercase tracking-widest text-[#FFD700]">Carte 1 : Synchronisation Stratégique</h2>
                  <p className="mb-8 opacity-70">Réservez votre créneau pour une session d'ingénierie préliminaire.</p>
                  <div className="calendar-container">
                    <Calendar 
                      onChange={handleDateChange} 
                      value={formData.appointmentDate} 
                      minDate={new Date()} 
                      className="rounded-xl border shadow-lg" 
                    />
                    
                    <div className="w-full">
                      <h3 className="text-sm font-bold uppercase mb-4 opacity-70 text-[#FFD700]">Heure de rendez-vous souhaitée</h3>
                      <div className="time-slots">
                        {["09:00", "10:30", "14:00", "15:30", "17:00"].map((time) => (
                          <div
                            key={time}
                            className={`time-slot ${formData.appointmentTime === time ? "active" : ""}`}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, appointmentTime: time }));
                              if (currentStep === 1) nextStep();
                            }}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`tunnel-step ${currentStep >= 2 ? 'active' : ''} ${currentStep < 2 ? 'pointer-events-none' : ''}`}>
                <div className="tunnel-card">
                  <h2 className="text-3xl font-bold mb-8 uppercase tracking-widest text-[#FFD700]">Carte 2 : Qualification & Vision</h2>
                  <p className="mb-8 opacity-70">Détaillez vos besoins techniques pour notre équipe d'experts.</p>
                  <form onSubmit={submitLead} className="flex flex-col gap-4">
                    <div className="input-group">
                      <input required className="elite-input" name="nom" placeholder="Nom*" value={formData.nom} onChange={handleInputChange} />
                      <input required className="elite-input" name="prenom" placeholder="Prénom*" value={formData.prenom} onChange={handleInputChange} />
                    </div>
                    <div className="input-group">
                      <input required className="elite-input" name="societe" placeholder="Société*" value={formData.societe} onChange={handleInputChange} />
                      <input className="elite-input" name="fonction" placeholder="Fonction" value={formData.fonction} onChange={handleInputChange} />
                    </div>
                    <div className="input-group">
                      <input required className="elite-input" name="secteur" placeholder="Secteur d'activité*" value={formData.secteur} onChange={handleInputChange} />
                      <input required className="elite-input" name="region" placeholder="Région / Pays*" value={formData.region} onChange={handleInputChange} />
                    </div>
                    <div className="input-group">
                      <input required type="email" className="elite-input" name="email" placeholder="Email professionnel*" value={formData.email} onChange={handleInputChange} />
                      <input required className="elite-input" name="telephone" placeholder="Téléphone*" value={formData.telephone} onChange={handleInputChange} />
                    </div>
                    <textarea required className="elite-input min-h-[150px] mb-6" name="message" placeholder="Description de vos besoins spécifiques en automatisation*" value={formData.message} onChange={handleInputChange}></textarea>
                    
                    {errorMsg && <div className="text-red-500 mb-4 text-center font-bold">{errorMsg}</div>}

                      <button 
                        type="submit" 
                        disabled={isSubmitting || !formData.appointmentTime}
                        className="elite-button disabled:opacity-50"
                      >
                        {isSubmitting ? "ENVOI EN COURS..." : "Parlons de votre réussite"}
                      </button>
                  </form>
                </div>
              </div>

              <div className={`tunnel-step ${currentStep >= 3 ? 'active' : ''}`}>
                <div className="tunnel-card text-center py-20 bg-gradient-to-br from-[#FFD700]/10 to-transparent">
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter text-[#FFD700]">Carte 3 : Déploiement & Résultat</h2>
                        <div className="w-20 h-20 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#FFD700]/40">
                          <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-xl opacity-80 max-w-md mx-auto">
                          Architecture verrouillée. Votre session stratégique du <strong>{format(formData.appointmentDate, "dd MMMM yyyy")}</strong> est confirmée.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="opacity-30">
                        <h2 className="text-3xl font-bold uppercase tracking-widest">Carte 3 : Résultat</h2>
                        <p>En attente de validation des étapes précédentes...</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </section>
          </article>
        </main>
      </div>
    </div>
  );
};

export default ElitePlanPage;
