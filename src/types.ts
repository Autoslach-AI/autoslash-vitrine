
export interface Template {
  id: string;
  title: string;
  author: string;
  category: string;
  likes: string;
  views: string;
  image: string;
  description: string;
  longDescription: string;
  subCategories: string[];
  styles: string[];
  features: {
    title: string;
    description: string;
  }[];
  pages: string[];
}
