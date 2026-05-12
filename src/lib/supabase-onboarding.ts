import { supabase } from './supabaseClient';
import { OnboardingData } from '../pages/onboarding';

export async function completeOnboarding(clerkUserId: string, data: OnboardingData) {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  
  // 1. Update user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: clerkUserId,
      email: data.email,
      full_name: fullName,
      company: data.company || null,
      sector: data.sector,
      intention: data.intention,
      package_interest: data.recommendedPackage,
      onboarding_completed: true,
      created_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('Error updating user profile:', profileError);
    throw profileError;
  }

  // 2. Create enterprise lead (prospect)
  const { error: enterpriseError } = await supabase
    .from('enterprises')
    .insert({
      name: data.company || fullName,
      contact_name: fullName,
      email: data.email,
      phone: null,
      sector: data.sector,
      message: `${data.intention} | ${data.need}`,
      package_type: data.recommendedPackage,
      status: 'PROSPECT',
      is_test: false,
      region: ''
    });

  if (enterpriseError) {
    console.error('Error creating enterprise lead:', enterpriseError);
    // We don't throw here if profile was updated, but ideally this is atomical.
    // In Supabase we could use an RPC for atomicity if needed.
  }

  return { success: true };
}

export async function checkOnboardingStatus(clerkUserId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('id', clerkUserId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error('Error checking onboarding status:', error);
    return false;
  }

  return data?.onboarding_completed || false;
}
