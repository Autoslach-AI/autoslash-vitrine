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
import { useState, FormEvent } from "react";
import { X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "motion/react";

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
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);
  const [sector, setSector] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const validate = () => {
    const newErrors: {[key: string]: string} = {};

    if (!selectedWorkspace) {
      newErrors.package = "Veuillez sélectionner un package";
    }
    if (!firstName.trim()) {
      newErrors.firstName = "Le prénom est obligatoire";
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Le nom est obligatoire";
    }
    if (!email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "L'adresse email n'est pas valide";
    }
    if (!phone.trim()) {
      newErrors.phone = "Le numéro de téléphone est obligatoire";
    }
    if (!company.trim()) {
      newErrors.company = "Le nom de la société est obligatoire";
    }
    if (!region.trim()) {
      newErrors.region = "La région ou le pays est obligatoire";
    }
    if (!sector || !sector.trim()) {
      newErrors.sector = "Veuillez sélectionner votre secteur";
    }
    if (!message.trim()) {
      newErrors.message = "Veuillez décrire votre projet";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase
        .from("enterprises")
        .insert({
          name: `${firstName} ${lastName}`.trim(),
          email: email,
          phone: phone || null,
          sector: sector || null,
          region: region || "AFRIQUE-OUEST",
          message: message,
          package_type: selectedWorkspace?.title?.toUpperCase() || "CUSTOM",
          status: "PROSPECT",
          is_test: false,
          template_id: null,
        });

      if (error) throw error;

      setIsSuccess(true);
    } catch (err: any) {
      setError("Une erreur est survenue. Veuillez réessayer.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-10 bg-white min-h-screen pt-32 font-['DM_Sans']">
      <div className="sm:mx-auto sm:max-w-2xl">
        <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-4">
          <span className="w-4 h-px bg-neutral-300" />
          Autoslash AI — Infrastructure sur mesure
          <span className="w-4 h-px bg-neutral-300" />
        </span>
        <h3 className="text-3xl font-black text-neutral-900 tracking-tighter" style={{ fontFamily: "'Playfair Display', serif" }}>
          Parlons de votre réussite
        </h3>
        <p className="mt-3 text-sm leading-7 text-neutral-400 max-w-md">
          Détaillez vos besoins pour que notre équipe d'experts Autoslash AI puisse concevoir votre infrastructure sur mesure.
        </p>

        {isSuccess ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-neutral-900 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-neutral-900 uppercase tracking-tighter mb-2">
              Demande envoyée
            </h3>
            <p className="text-sm text-neutral-500 max-w-sm">
              Notre équipe Autoslash AI vous contacte dans les 24h pour construire votre infrastructure sur mesure.
            </p>
            <Button 
              onClick={() => setIsSuccess(false)} 
              variant="outline" 
              className="mt-8 rounded-full border-neutral-200 text-xs font-bold uppercase tracking-widest"
            >
              Envoyer une autre demande
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8">
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
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (errors.firstName) setErrors(prev => ({ ...prev, firstName: "" }));
                  }}
                  className={`mt-2 text-neutral-900 placeholder:text-neutral-400 ${
                    errors.firstName 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-neutral-200"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.firstName}</p>
                )}
              </div>
              <div className="col-span-full sm:col-span-3">
                <Label htmlFor="last-name" className="font-medium text-neutral-900">
                  Nom<span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="last-name"
                  name="last-name"
                  autoComplete="family-name"
                  placeholder="Crown"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (errors.lastName) setErrors(prev => ({ ...prev, lastName: "" }));
                  }}
                  className={`mt-2 text-neutral-900 placeholder:text-neutral-400 ${
                    errors.lastName 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-neutral-200"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.lastName}</p>
                )}
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                  }}
                  className={`mt-2 text-neutral-900 placeholder:text-neutral-400 ${
                    errors.email 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-neutral-200"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.email}</p>
                )}
              </div>
              <div className="col-span-full">
                <Label htmlFor="phone" className="font-medium text-neutral-900">
                  Téléphone / WhatsApp<span className="text-red-500">*</span>
                </Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="+221 77 000 00 00"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                  }}
                  className={`mt-2 text-neutral-900 placeholder:text-neutral-400 ${
                    errors.phone 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-neutral-200"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.phone}</p>
                )}
              </div>
              <div className="col-span-full sm:col-span-3">
                <Label htmlFor="company" className="font-medium text-neutral-900">
                  Société<span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="company"
                  name="company"
                  autoComplete="organization"
                  placeholder="Entreprise, Inc."
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    if (errors.company) setErrors(prev => ({ ...prev, company: "" }));
                  }}
                  className={`mt-2 text-neutral-900 placeholder:text-neutral-400 ${
                    errors.company 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-neutral-200"
                  }`}
                />
                {errors.company && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.company}</p>
                )}
              </div>
              <div className="col-span-full sm:col-span-3">
                <Label htmlFor="region" className="font-medium text-neutral-900">
                  Pays / Région<span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="region"
                  name="region"
                  placeholder="Sénégal, France, Canada..."
                  value={region}
                  onChange={(e) => {
                    setRegion(e.target.value);
                    if (errors.region) setErrors(prev => ({ ...prev, region: "" }));
                  }}
                  className={`mt-2 text-neutral-900 placeholder:text-neutral-400 ${
                    errors.region 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-neutral-200"
                  }`}
                />
                {errors.region && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.region}</p>
                )}
              </div>
            <div className="col-span-full sm:col-span-3">
              <Label htmlFor="sector" className="font-medium text-neutral-900">
                Secteur d'activité<span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-2">
                {sector === "autre" ? (
                  <div className="relative flex items-center">
                    <Input
                      type="text"
                      name="other-sector"
                      placeholder="Votre secteur..."
                      className={`text-neutral-900 placeholder:text-neutral-400 pr-10 focus:border-neutral-900 ${
                        errors.sector 
                          ? "border-red-400" 
                          : "border-neutral-900"
                      }`}
                      required
                      autoFocus
                      onChange={(e) => {
                        setSector(e.target.value);
                        if (errors.sector) setErrors(prev => ({ ...prev, sector: "" }));
                      }}
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
                  <Select 
                    onValueChange={(val) => {
                      setSector(val);
                      if (errors.sector) setErrors(prev => ({ ...prev, sector: "" }));
                    }} 
                    value={sector}
                  >
                    <SelectTrigger 
                      id="sector" 
                      name="sector" 
                      className={`text-neutral-900 ${
                        errors.sector 
                          ? "border-red-400" 
                          : "border-neutral-200"
                      }`}
                    >
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
                {errors.sector && (
                  <p className="mt-1 text-xs text-red-500 font-medium">{errors.sector}</p>
                )}
              </div>
            </div>
            <Separator className="col-span-full my-4 bg-neutral-100" />
            <div className="col-span-full">
              <Label htmlFor="package-select" className="font-semibold text-neutral-900 block mb-4">
                Sélectionnez votre package<span className="text-red-500">*</span>
              </Label>
              
              <Select 
                onValueChange={(value) => {
                  setSelectedWorkspace(workspaces.find(w => w.id.toString() === value));
                  if (errors.package) setErrors(prev => ({ ...prev, package: "" }));
                }}
                value={selectedWorkspace?.id?.toString() || ""}
              >
                <SelectTrigger 
                  id="package-select" 
                  className={`text-neutral-900 h-12 rounded-xl ${
                    errors.package ? "border-red-400" : "border-neutral-200"
                  }`}
                >
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
              {errors.package && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.package}</p>
              )}

              {/* Individual Selected Package Card */}
              {selectedWorkspace && (
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
                      {selectedWorkspace.features.map((feature: string, idx: number) => (
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
              )}

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
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors(prev => ({ ...prev, message: "" }));
                }}
                className={`mt-2 min-h-[120px] text-neutral-900 placeholder:text-neutral-400 ${
                  errors.message 
                    ? "border-red-400 focus:border-red-500" 
                    : "border-neutral-200"
                }`}
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-500 font-medium">{errors.message}</p>
              )}
            </div>
          </div>
          <Separator className="my-6 bg-neutral-100" />
          {error && (
            <p className="text-sm text-red-500 text-center mb-4">{error}</p>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-12">
            <Link 
              to="/pricing"
              className="text-xs font-bold uppercase tracking-widest text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Voir les templates
            </Link>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto whitespace-nowrap bg-black text-white hover:bg-neutral-800 rounded-full px-12 h-12 font-bold tracking-widest uppercase text-xs shadow-lg shadow-neutral-900/20"
            >
              {isLoading ? "Envoi en cours..." : "Passer à l'action"}
            </Button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
