import { supabase } from './supabaseClient';
import { OnboardingData } from '../pages/onboarding';

export async function completeOnboarding(
  clerkUserId: string, 
  data: OnboardingData,
  sessionId: string
) {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  
  // Détection région automatique — système mondial
  let region = null;
  try {
    const geoRes = await fetch('https://ipapi.co/json/');
    const geo = await geoRes.json();
    region = geo.country_name || null;
  } catch {
    region = null;
  }

  // 1. Update user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: clerkUserId,
      email: data.email,
      phone: data.phone || null,
      full_name: fullName,
      company: data.company || null,
      sector: data.sector,
      intention: data.intention,
      package_interest: data.recommendedPackage,
      onboarding_session_id: sessionId,
      onboarding_completed: true,
      first_time: false,
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('Error updating user profile:', profileError);
    throw profileError;
  }

  // 2. Create enterprise lead (prospect)
  // Vérifier si un prospect existe déjà
  const { data: existing } = await supabase
    .from('enterprises')
    .select('id')
    .eq('email', data.email)
    .eq('status', 'PROSPECT')
    .maybeSingle();

  if (!existing) {
    const { error: enterpriseError } = await supabase
      .from('enterprises')
      .insert({
        name: data.company || fullName,
        email: data.email,
        phone: data.phone || null,
        sector: data.sector,
        message: `${data.intention} | ${data.need}`,
        package_type: data.recommendedPackage,
        status: 'PROSPECT',
        is_test: false,
        region: region,
        onboarding_session_id: sessionId
      });

    if (enterpriseError) {
      console.error('Error creating enterprise lead:', enterpriseError);
    }
  }

  return { success: true };
}

export async function checkOnboardingStatus(
  clerkUserId: string
) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('onboarding_completed')
      .eq('id', clerkUserId)
      .maybeSingle();

    if (error) {
      console.error('checkOnboarding error:', error);
      return false;
    }

    // Si pas de profil → pas encore onboardé
    if (!data) return false;

    // NULL ou false → pas onboardé
    return data.onboarding_completed === true;
  } catch {
    return false;
  }
}
