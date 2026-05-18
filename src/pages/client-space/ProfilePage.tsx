import { useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Briefcase, Pencil, Check, X } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [enterprise, setEnterprise] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [activeTab, setActiveTab] = useState('Informations');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    company: '',
    intention: '',
    sector: '',
  });

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { navigate('/'); return; }
    fetchData();
  }, [user, isLoaded]);

  const fetchData = async () => {
    const { data: prof } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user!.id)
      .single();

    const { data: ent } = await supabase
      .from('enterprises')
      .select('*')
      .eq('email', user!.primaryEmailAddress?.emailAddress)
      .maybeSingle();

    setProfile(prof);
    setEnterprise(ent);
    setFormData({
      full_name: prof?.full_name || user?.fullName || '',
      phone: prof?.phone || '',
      company: prof?.company || '',
      intention: prof?.intention || '',
      sector: prof?.sector || '',
    });
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('user_profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        company: formData.company,
        intention: formData.intention,
        sector: formData.sector,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setEditingField(null);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'CONFIRMER') return;
    
    setIsDeleting(true);
    try {
      // 1. Delete favorites
      await supabase.from('user_favorites').delete()
        .eq('user_id', user!.id);

      // 2. Delete profile
      await supabase.from('user_profiles').delete()
        .eq('id', user!.id);

      // 3. Delete enterprise (only if PROSPECT)
      await supabase.from('enterprises').delete()
        .eq('email', user!.primaryEmailAddress?.emailAddress)
        .eq('status', 'PROSPECT');

      // 4. Delete Clerk account
      await user!.delete();

      // 5. Redirect
      navigate('/');
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);
      setIsDeleting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-black/10 border-t-black 
                      rounded-full animate-spin" />
    </div>
  );

  const sidebarItems = [
    { label: 'Informations', icon: <User size={16} /> },
    { label: 'Mon Projet', icon: <Briefcase size={16} /> },
  ];

  const EditableField = ({ 
    fieldKey, 
    label, 
    readOnly = false 
  }: { 
    fieldKey: string; 
    label: string; 
    readOnly?: boolean 
  }) => {
    const isEditing = editingField === fieldKey;
    const value = readOnly
      ? (fieldKey === 'email' 
          ? user?.primaryEmailAddress?.emailAddress 
          : fieldKey === 'project_id' 
            ? enterprise?.project_id
            : fieldKey === 'package_type'
              ? enterprise?.package_type
              : fieldKey === 'status'
                ? enterprise?.status
                : fieldKey === 'created_at'
                  ? enterprise?.created_at 
                    ? new Date(enterprise.created_at)
                        .toLocaleDateString('fr-FR')
                    : '—'
                  : '—')
      : formData[fieldKey as keyof typeof formData];

    return (
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider 
                          text-black/40">
          {label}
        </label>
        <div className="relative group">
          <Input
            value={value || '—'}
            readOnly={readOnly || !isEditing}
            onChange={(e) => !readOnly && setFormData(prev => ({ 
              ...prev, 
              [fieldKey]: e.target.value 
            }))}
            className={`h-11 border-black/5 font-jakarta pr-10
              ${isEditing 
                ? 'bg-white border-blue-300 ring-1 ring-blue-200' 
                : 'bg-gray-50/30'
              }
              ${readOnly ? 'text-black/50 cursor-default' : ''}
            `}
          />
          {!readOnly && (
            <button
              onClick={() => setEditingField(isEditing ? null : fieldKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 
                         text-black/20 hover:text-black/60 transition-colors"
            >
              {isEditing 
                ? <X size={14} /> 
                : <Pencil size={14} />
              }
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8faff] text-black font-jakarta">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-bold">Mon Profil</h1>
          <button
            onClick={() => navigate('/client-space')}
            className="text-xs font-bold text-black/40 
                       hover:text-black transition-colors"
          >
            ← RETOUR AU DASHBOARD
          </button>
        </div>

        <div className="flex gap-12">

          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2 
                    text-sm font-medium rounded-md transition-all ${
                    activeTab === item.label
                      ? 'text-blue-600 bg-blue-50/50 shadow-sm'
                      : 'text-gray-500 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  <span className={activeTab === item.label 
                    ? 'text-blue-600' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">

            {/* TAB 1 — Informations */}
            {activeTab === 'Informations' && (
              <>
                <section className="bg-white rounded-xl border 
                  border-black/[0.03] shadow-sm p-8 space-y-8">
                  <h2 className="text-lg font-bold border-b pb-6">
                    Informations personnelles
                  </h2>

                  {/* Photo */}
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-full overflow-hidden 
                                    border border-black/5">
                      <img
                        src={user?.imageUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold">
                        {formData.full_name}
                      </p>
                      <p className="text-xs text-black/40 mt-0.5">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>

                  {/* Champs personnels */}
                  <div className="grid grid-cols-2 gap-8 pt-2">
                    <EditableField fieldKey="full_name" label="Nom complet" />
                    <EditableField fieldKey="email" label="Email" readOnly />
                    <EditableField fieldKey="phone" label="Téléphone" />
                    <EditableField fieldKey="company" label="Entreprise" />
                  </div>
                </section>

                {/* Mon Dossier fusionné ici */}
                <section className="bg-white rounded-xl border 
                  border-black/[0.03] shadow-sm p-8 space-y-8">
                  <h2 className="text-lg font-bold border-b pb-6">
                    Mon Dossier
                  </h2>
                  <div className="grid grid-cols-2 gap-8">
                    <EditableField 
                      fieldKey="project_id" label="Référence" readOnly />
                    <EditableField 
                      fieldKey="package_type" label="Package" readOnly />
                    <EditableField 
                      fieldKey="status" label="Statut" readOnly />
                    <EditableField 
                      fieldKey="created_at" label="Inscription" readOnly />
                  </div>
                </section>

                {/* Bouton Sauvegarder */}
                <div className="flex items-center justify-end gap-4">
                  {saved && (
                    <span className="flex items-center gap-2 text-green-600 
                                     text-sm font-medium">
                      <Check size={16} /> Modifications sauvegardées
                    </span>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black text-white hover:bg-black/80 
                               font-bold text-xs tracking-widest px-8 h-11"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 
                                      border-t-white rounded-full animate-spin" />
                    ) : 'SAUVEGARDER'}
                  </Button>
                </div>

                {/* Section Supprimer le compte */}
                <div className="pt-12 space-y-6">
                  <hr className="border-black/[0.05]" />
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="text-[10px] font-bold text-red-500/60 hover:text-red-500 
                                 border border-red-500/20 hover:border-red-500/40 
                                 px-4 py-2 rounded-lg transition-all uppercase tracking-widest"
                    >
                      Supprimer mon compte
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2 — Mon Projet */}
            {activeTab === 'Mon Projet' && (
              <>
                <section className="bg-white rounded-xl border 
                  border-black/[0.03] shadow-sm p-8 space-y-8">
                  <h2 className="text-lg font-bold border-b pb-6">
                    Mon Projet
                  </h2>
                  <div className="grid grid-cols-2 gap-8">
                    <EditableField fieldKey="intention" label="Intention" />
                    <EditableField fieldKey="sector" label="Secteur" />
                  </div>
                </section>

                {/* Bouton Sauvegarder */}
                <div className="flex items-center justify-end gap-4">
                  {saved && (
                    <span className="flex items-center gap-2 text-green-600 
                                     text-sm font-medium">
                      <Check size={16} /> Modifications sauvegardées
                    </span>
                  )}
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-black text-white hover:bg-black/80 
                               font-bold text-xs tracking-widest px-8 h-11"
                  >
                    {saving ? (
                      <div className="w-4 h-4 border-2 border-white/30 
                                      border-t-white rounded-full animate-spin" />
                    ) : 'SAUVEGARDER'}
                  </Button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* Modal de Confirmation de Suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4">Confirmation finale</h2>
            <p className="text-sm text-black/60 leading-relaxed mb-6">
              Êtes-vous sûr de vouloir supprimer votre compte ? Tapez <span className="font-bold text-black">CONFIRMER</span> ci-dessous pour continuer.
            </p>
            
            <div className="space-y-4">
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Tapez CONFIRMER"
                className="h-12 border-black/10 focus:border-red-500 focus:ring-red-500/10 font-jakarta"
              />
              
              <p className="text-[11px] font-bold text-red-500 flex items-center gap-2">
                <span>⚠</span> Cette action est irréversible.
              </p>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmText('');
                  }}
                  className="flex-1 h-12 font-bold text-xs tracking-widest border-black/5 hover:bg-gray-50"
                >
                  RETOUR
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={confirmText !== 'CONFIRMER' || isDeleting}
                  className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-xs tracking-widest"
                >
                  {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'SUPPRIMER'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


