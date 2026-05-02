export const ROSEHILL_DEMO_HTML = `
<!DOCTYPE html>
<html lang="fr text-white">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <style>
        body { background-color: #121212; color: white; margin: 0; padding: 0; overflow-x: hidden; }
        .text-stroke { -webkit-text-stroke: 1px rgba(255,255,255,0.3); color: transparent; }
        .img-container { background-color: #1a1a1a; overflow: hidden; }
        .showcase-frame { position: relative; }
        .showcase-overlay { position: absolute; inset: 0; padding: 2rem; display: flex; flex-direction: column; justify-content: space-between; background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8)); }
        .glass-panel { background: rgba(255,255,255,0.03); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); border-radius: 4px; }
        .loader { position: fixed; inset: 0; background: #121212; z-index: 1000; display: flex; align-items: center; justify-content: center; transition: opacity 0.8s ease; }
        .loader-text { font-family: 'Cormorant Garamond', serif; font-size: 2rem; opacity: 0; transform: translateY(20px); }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #121212; }
        ::-webkit-scrollbar-thumb { background: #C5A059; border-radius: 4px; }
        html { scroll-behavior: smooth; }
    </style>
    <script>
      window.tailwindConfig = {
        theme: {
          extend: {
            colors: {
              brand: {
                gold: "#C5A059",
                dark: "#121212",
                gray: "#2A2A2A",
                light: "#F5F5F0",
              },
            },
            fontFamily: {
              serif: ['"Cormorant Garamond"', "serif"],
              sans: ['"Montserrat"', "sans-serif"],
            },
          },
        },
      };
      // Apply config
      tailwind.config = window.tailwindConfig;
    </script>
</head>
<body>
<div class="loader" id="pageLoader">
  <div class="loader-text" id="loaderText">ROSEHILL</div>
</div>

<nav class="fixed w-full z-50 transition-all duration-500 px-6 py-4" id="navbar">
  <div class="max-w-7xl mx-auto flex justify-between items-center">
    <a href="#" class="text-2xl font-serif font-bold tracking-wider text-white">
      RH<span class="text-brand-gold">.</span>
    </a>

    <div class="hidden md:flex space-x-10 text-[10px] font-sans tracking-[0.3em] uppercase">
      <a href="#" class="hover:text-brand-gold transition-colors">Home</a>
      <a href="#" class="hover:text-brand-gold transition-colors">Philosophy</a>
      <a href="#" class="hover:text-brand-gold transition-colors">Tools</a>
      <a href="#" class="hover:text-brand-gold transition-colors">Work</a>
    </div>

    <a href="#" class="hidden md:block px-6 py-2 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-black transition-all duration-300 font-sans text-[10px] tracking-widest uppercase">
      Prendre RDV
    </a>
  </div>
</nav>

<header class="relative w-full h-screen flex items-center justify-center overflow-hidden">
  <div class="absolute inset-0">
    <div class="absolute inset-0 bg-black/50 z-10"></div>
    <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop" class="w-full h-full object-cover" id="heroImg" />
  </div>

  <div class="relative z-20 text-center px-4 max-w-5xl mx-auto">
    <p class="text-brand-gold font-sans text-xs tracking-[0.4em] uppercase mb-6 opacity-0 translate-y-4 reveal">
      Esthétique et Performance
    </p>

    <h1 class="text-6xl md:text-8xl lg:text-9xl font-serif font-light text-white mb-8 leading-none opacity-0 translate-y-10 reveal">
      Des outils <span class="italic text-brand-gold">web</span><br />d'exception
    </h1>

    <div class="flex flex-col sm:flex-row gap-6 justify-center opacity-0 translate-y-4 reveal">
      <a href="#" class="px-10 py-4 bg-brand-gold text-black font-sans text-xs tracking-widest uppercase hover:bg-white transition-colors duration-500">
        Nos Solutions
      </a>
      <a href="#" class="px-10 py-4 border border-white/20 text-white font-sans text-xs tracking-widest uppercase hover:border-brand-gold hover:text-brand-gold transition-all duration-500">
        Le Manifeste
      </a>
    </div>
  </div>

  <div class="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-40">
    <div class="w-[1px] h-16 bg-gradient-to-b from-brand-gold to-transparent"></div>
  </div>
</header>

<section class="py-32 bg-brand-dark px-6">
  <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
    <div>
      <h2 class="text-5xl md:text-7xl font-serif text-white mb-10 leading-tight">
        L'art de la <br /><span class="text-stroke italic">conversion</span>
      </h2>
      <p class="text-gray-400 font-sans font-light leading-relaxed text-lg mb-12 max-w-md">
        Nous créonsen des interfaces qui ne se contentent pas d'être belles. Elles sont conçues pour captiver et convertir chaque visiteur en client fidèle.
      </p>
      <div class="flex items-center gap-6">
        <div class="w-12 h-[1px] bg-brand-gold"></div>
        <span class="text-brand-gold font-sans text-[10px] tracking-[0.3em] uppercase">Découvrez notre approche</span>
      </div>
    </div>
    
    <div class="relative group">
      <div class="absolute -inset-4 border border-brand-gold/20 scale-95 group-hover:scale-100 transition-transform duration-700"></div>
      <div class="aspect-[4/5] bg-brand-gray overflow-hidden">
        <img src="https://images.unsplash.com/photo-1600607687940-4e524cb35a33?q=80&w=1000&auto=format&fit=crop" class="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-1000" />
      </div>
    </div>
  </div>
</section>

<script>
    // Simple loader & Animations
    document.addEventListener('DOMContentLoaded', () => {
        const loader = document.getElementById('pageLoader');
        const loaderText = document.getElementById('loaderText');
        const navbar = document.getElementById('navbar');
        
        // Loader sequence
        setTimeout(() => {
            if(loaderText) loaderText.style.opacity = '1';
            if(loaderText) loaderText.style.transform = 'translateY(0)';
        }, 100);
        
        setTimeout(() => {
            if(loader) loader.style.opacity = '0';
            setTimeout(() => { if(loader) loader.style.display = 'none'; }, 800);
            
            // Reveal header elements
            const reveals = document.querySelectorAll('.reveal');
            reveals.forEach((el, i) => {
                setTimeout(() => {
                    el.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, i * 150 + 200);
            });
        }, 1200);

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('bg-brand-dark/90', 'backdrop-blur-xl', 'py-3', 'border-b', 'border-white/5');
            } else {
                navbar.classList.remove('bg-brand-dark/90', 'backdrop-blur-xl', 'py-3', 'border-b', 'border-white/5');
            }
        });

        // GSAP Scroll Parallax
        if (typeof gsap !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            
            gsap.to('#heroImg', {
                scrollTrigger: {
                    trigger: 'header',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true
                },
                y: 150,
                scale: 1.2
            });
        }
    });
</script>
</body>
</html>
`;
