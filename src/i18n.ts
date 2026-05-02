import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "nav": {
        "services": "Services",
        "pricing": "Pricing",
        "contact": "Contact",
        "blog": "Blog"
      },
      "hero": {
        "badge": "Automate Smarter. Grow Faster.",
        "title": "Automate Smarter. Grow Faster.",
        "subtitle": "Everything you need to collaborate, create, and scale, all in one place.",
        "cta": "Book A Free Call"
      },
      "services": {
        "badge": "Services",
        "title": "Smarter Services,",
        "subtitle": "Everything you need to automate operations, boost productivity"
      },
      "benefits": {
        "badge": "Benefits",
        "title": "Why Choose",
        "subtitle": "Everything you need to automate, optimize, and scale"
      }
    }
  },
  fr: {
    translation: {
      "nav": {
        "services": "Services",
        "pricing": "Tarifs",
        "contact": "Contact",
        "blog": "Blog"
      },
      "hero": {
        "badge": "Automatisez plus intelligemment. Progressez plus vite.",
        "title": "Automatisez plus intelligemment. Progressez plus vite.",
        "subtitle": "Tout ce dont vous avez besoin pour collaborer, créer et évoluer, au même endroit.",
        "cta": "Réserver un appel gratuit"
      },
      "services": {
        "badge": "Services",
        "title": "Services Intelligents,",
        "subtitle": "Tout ce dont vous avez besoin pour automatiser vos opérations et booster votre productivité"
      },
      "benefits": {
        "badge": "Avantages",
        "title": "Pourquoi nous choisir",
        "subtitle": "Tout ce dont vous avez besoin pour automatiser, optimiser et évoluer"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
