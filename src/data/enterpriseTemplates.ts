import { supabase } from '../lib/supabaseClient';
import { Template } from './startupTemplates';

export async function getEnterpriseTemplates(): Promise<Template[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('package_type', 'ENTERPRISE')
    .eq('is_published', true)
    .order('sector', { ascending: true });

  if (error || !data) return [];

  return data.map((t) => ({
    id: t.id,
    title: t.title,
    author: t.author,
    category: t.category,
    sector: t.sector,
    likes: t.likes,
    views: t.views,
    image: t.image_url,
    preview_url: t.preview_url,
    description: t.description,
    longDescription: t.long_description,
    subCategories: t.sub_categories || [],
    styles: t.styles || [],
    features: t.features || [],
    pages: t.pages || [],
  }));
}
