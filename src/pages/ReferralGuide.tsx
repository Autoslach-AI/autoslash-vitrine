import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";

export default function ReferralGuide() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      num: "01",
      title: "Partagez votre code",
      desc: "Communiquez votre code personnel à vos contacts par SMS, WhatsApp ou bouche à oreille."
    },
    {
      num: "02",
      title: "Votre contact commande",
      desc: "Lors de sa commande sur Autoslash AI, votre contact saisit votre code dans le champ prévu à cet effet à l'étape 4 du formulaire de commande."
    },
    {
      num: "03",
      title: "Recevez votre commission",
      desc: "Dès que le projet est validé et converti, notre équipe vous contacte pour vous verser votre commission directement."
    }
  ];

  const commissions = [
    { pack: "STARTUP", price: "7 500 FCFA", desc: "5% du package minimum" },
    { pack: "BUSINESS", price: "15 000 FCFA", desc: "5% du package minimum" },
    { pack: "ENTERPRISE", price: "25 000 FCFA", desc: "Fixe" },
    { pack: "ELITE", price: "À négocier", desc: "Contactez-nous" }
  ];

  const faqs = [
    {
      q: "Combien de personnes puis-je parrainer ?",
      r: "Il n'y a pas de limite. Vous pouvez parrainer autant de personnes que vous le souhaitez."
    },
    {
      q: "Quand est-ce que je reçois ma commission ?",
      r: "Votre commission est versée après validation du projet par notre équipe. Nous vous contactons directement."
    },
    {
      q: "Comment savoir si mon parrainage a fonctionné ?",
      r: "Vous pouvez suivre vos parrainages en temps réel depuis votre page de parrainage dans votre espace."
    }
  ];

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-black font-jakarta py-12 px-6">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <Link
            to="/client-space/parrainage"
            className="inline-flex items-center gap-1 text-xs font-bold text-black/50 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Retour</span>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-black font-jakarta">
              Comment fonctionne le parrainage ?
            </h1>
            <p className="text-sm text-black/60 leading-relaxed font-jakarta">
              Tout ce que vous devez savoir pour gagner des commissions avec Autoslash AI
            </p>
          </div>
        </header>

        {/* Section 1 — Le principe */}
        <section className="border-t border-black/10 pt-8 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black/40 font-jakarta">
            Le principe
          </h2>
          <p className="text-sm text-black/80 leading-relaxed font-jakarta">
            Le programme de parrainage Autoslash AI vous permet de gagner une commission à chaque fois qu'une personne commande un projet grâce à votre code personnel.
          </p>
        </section>

        {/* Section 2 — Les étapes */}
        <section className="border-t border-black/10 pt-8 space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black/40 font-jakarta">
            Les étapes du parrainage
          </h2>
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={idx}>
                <div className="flex gap-4">
                  <span className="font-mono text-xs font-bold text-black/30 pt-0.5">
                    {step.num}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-black font-jakarta">
                      {step.title}
                    </h3>
                    <p className="text-xs text-black/60 leading-relaxed font-jakarta">
                      {step.desc}
                    </p>
                  </div>
                </div>
                {idx === 1 && (
                  <div className="ml-10 mt-4 border border-neutral-200 rounded-[10px] overflow-hidden text-xs font-mono bg-[#0a0f1e]">
                    {/* Header mockup */}
                    <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
                      <span className="text-[#00AAFF] font-bold text-[10px] tracking-widest">
                        ÉTAPE 04 / 05
                      </span>
                      <span className="text-neutral-500 text-[10px] tracking-widest">
                        PRISE DE CONTACT
                      </span>
                    </div>

                    {/* Champs simulés */}
                    <div className="px-4 py-4 space-y-3">
                      
                      {/* Message field */}
                      <div>
                        <p className="text-[#00AAFF] text-[9px] font-bold tracking-widest mb-1">
                          MESSAGE / BESOINS SPÉCIFIQUES
                        </p>
                        <div className="border border-neutral-700 rounded px-3 py-2 text-neutral-600 text-[10px]">
                          Détaillez vos besoins IA...
                        </div>
                      </div>

                      {/* Code parrainage — mis en évidence */}
                      <div className="border border-[#00AAFF]/60 rounded-md p-2 bg-[#00AAFF]/5">
                        <p className="text-[#00AAFF] text-[9px] font-bold tracking-widest mb-1 flex items-center gap-1">
                          <span>▶</span>
                          CODE DE PARRAINAGE (OPTIONNEL)
                        </p>
                        <div className="border border-[#00AAFF]/40 rounded px-3 py-2 text-neutral-400 text-[10px]">
                          ex. AS-REF-XXXXXX
                        </div>
                        <p className="text-[#00AAFF]/70 text-[9px] mt-1.5 font-jakarta">
                          ← Votre contact saisit ici votre code
                        </p>
                      </div>

                      {/* Boutons simulés */}
                      <div className="flex gap-2 pt-1">
                        <div className="border border-neutral-600 rounded px-3 py-1.5 text-neutral-500 text-[9px] tracking-widest">
                          ← PRÉCÉDENT
                        </div>
                        <div className="bg-[#00AAFF] rounded px-3 py-1.5 text-black text-[9px] font-bold tracking-widest">
                          COMMANDER
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 3 — Les commissions */}
        <section className="border-t border-black/10 pt-8 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black/40 font-jakarta">
            Les commissions
          </h2>
          <div className="overflow-x-auto border border-black/10 rounded-lg">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-black/[0.02] border-b border-black/10 text-black/50 font-bold">
                  <th className="py-2.5 px-4 font-jakarta">Package</th>
                  <th className="py-2.5 px-4 font-jakarta text-right">Commission</th>
                  <th className="py-2.5 px-4 font-jakarta pl-6">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {commissions.map((comm, idx) => (
                  <tr key={idx} className="hover:bg-black/[0.01]">
                    <td className="py-3 px-4 font-bold text-black font-jakarta">{comm.pack}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-black">{comm.price}</td>
                    <td className="py-3 px-4 text-black/60 pl-6 font-jakarta">{comm.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4 — Les règles importantes */}
        <section className="border-t border-black/10 pt-8 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black/40 font-jakarta">
            Règles importantes
          </h2>
          <ul className="space-y-3">
            {[
              "La commission est versée uniquement après conversion du projet en client actif",
              "L'auto-parrainage est strictement interdit",
              "Le paiement est effectué manuellement par notre équipe après vérification",
              "Une commission par projet — non cumulable sur un même projet"
            ].map((rule, idx) => (
              <li key={idx} className="flex gap-3 text-xs text-black/75 font-jakarta leading-relaxed">
                <span className="text-black/30 font-bold select-none">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 5 — Questions fréquentes */}
        <section className="border-t border-black/10 pt-8 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-black/40 font-jakarta">
            Questions fréquentes
          </h2>
          <div className="space-y-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-black/[0.08] rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-black/[0.01] hover:bg-black/[0.03] transition-colors"
                  >
                    <span className="text-xs font-bold text-black font-jakarta">
                      {faq.q}
                    </span>
                    <span className="text-black/50">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 py-3 bg-[#ffffff] border-t border-black/[0.05]">
                      <p className="text-xs text-black/70 leading-relaxed font-jakarta">
                        {faq.r}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-black/10 pt-8 flex justify-center">
          <Link
            to="/client-space/parrainage"
            className="text-xs font-bold text-black underline hover:text-black/70 transition-colors font-jakarta"
          >
            Accéder à mon espace parrainage →
          </Link>
        </footer>
      </div>
    </div>
  );
}
