import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface InviteCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  enterprise_id: string | undefined;
  package_type: string | undefined;
  user_profile_id: string | undefined;
  userStatus?: string;
}

export default function InviteCollaboratorModal({
  isOpen,
  onClose,
  enterprise_id,
  package_type,
  user_profile_id,
  userStatus
}: InviteCollaboratorModalProps) {
  const [enterpriseName, setEnterpriseName] = useState<string>('');
  const [currentMemberCount, setCurrentMemberCount] = useState<number>(0);
  const [maxCollaborators, setMaxCollaborators] = useState<number>(8);
  const [loading, setLoading] = useState<boolean>(true);
  const [email, setEmail] = useState<string>('');
  const [role, setRole] = useState<'VIEWER' | 'EDITOR' | 'ADMIN'>('VIEWER');
  const [copied, setCopied] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !enterprise_id) return;

    setLoading(true);
    let nameLoaded = '';
    let membersCount = 0;
    let maxCollabs = 8;

    const fetchData = async () => {
      try {
        // Fetch workspace/enterprise details
        const { data: entData } = await supabase
          .from('enterprises')
          .select('name')
          .eq('enterprise_id', enterprise_id)
          .single();
        if (entData?.name) nameLoaded = entData.name;

        // Fetch active members
        const { count, error: membersError } = await supabase
          .from('workspace_members')
          .select('*', { count: 'exact', head: true })
          .eq('enterprise_id', enterprise_id)
          .eq('status', 'ACTIVE');

        if (!membersError && count !== null) {
          membersCount = count;
        }

        // Fetch max count
        if (package_type) {
          const { data: planData } = await supabase
            .from('plan_definitions')
            .select('max_collaborators')
            .eq('plan_name', package_type)
            .maybeSingle();

          if (planData?.max_collaborators) {
            maxCollabs = planData.max_collaborators;
          } else {
            const defaultLimits: Record<string, number> = {
              STARTUP: 8,
              BUSINESS: 20,
              ENTERPRISE: 40,
              ELITE: 999
            };
            maxCollabs = defaultLimits[package_type.toUpperCase()] || 8;
          }
        }

        setEnterpriseName(nameLoaded || 'Mon Workspace');
        setCurrentMemberCount(membersCount);
        setMaxCollaborators(maxCollabs);
      } catch (err) {
        console.error('Error loading invite modal data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, enterprise_id, package_type]);

  if (!isOpen) return null;

  const isLimitReached = currentMemberCount >= maxCollaborators;
  const progressPercentage = Math.min((currentMemberCount / maxCollaborators) * 100, 100);

  const handleCopyLink = async () => {
    if (!enterprise_id || isCopying || isLimitReached) return;
    setIsCopying(true);
    setToastMessage(null);
    try {
      const token = window.crypto.randomUUID ? window.crypto.randomUUID() : 'invite_' + Math.random().toString(36).substring(2, 11);

      const { error } = await supabase
        .from('collaborator_invites')
        .insert({
          enterprise_id,
          invited_by: user_profile_id,
          email: '',
          role,
          token,
          status: 'PENDING'
        });

      if (error) throw error;

      const inviteUrl = `${window.location.origin}/rejoindre/${token}`;
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: any) {
      console.error(err);
      setToastMessage({ text: 'Erreur: ' + (err.message || 'Impossible de créer le lien'), isError: true });
    } finally {
      setIsCopying(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enterprise_id || isSubmitting || isLimitReached) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setToastMessage({ text: 'Veuillez saisir une adresse e-mail.', isError: true });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setToastMessage({ text: "Format de l'adresse e-mail invalide.", isError: true });
      return;
    }

    setIsSubmitting(true);
    setToastMessage(null);

    try {
      const { data: existingMember, error: memberQueryError } = await supabase
        .from('workspace_members')
        .select('id')
        .eq('enterprise_id', enterprise_id)
        .eq('email', trimmedEmail)
        .maybeSingle();

      if (memberQueryError) throw memberQueryError;

      if (existingMember) {
        setToastMessage({ text: 'Cet utilisateur est déjà membre de ce workspace.', isError: true });
        setIsSubmitting(false);
        return;
      }

      const token = window.crypto.randomUUID ? window.crypto.randomUUID() : 'invite_' + Math.random().toString(36).substring(2, 11);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error: inviteError } = await supabase
        .from('collaborator_invites')
        .insert({
          enterprise_id,
          invited_by: user_profile_id,
          email: trimmedEmail,
          role,
          token,
          status: 'PENDING',
          expires_at: expiresAt.toISOString()
        });

      if (inviteError) throw inviteError;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      const workspaceName = enterpriseName;

      try {
        const edgeResponse = await fetch(
          `${supabaseUrl}/functions/v1/send-invite-email`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseAnonKey,
              "Authorization": `Bearer ${supabaseAnonKey}`
            },
            body: JSON.stringify({
              email: trimmedEmail,
              role,
              token,
              inviterName: user_profile_id,
              workspaceName: workspaceName
            })
          }
        );

        if (edgeResponse.ok === false) {
          console.error("Failed to send edge invite email via Edge Function", await edgeResponse.text());
        }
      } catch (err) {
        console.error("Edge function email invite error:", err);
      }

      setToastMessage({ text: 'Invitation envoyée !', isError: false });
      setEmail('');

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setToastMessage({ text: err.message || "Une erreur est survenue lors de l'enregistrement.", isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center font-jakarta">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl shadow-2xl overflow-hidden max-w-md w-full relative z-10 p-6 mx-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-black tracking-tight">Inviter un collaborateur</h3>
            <p className="text-xs text-black/50 uppercase tracking-tight mt-0.5 font-semibold">
              {loading ? 'Chargement...' : enterpriseName}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-black/5 text-black/55 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Feedback Alert Overlay */}
        {toastMessage && (
          <div className={`mb-4 p-3 rounded-lg text-xs font-semibold flex items-center justify-between border ${
            toastMessage.isError 
              ? 'bg-neutral-50 text-neutral-800 border-neutral-300' 
              : 'bg-neutral-900 text-white border-neutral-800 animate-pulse'
          }`}>
            <span>{toastMessage.text}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">
              <X size={12} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="animate-spin text-black/40 h-8 w-8" />
            <span className="text-xs text-black/40 font-jakarta mt-2">Récupération des données...</span>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Compteur and Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-semibold text-black/50">Plan : {package_type || 'STARTUP'}</span>
                <span className="text-xs font-bold text-black">{currentMemberCount}/{maxCollaborators} collaborateurs</span>
              </div>
              <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-black rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {isLimitReached && (
                <p className="text-xs font-semibold text-neutral-600 mt-1">
                  Limite atteinte. Passez à l'offre supérieure.
                </p>
              )}
            </div>

            {/* Main Form */}
            {userStatus === 'PROSPECT' ? (
              <div className="flex flex-col items-center justify-center text-center py-10 px-6 border border-dashed border-neutral-200 rounded-lg bg-neutral-50/50">
                <p className="text-xs font-semibold text-neutral-800">
                  Invitez votre équipe dès l'activation de votre espace.
                </p>
                <span className="text-[11px] font-bold text-neutral-400 mt-2 hover:text-black cursor-pointer transition-colors">
                  Passez à l'étape suivante →
                </span>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                {/* Field: Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black/80">Adresse e-mail</label>
                  <input 
                    type="text"
                    value={email}
                    disabled={isLimitReached}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex. collaborateur@gmail.com"
                    className="w-full h-9 px-3 rounded-md border border-neutral-200 outline-none focus:border-black/30 text-xs font-jakarta bg-[#fcfcfc] focus:bg-white transition-all disabled:opacity-50 disabled:bg-neutral-50"
                    required
                  />
                </div>

                {/* Field: Role */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-black/80">Rôle</label>
                  <select
                    value={role}
                    disabled={isLimitReached}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full h-9 px-2 rounded-md border border-neutral-200 outline-none focus:border-black/30 text-xs font-jakarta bg-[#fcfcfc] focus:bg-white transition-all disabled:opacity-50"
                  >
                    <option value="VIEWER">Lecture seule</option>
                    <option value="EDITOR">Éditeur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                  
                  {/* Role Description text */}
                  <div className="p-2.5 rounded bg-neutral-50 border border-neutral-100 mt-1.5">
                    <p className="text-[10px] text-neutral-500 font-medium">
                      {role === 'VIEWER' && 'VIEWER : "Peut consulter sans modifier"'}
                      {role === 'EDITOR' && 'EDITOR : "Peut modifier le contenu"'}
                      {role === 'ADMIN' && 'ADMIN : "Accès complet sauf suppression du compte"'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    disabled={isLimitReached || isCopying}
                    onClick={handleCopyLink}
                    className="w-full h-9 flex items-center justify-center gap-1.5 border border-neutral-200 hover:bg-neutral-50 text-neutral-900 rounded-md text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isCopying ? (
                      <Loader2 className="animate-spin h-3.5 w-3.5 mr-1" />
                    ) : null}
                    {copied ? '✓ Lien copié !' : '🔗 Copier le lien d’invitation'}
                  </button>

                  <button
                    type="submit"
                    disabled={isLimitReached || isSubmitting}
                    className="w-full h-10 bg-black hover:bg-black/90 text-white rounded-md text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:bg-neutral-200 disabled:text-neutral-400"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin h-3.5 w-3.5 mr-1" />
                    ) : null}
                    Envoyer l’invitation →
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
