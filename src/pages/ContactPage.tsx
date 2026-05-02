"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { useState } from "react";
import { X } from "lucide-react";

const workspaces = [
  {
    id: 1,
    title: "Startup",
    description: "Site web premium interactif et design haute qualité.",
    price: "150K - 200K",
    maintenance: "25K",
    features: [
      "Design Haute Qualité avec animations",
      "Formulaire de contact connecté",
      "Déploiement Vercel avec URL live",
      "Maintenance et Hébergement",
      "Support : email uniquement"
    ]
  },
  {
    id: 2,
    title: "Business",
    description: "Solution IA intermédiaire pour booster votre visibilité et votre support.",
    price: "300K - 350K",
    maintenance: "50K",
    features: [
      "Agent Support WhatsApp entraîné",
      "Automatisation réseaux sociaux",
      "Vidéos marketing automatisées",
      "Tokens IA : 1.000.000 / mois",
      "Support : WhatsApp + Email"
    ]
  },
  {
    id: 3,
    title: "Enterprise",
    description: "Automatisation totale avec une équipe d'agents IA experts.",
    price: "450K - 500K",
    maintenance: "100K",
    features: [
      "Équipe de 3 à 5 agents experts",
      "Agent Commercial (suivi leads)",
      "Agent Contenu (publication auto)",
      "Full automation via n8n",
      "Tokens IA : 5.000.000 / mois"
    ]
  },
  {
    id: 4,
    title: "Elite",
    description: "Infrastructure cloud dédiée et agents hautement spécialisés.",
    price: "Sur Mesure",
    maintenance: "SLA Garanti",
    features: [
      "IA Générative Avancée",
      "Integration ERP/CRM complexe",
      "Consulting Stratégique IA",
      "Support VIP 24/7",
      "Infrastructure Dédiée"
    ]
  },
];

export default function ContactPage() {
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaces[0]);
  const [sector, setSector] = useState("");

  return (
    <div className="flex items-center justify-center p-10 bg-white min-h-screen pt-32 font-sans">
      <div className="sm:mx-auto sm:max-w-2xl">
        <h3 className="text-lg font-semibold text-neutral-900">
          Parlons de votre réussite
        </h3>
        <p className="mt-1 text-sm leading-6 text-neutral-500">
          Détaillez vos besoins pour que notre équipe d'experts Autoslash AI puisse concevoir votre infrastructure sur mesure.
        </p>
        <form action="#" method="post" className="mt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-6 text-neutral-900">
            <div className="col-span-full sm:col-span-3">
              <Label htmlFor="first-name" className="font-medium text-neutral-900">
                Prénom<span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                id="first-name"
                name="first-name"
                autoComplete="given-name"
                required
                placeholder="Emma"
                className="mt-2 border-neutral-200 text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            <div className="col-span-full sm:col-span-3">
              <Label htmlFor="last-name" className="font-medium text-neutral-900">
                Nom
              </Label>
              <Input
                type="text"
                id="last-name"
                name="last-name"
                autoComplete="family-name"
                placeholder="Crown"
                className="mt-2 border-neutral-200 text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            <div className="col-span-full">
              <Label htmlFor="email" className="font-medium text-neutral-900">
                Email professionnel<span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                autoComplete="email"
                required
                placeholder="emma@company.com"
                className="mt-2 border-neutral-200 text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            <div className="col-span-full sm:col-span-3">
              <Label htmlFor="company" className="font-medium text-neutral-900">
                Société
              </Label>
              <Input
                type="text"
                id="company"
                name="company"
                autoComplete="organization"
                placeholder="Entreprise, Inc."
                className="mt-2 border-neutral-200 text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
            <div className="col-span-full sm:col-span-3">
              <Label htmlFor="size" className="font-medium text-neutral-900">
                Secteur d'activité
              </Label>
              <div className="relative mt-2">
                {sector === "autre" ? (
                  <div className="relative flex items-center">
                    <Input
                      type="text"
                      name="other-sector"
                      placeholder="Votre secteur..."
                      className="border-neutral-900 text-neutral-900 placeholder:text-neutral-400 pr-10"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setSector("")}
                      className="absolute right-3 text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Select onValueChange={setSector} value={sector}>
                    <SelectTrigger id="size" name="size" className="border-neutral-200 text-neutral-900">
                      <SelectValue placeholder="Choisir un secteur" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-neutral-900">
                      <SelectItem value="sante">Santé</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="education">Éducation</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <Separator className="col-span-full my-4 bg-neutral-100" />
            <div className="col-span-full">
              <Label htmlFor="package-select" className="font-semibold text-neutral-900 block mb-4">
                Sélectionnez votre package
              </Label>
              
              <Select 
                defaultValue={selectedWorkspace.id.toString()}
                onValueChange={(value) => 
                  setSelectedWorkspace(workspaces.find(w => w.id.toString() === value) || workspaces[0])
                }
              >
                <SelectTrigger id="package-select" className="border-neutral-200 text-neutral-900 h-12 rounded-xl">
                  <SelectValue placeholder="Choisir un package" />
                </SelectTrigger>
                <SelectContent className="bg-white text-neutral-900">
                  {workspaces.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.title.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Individual Selected Package Card */}
              <div className="mt-8 flex justify-center">
                <div className="w-full border-2 border-neutral-900 rounded-2xl p-8 bg-neutral-50 shadow-xl shadow-neutral-100 transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <h4 className="text-xl font-black text-neutral-900 uppercase tracking-tighter">
                            {selectedWorkspace.title}
                        </h4>
                        <p className="text-sm text-neutral-500 mt-1 leading-relaxed max-w-sm">
                            {selectedWorkspace.description}
                        </p>
                    </div>
                    <div className="w-4 h-4 rounded-full bg-neutral-900" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-8 text-neutral-900">
                    {selectedWorkspace.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                            {feature}
                        </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t border-neutral-200 flex justify-between items-end">
                    <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">Configuration</span>
                        <span className="text-2xl font-black text-neutral-900">
                          {selectedWorkspace.price}
                        </span>
                    </div>
                    <div className="text-right text-neutral-900">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1 uppercase">Maintenance</span>
                        <span className="text-lg font-bold text-emerald-600">
                          {selectedWorkspace.maintenance}{selectedWorkspace.maintenance !== "SLA Garanti" && "/mois"}
                        </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-6 text-xs text-neutral-400 italic">
                * Les prix indiqués sont des bases de calcul pour une infrastructure standard.
              </p>
            </div>
            <div className="col-span-full mt-4">
              <Label htmlFor="message" className="font-medium text-neutral-900">
                Décrivez votre projet ou votre idée<span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                required
                placeholder="Expliquez-nous comment nous pouvons automatiser votre croissance..."
                className="mt-2 border-neutral-200 min-h-[120px] text-neutral-900 placeholder:text-neutral-400"
              />
            </div>
          </div>
          <Separator className="my-6 bg-neutral-100" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-12">
            <Link 
              to="/pricing"
              className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Voir les templates
            </Link>
            <Button type="submit" className="w-full sm:w-auto whitespace-nowrap bg-black text-white hover:bg-neutral-800 rounded-full px-12 h-12 font-bold tracking-widest uppercase text-xs shadow-lg shadow-neutral-900/20">
              Passer à l'action
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
