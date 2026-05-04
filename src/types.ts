
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
  features: {
    title: string;
    description: string;
  }[];
  pages: string[];
  price: number;
}
