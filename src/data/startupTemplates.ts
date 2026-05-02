import { supabase } from '../lib/supabaseClient';

export interface Template {
  id: string;
  title: string;
  author: string;
  category: string;
  sector: string;
  likes: string;
  views: string;
  image: string;
  preview_url?: string;
  description: string;
  longDescription: string;
  subCategories: string[];
  styles: string[];
  features: { title: string; description: string; }[];
  pages: string[];
}

export async function getStartupTemplates(): Promise<Template[]> {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('package_type', 'STARTUP')
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
