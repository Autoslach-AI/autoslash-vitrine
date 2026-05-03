import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('SUPABASE URL:', supabaseUrl);
console.log('ANON KEY exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variables Supabase manquantes: ' + 
    'URL=' + supabaseUrl + ' KEY=' + !!supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Generates a project ID based on the package type and current count.
 * For true production, this would be better handled by a DB function to avoid race conditions.
 */
export const generateProjectId = async (packageType: string) => {
  if (!supabase) return 'TEMP_000';
  
  const prefixMap: Record<string, string> = {
    'STARTUP': 'S',
    'BUSINESS': 'B',
    'ENTERPRISE': 'E',
    'ELITE': 'EL'
  };
  
  const prefix = prefixMap[packageType] || 'P';
  
  const { count, error } = await supabase
    .from('enterprises')
    .select('*', { count: 'exact', head: true })
    .eq('package_type', packageType);
    
  if (error) {
    console.warn('Error fetching count for project ID, generating with timestamp');
    return `${prefix}_${Date.now().toString().slice(-4)}`;
  }
  
  const nextId = (count || 0) + 1;
  return `${prefix}_${nextId.toString().padStart(3, '0')}`;
};

export const saveOrder = async (orderData: {
  name: string;
  package_type: 'STARTUP' | 'BUSINESS' | 'ENTERPRISE' | 'ELITE';
  sector?: string;
  template_name?: string;
  email: string;
  phone?: string;
  message?: string;
  comm_mode?: string;
  region?: string;
  template_id?: string | null;
  status?: string;
  is_test?: boolean;
}) => {
  if (!supabase) {
    console.log('Supabase not configured, simulating success:', orderData);
    return { data: null, error: null };
  }

  try {
    const projectId = await generateProjectId(orderData.package_type);
    
    // 1. Insert into enterprises (Unified Lead Table)
    const { data: enterprise, error: entError } = await supabase
      .from('enterprises')
      .insert([{
        name: orderData.name,
        package_type: orderData.package_type,
        sector: orderData.sector || 'Général',
        client_status: orderData.status || 'PROSPECT',
        project_id: projectId,
        comm_mode: orderData.comm_mode || 'WHATSAPP',
        region: orderData.region || 'Dakar',
        email: orderData.email,
        phone: orderData.phone,
        notes: orderData.message,
        template_id: orderData.template_id,
        is_test: orderData.is_test ?? false
      }])
      .select()
      .single();

    if (entError) throw entError;

    // 2. Insert into admin_intelligence_logs
    const { error: logError } = await supabase
      .from('admin_intelligence_logs')
      .insert([{
        client_id: enterprise.id,
        issue_type: 'NEW_PROSPECT',
        severity_level: 'INFO',
        raw_context: `NOUVEAU PROSPECT — ${orderData.sector || 'Inconnue'} — ${orderData.name} — ${orderData.package_type}`
      }]);

    if (logError) console.warn('Logging error:', logError);

    return { data: enterprise, error: null };
  } catch (error: any) {
    console.error('Unified save error:', error);
    return { data: null, error };
  }
};
