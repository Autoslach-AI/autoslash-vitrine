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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
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
    if (deleteConfirmText !== 'CONFIRMER') return;
    setDeleting(true);

    try {
      // 1. Supprimer toutes les données Supabase via fonction SQL
      const { error } = await supabase.rpc('delete_user_data', {
        p_user_id: user!.id,
        p_email: user!.primaryEmailAddress?.emailAddress,
      });

      if (error) {
        console.error('Supabase deletion error:', error);
        setDeleting(false);
        return;
      }

      // 2. Supprimer le compte Clerk
      await user!.delete();

      // 3. Rediriger vers accueil
      navigate('/');

    } catch (err) {
      console.error('Delete error:', err);
      setDeleting(false);
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm 
                        flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-8 w-full max-w-md 
                          space-y-6 border border-white/10 shadow-2xl">
            
            <div className="flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">
                Confirmation finale
              </h3>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="text-white/40 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-white/70 text-sm font-jakarta leading-relaxed">
              Êtes-vous sûr de vouloir supprimer votre compte ?
              Tapez <span className="text-white font-bold">CONFIRMER</span> 
              ci-dessous pour continuer.
            </p>

            <input
              type="text"
              placeholder="Tapez CONFIRMER"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-transparent 
                         border border-white/20 text-white font-jakarta 
                         text-sm outline-none focus:border-white/50 
                         transition-colors placeholder:text-white/20"
            />

            <p className="text-red-400 text-xs font-jakarta flex 
                          items-center gap-2">
              ⚠ Cette action est irréversible.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText('');
                }}
                className="flex-1 h-11 rounded-lg border border-white/20 
                           text-white/60 text-sm font-bold font-jakarta 
                           hover:bg-white/5 transition-all"
              >
                Retour
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'CONFIRMER' || deleting}
                className={`flex-1 h-11 rounded-lg text-sm font-bold 
                  font-jakarta transition-all
                  ${deleteConfirmText === 'CONFIRMER'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-red-500/20 text-red-400/40 cursor-not-allowed'
                  }`}
              >
                {deleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 
                                 border-t-white rounded-full animate-spin 
                                 mx-auto" />
                ) : 'Supprimer le compte'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}


