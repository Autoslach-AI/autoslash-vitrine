import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { motion, AnimatePresence } from "framer-motion";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { saveOrder } from "../lib/supabaseClient";

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

    const { error } = await saveOrder({
      name: formData.societe || `${formData.nom} ${formData.prenom}`,
      package_type: 'ELITE',
      sector: 'Général Elite',
      email: formData.email,
      phone: formData.telephone,
      message: `${formData.message}\nRendez-vous : ${format(formData.appointmentDate, "dd/MM/yyyy")} à ${formData.appointmentTime}`,
      comm_mode: 'WHATSAPP',
      region: 'Dakar'
    });
    
    setIsSubmitting(false);
    if (!error) {
      setIsSuccess(true);
      setCurrentStep(3);
    } else {
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
    <div className="elite-plan-page bg-[#fdfbf7] min-h-screen" ref={containerRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .elite-plan-page {
          --font-size-min: 16;
          --font-size-max: 20;
          --font-ratio-min: 1.2;
          --font-ratio-max: 1.33;
          --font-width-min: 375;
          --font-width-max: 1500;
          font-family: 'Inter', sans-serif;
          color: light-dark(hsl(0 0% 24%), hsl(0 0% 98%));
          letter-spacing: -0.02em;
          scroll-behavior: smooth;
          scroll-padding-top: 2rem;
          scroll-snap-type: y proximity;
        }

        .elite-plan-page[data-theme='light'] {
          color-scheme: light only;
          background: #fff;
          color: hsl(0 0% 24%);
        }

        .elite-plan-page[data-theme='dark'] {
          color-scheme: dark only;
          background: #000;
          color: hsl(0 0% 98%);
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
          --font-level: 3.8;
          line-height: 1.1;
          margin: 0;
          margin-bottom: 2rem;
          text-wrap: balance;
          font-weight: 900;
          max-width: 20ch;
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
          line-height: 1.6;
          margin: 0;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .elite-plan-page .table-of-contents {
          grid-column: 3;
          position: sticky;
          top: 4rem;
          align-self: start;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .elite-plan-page .table-of-contents nav ol {
          list-style: none;
          padding-left: 1rem;
          margin: 0;
        }

        .elite-plan-page .table-of-contents nav > ol {
          padding: 0;
        }

        .elite-plan-page .table-of-contents a {
          text-decoration: none;
          display: block;
          padding-block: 0.25rem;
          transition: color 0.26s cubic-bezier(0.215, 0.61, 0.355, 1);
          color: light-dark(hsl(0 0% 60%), hsl(0 0% 40%));
        }

        .elite-plan-page .table-of-contents a:hover {
          color: light-dark(#000, #fff);
        }

        .elite-plan-page .table-of-contents h2 {
          font-size: 0.65rem;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
          color: light-dark(#000, #fff);
        }

        .elite-plan-page .table-of-contents .back-to-top {
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.26s;
        }

        .elite-plan-page .table-of-contents:has(a:is(:active, :focus, :target)) .back-to-top {
          opacity: 1;
          pointer-events: all;
        }

        .elite-plan-page footer {
          grid-column: 2;
          width: 100%;
          padding-block: 4rem;
          border-top: 1px solid color-mix(in srgb, currentColor, transparent 90%);
        }

        .elite-plan-page .bear-link {
          position: fixed;
          top: 1rem;
          left: 1rem;
          width: 48px;
          opacity: 0.8;
          color: currentColor;
          z-index: 100;
        }

        /* Waitlist form styles */
        .elite-plan-page [data-waitlist-form] {
          margin-bottom: 4rem;
        }
        .elite-plan-page [data-controls] {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .elite-plan-page [data-controls] input {
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 0.5rem;
          flex: 1;
        }
        .elite-plan-page [data-controls] button {
          background: #333;
          color: #fff;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }

        .elite-plan-page[data-align='right'] .table-of-contents {
          grid-column: 3;
        }
        .elite-plan-page[data-align='left'] .table-of-contents {
          grid-column: 1;
          justify-self: end;
        }
        .elite-plan-page[data-align='left'] main, 
        .elite-plan-page[data-align='left'] header {
          grid-column: 2;
        }

        /* Conversion Tunnel Styles */
        .conversion-tunnel {
          grid-column: 2;
          width: 60ch;
          max-width: 100%;
          margin-top: 10vh;
          display: flex;
          flex-direction: column;
          gap: 10vh;
        }

        .tunnel-step {
          min-height: 90vh;
          scroll-snap-align: center;
          display: flex;
          flex-direction: column;
          justify-content: center;
          opacity: 0.3;
          transition: opacity 0.5s;
        }

        .tunnel-step.active {
          opacity: 1;
        }

        .tunnel-card {
          background: light-dark(#f9f9f9, #111);
          padding: 3rem;
          border-radius: 2rem;
          border: 2px solid color-mix(in srgb, currentColor, transparent 90%);
          box-shadow: 0 30px 60px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
        }

        .tunnel-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 4px;
          background: var(--accent-light);
          opacity: 0.5;
        }

        .elite-plan-page[data-theme='dark'] .tunnel-card {
          background: #0a0a0a;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .input-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .input-group {
            grid-template-columns: 1fr;
          }
        }

        .elite-input {
          width: 100%;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid color-mix(in srgb, currentColor, transparent 80%);
          background: transparent;
          color: currentColor;
          outline: none;
          transition: border-color 0.2s;
        }

        .elite-input:focus {
          border-color: var(--accent-light);
        }

        .elite-button {
          background: light-dark(#000, #fff);
          color: light-dark(#fff, #000);
          padding: 1rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          justify-content: center;
          width: 100%;
        }

        .elite-button:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        .calendar-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          align-items: center;
        }

        .react-calendar {
          width: 100% !important;
          max-width: 400px;
          border: none !important;
          background: transparent !important;
          font-family: inherit !important;
        }

        .react-calendar__tile--now {
          background: color-mix(in srgb, var(--accent-light), transparent 80%) !important;
        }

        .react-calendar__tile--active {
          background: var(--accent-light) !important;
          color: white !important;
          border-radius: 0.5rem;
        }

        .time-slots {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          width: 100%;
        }

        .time-slot {
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid color-mix(in srgb, currentColor, transparent 80%);
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .time-slot.active {
          background: var(--accent-light);
          color: white;
          border-color: var(--accent-light);
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
                  <h2 className="text-3xl font-bold mb-8 uppercase tracking-widest text-[#2a6df5]">Carte 1 : Synchronisation Stratégique</h2>
                  <p className="mb-8 opacity-70">Réservez votre créneau pour une session d'ingénierie préliminaire.</p>
                  <div className="calendar-container">
                    <Calendar 
                      onChange={handleDateChange} 
                      value={formData.appointmentDate} 
                      minDate={new Date()} 
                      className="rounded-xl border shadow-lg" 
                    />
                    
                    <div className="w-full">
                      <h3 className="text-sm font-bold uppercase mb-4 opacity-70">Heure de rendez-vous souhaitée</h3>
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
                  <h2 className="text-3xl font-bold mb-8 uppercase tracking-widest text-[#2a6df5]">Carte 2 : Qualification & Vision</h2>
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
                <div className="tunnel-card text-center py-20 bg-gradient-to-br from-[#2a6df5]/10 to-transparent">
                  <AnimatePresence mode="wait">
                    {isSuccess ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <h2 className="text-4xl font-bold mb-4 uppercase tracking-tighter">Carte 3 : Déploiement & Résultat</h2>
                        <div className="w-20 h-20 bg-[#2a6df5] rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-[#2a6df5]/40">
                          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
