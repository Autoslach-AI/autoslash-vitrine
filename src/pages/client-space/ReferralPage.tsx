import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabaseClient";
import ClientSidebar from "../../components/client/ClientSidebar";
import { 
  Loader2, 
  LogOut,
  Copy,
  Check
} from "lucide-react";

interface Referral {
  id: string;
  referral_code: string;
  filleul_email: string;
  package_type: string;
  montant_fcfa: number;
  commission_fcfa: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID' | 'CANCELLED' | string;
  created_at: string;
}

interface ReferralCommission {
  package_type: string;
  commission_fcfa: number;
  description: string;
}

interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  total_gains: number;
  total_filleuls: number;
  created_at: string;
}

export default function ReferralPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refCode, setRefCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<ReferralCommission[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateCode = (userId: string) => {
    const suffix = userId.slice(-6).toUpperCase();
    return `AS-REF-${suffix}`;
  };

  useEffect(() => {
    if (!isUserLoaded) return;
    if (!user) {
      navigate("/");
      return;
    }

    async function fetchData() {
      try {
        // 1. Fetch user photo URL
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("photo_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.photo_url) {
          setPhotoUrl(profile.photo_url);
        }

        // 2. Fetch or create referral code
        let codeData: ReferralCode | null = null;
        const { data: existingCode, error: codeError } = await supabase
          .from("referral_codes")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existingCode && !codeError) {
          const generated = generateCode(user.id);
          const { data: insertedCode } = await supabase
            .from("referral_codes")
            .insert({
              user_id: user.id,
              code: generated,
              total_gains: 0,
              total_filleuls: 0
            })
            .select()
            .single();

          if (insertedCode) {
            codeData = insertedCode;
          }
        } else {
          codeData = existingCode;
        }

        setRefCode(codeData);

        // 3. Fetch referrals if code exists
        if (codeData?.code) {
          const { data: referralsData } = await supabase
            .from("referrals")
            .select("*")
            .eq("referral_code", codeData.code)
            .order("created_at", { ascending: false });

          if (referralsData) {
            setReferrals(referralsData);
          }
        }

        // 4. Fetch commissions table
        const { data: commissionsData } = await supabase
          .from("referral_commissions")
          .select("*")
          .order("commission_fcfa", { ascending: true });

        if (commissionsData) {
          setCommissions(commissionsData);
        }

      } catch (err) {
        console.error("Error loading referral data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user, isUserLoaded, navigate]);

  const handleCopyLink = () => {
    if (refCode?.code) {
      navigator.clipboard.writeText(refCode.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const maskEmail = (email: string) => {
    if (!email) return "—";
    const [local, domain] = email.split("@");
    if (!domain) return email;
    if (local.length <= 3) {
      return `${local}***@${domain}`;
    }
    return `${local.slice(0, 3)}***@${domain}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  if (loading || !isUserLoaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-jakarta">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <p className="text-sm text-neutral-500 font-medium font-jakarta">Chargement de votre espace parrainage...</p>
        </div>
      </div>
    );
  }

  const avatarSrc = photoUrl || user?.imageUrl;

  return (
    <div className="flex h-screen w-full bg-[#ffffff] text-black font-jakarta overflow-hidden">
      {/* Sidebar */}
      <ClientSidebar activePage="parrainage" user={user} photoUrl={photoUrl} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-neutral-100 bg-white sticky top-0 z-10">
          <h2 className="font-bold text-sm tracking-tight text-black font-jakarta">
            Parrainage
          </h2>

          <div className="flex items-center gap-3">
            <button
              onClick={() => signOut(() => navigate("/"))}
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/5 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="h-4 w-4 text-black/60" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
          <div className="max-w-4xl space-y-6 mx-auto">
            {/* BLOC 1 — Mon code parrainage */}
            <div className="bg-white border border-[#e5e7eb] rounded-[12px] p-6 space-y-4">
              <h3 className="font-bold text-sm text-black font-jakarta">
                Mon code parrainage
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-2xl font-mono font-bold text-black tracking-tight block">
                    {refCode?.code || "—"}
                  </span>
                </div>
                <button
                  onClick={handleCopyLink}
                  className="bg-black hover:bg-black/90 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors self-start sm:self-center font-jakarta flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={12} />
                      <span>✓ Code copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copier le code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* BLOC 2 — Mes statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1 - Gains */}
              <div className="bg-white border border-[#e5e7eb] rounded-[12px] p-6 space-y-1">
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider font-jakarta">
                  Gains totaux
                </p>
                <p className="text-2xl font-bold text-black font-jakarta">
                  {(refCode?.total_gains || 0).toLocaleString("fr-FR")} FCFA
                </p>
                <p className="text-xs text-black/40 font-jakarta">
                  Commissions confirmées
                </p>
              </div>

              {/* Card 2 - Filleuls */}
              <div className="bg-white border border-[#e5e7eb] rounded-[12px] p-6 space-y-1">
                <p className="text-[10px] font-bold text-black/40 uppercase tracking-wider font-jakarta">
                  Filleuls actifs
                </p>
                <p className="text-2xl font-bold text-black font-jakarta">
                  {refCode?.total_filleuls || 0}
                </p>
                <p className="text-xs text-black/40 font-jakarta">
                  Projets convertis
                </p>
              </div>
            </div>

            {/* BLOC 3 — Commissions par package */}
            <div className="bg-white border border-[#e5e7eb] rounded-[12px] p-6 space-y-4">
              <h3 className="font-bold text-sm text-black font-jakarta">
                Commissions par package
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-100 text-black/40 font-bold uppercase tracking-wider">
                      <th className="py-2.5 font-jakarta">Package</th>
                      <th className="py-2.5 font-jakarta text-right">Commission</th>
                      <th className="py-2.5 font-jakarta pl-6">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissions.length === 0 ? (
                      <tr className="border-b border-neutral-100 text-black/50">
                        <td className="py-3 font-jakarta font-medium">STARTUP</td>
                        <td className="py-3 font-jakarta text-right font-medium">10 000 FCFA</td>
                        <td className="py-3 font-jakarta text-black/40 pl-6">Par prospection ou parrainage de projet Startup</td>
                      </tr>
                    ) : (
                      commissions.map((comm, idx) => (
                        <tr key={idx} className="border-b border-neutral-100 hover:bg-black/[0.01]">
                          <td className="py-3 font-jakarta font-bold uppercase text-black">{comm.package_type}</td>
                          <td className="py-3 font-jakarta text-right font-bold text-black">
                            {comm.commission_fcfa.toLocaleString("fr-FR")} FCFA
                          </td>
                          <td className="py-3 font-jakarta text-black/60 pl-6">{comm.description}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BLOC 4 — Historique des filleuls */}
            <div className="bg-white border border-[#e5e7eb] rounded-[12px] p-6 space-y-4">
              <h3 className="font-bold text-sm text-black font-jakarta">
                Historique des filleuls
              </h3>
              {referrals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                  <p className="text-sm font-bold text-black/60 font-jakarta">
                    Aucun filleul pour le moment
                  </p>
                  <p className="text-xs text-black/40 font-jakarta">
                    Partagez votre lien pour commencer à accumuler des commissions.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-100 text-black/40 font-bold uppercase tracking-wider">
                        <th className="py-2.5 font-jakarta">Email</th>
                        <th className="py-2.5 font-jakarta">Package</th>
                        <th className="py-2.5 font-jakarta text-right">Commission</th>
                        <th className="py-2.5 font-jakarta text-center">Statut</th>
                        <th className="py-2.5 font-jakarta text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((ref) => {
                        let badgeStyle = "bg-neutral-100 text-neutral-500";
                        let badgeLabel = "En attente";
                        
                        if (ref.status === "CONFIRMED") {
                          badgeStyle = "bg-black text-white";
                          badgeLabel = "Confirmé";
                        } else if (ref.status === "PAID") {
                          badgeStyle = "bg-black text-white";
                          badgeLabel = "Payé";
                        } else if (ref.status === "CANCELLED") {
                          badgeStyle = "bg-neutral-100 text-neutral-400";
                          badgeLabel = "Annulé";
                        }

                        return (
                          <tr key={ref.id} className="border-b border-neutral-100 hover:bg-black/[0.01]">
                            <td className="py-3 font-jakarta text-black" title={ref.filleul_email}>
                              {maskEmail(ref.filleul_email)}
                            </td>
                            <td className="py-3 font-jakarta font-bold uppercase text-black">
                              {ref.package_type}
                            </td>
                            <td className="py-3 font-jakarta text-right font-bold text-black">
                              {(ref.commission_fcfa || 0).toLocaleString("fr-FR")} FCFA
                            </td>
                            <td className="py-3 font-jakarta text-center">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${badgeStyle}`}>
                                {badgeLabel}
                              </span>
                            </td>
                            <td className="py-3 font-jakarta text-right text-black/40">
                              {formatDate(ref.created_at)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
