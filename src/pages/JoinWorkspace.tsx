import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, XCircle } from "lucide-react";

export default function JoinWorkspace() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<any>(null);
  const [errorType, setErrorType] = useState<'INVALID' | 'USED' | 'EXPIRED' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setErrorType('INVALID');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('collaborator_invites')
          .select('*, enterprises(name)')
          .eq('token', token)
          .maybeSingle();

        if (error || !data) {
          setErrorType('INVALID');
        } else if (data.status !== 'PENDING') {
          setErrorType('USED');
        } else if (new Date(data.expires_at) < new Date()) {
          setErrorType('EXPIRED');
        } else {
          setInvite(data);
        }
      } catch (err) {
        console.error("Error verifying invite token:", err);
        setErrorType('INVALID');
      } finally {
        setLoading(false);
      }
    }

    checkToken();
  }, [token]);

  const handleJoin = async () => {
    if (!isSignedIn) {
      openSignIn({ redirectUrl: `/rejoindre/${token}` });
      return;
    }

    if (!invite) return;

    setIsSubmitting(true);
    setJoinError(null);

    try {
      const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Collaborateur';
      const { error: insertError } = await supabase
        .from('workspace_members')
        .insert({
          enterprise_id: invite.enterprise_id,
          email: user.primaryEmailAddress?.emailAddress,
          role: invite.role,
          status: 'ACTIVE',
          user_profile_id: user.id,
          full_name: fullName,
          joined_at: new Date().toISOString()
        });

      if (insertError) {
        console.error("Error inserting member:", insertError);
        throw new Error("Impossible de rejoindre ce workspace : vous êtes peut-être déjà membre ou l'opération a échoué.");
      }

      const { error: updateError } = await supabase
        .from('collaborator_invites')
        .update({ status: 'ACCEPTED' })
        .eq('token', token);

      if (updateError) {
        console.warn("Error updating invite status:", updateError);
      }

      navigate("/dashboard");
    } catch (err: any) {
      setJoinError(err.message || "Une erreur est survenue lors de l'adhésion au workspace.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !isUserLoaded) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <p className="text-sm text-neutral-500 font-medium font-sans">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  // ÉTATS ERREURS
  if (errorType) {
    let title = "Lien invalide";
    let message = "Ce lien d'invitation est incorrect ou n'existe pas.";
    if (errorType === 'USED') {
      title = "Lien déjà utilisé";
      message = "Cette invitation a déjà été acceptée par un autre collaborateur.";
    } else if (errorType === 'EXPIRED') {
      title = "Lien expiré";
      message = "Cette invitation a expiré. Veuillez demander une nouvelle invitation à votre administrateur.";
    }

    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white border border-neutral-200 rounded-[12px] shadow-sm p-8 flex flex-col items-center text-center">
          <div className="mb-4">
            <span className="text-lg font-bold font-sans tracking-tight">Autoslash AI</span>
          </div>
          <XCircle className="h-12 w-12 text-black mb-4" strokeWidth={1.5} />
          <h2 className="text-base font-bold text-black mb-2 font-sans">{title}</h2>
          <p className="text-xs text-neutral-500 max-w-sm mb-6 leading-relaxed font-sans">{message}</p>
          <a
            href="/contact"
            className="text-xs font-semibold text-black underline cursor-pointer hover:opacity-70 transition-opacity font-sans"
          >
            Contacter Autoslash AI
          </a>
        </div>
      </div>
    );
  }

  // ÉTAT VALIDE
  const workspaceName = invite?.enterprises?.name || 'Workspace';
  const role = invite?.role || 'VIEWER';

  let roleDescription = "Lecture seule — Peut consulter sans modifier";
  if (role === 'EDITOR') {
    roleDescription = "Éditeur — Peut modifier le contenu";
  } else if (role === 'ADMIN') {
    roleDescription = "Administrateur — Accès complet sauf suppression";
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-[12px] shadow-sm p-8 flex flex-col">
        <div className="flex flex-col items-center text-center mb-6">
          <span className="text-lg font-bold tracking-tight mb-4 font-sans">Autoslash AI</span>
          <p className="text-xs text-neutral-400 font-medium font-sans">Vous avez été invité à rejoindre</p>
          <h2 className="text-xl font-bold text-black mt-1 font-sans">{workspaceName}</h2>
        </div>

        <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider font-sans">Rôle proposé</span>
            <span className="text-xs font-bold text-black font-sans">{role}</span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed font-sans">{roleDescription}</p>
        </div>

        {isSignedIn ? (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-xs text-neutral-400 font-sans">Connecté en tant que :</p>
              <p className="text-xs font-bold text-black font-sans">{user.primaryEmailAddress?.emailAddress}</p>
            </div>
            <button
              onClick={handleJoin}
              disabled={isSubmitting}
              className="w-full h-10 bg-black hover:bg-black/90 text-white rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-sans disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : null}
              Rejoindre le workspace →
            </button>
            {joinError && (
              <p className="text-xs text-red-500 mt-2 text-center font-sans font-medium">{joinError}</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => openSignIn({ redirectUrl: `/rejoindre/${token}` })}
              className="w-full h-10 bg-black hover:bg-black/90 text-white rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer font-sans"
            >
              Se connecter pour rejoindre →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
