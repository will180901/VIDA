'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { useHeroSlides } from '@/hooks/useCMS';
import { HeroSlide as CMSHeroSlide } from '@/types/cms';
import { getMediaUrl } from '@/lib/media';

const STATIC_SLIDES = [
  {
    id: 1,
    title: 'Votre Vue Mérite une Attention Sérieuse',
    subtitle: 'Centre ophtalmologique moderne à Brazzaville. Équipement professionnel, soins de qualité.',
    image: '/images/hero/hero-1-vision.jpg',
    order: 1,
  },
  {
    id: 2,
    title: 'Examens Complets et Diagnostics Précis',
    subtitle: 'Dépistage des maladies oculaires. Équipements adaptés pour des résultats fiables.',
    image: '/images/hero/hero-2-technology.png',
    order: 2,
  },
  {
    id: 3,
    title: 'Une Équipe à Votre Écoute',
    subtitle: 'Ophtalmologues qualifiés et personnel attentionné. Nous prenons le temps de vous expliquer.',
    image: '/images/hero/hero-3-team.png',
    order: 3,
  },
  {
    id: 4,
    title: 'Prenez Rendez-vous Facilement',
    subtitle: 'En ligne, par téléphone ou WhatsApp. Nous sommes là pour vous accompagner.',
    image: '/images/hero/hero-4-appointment.png',
    order: 4,
  },
];

export default function HeroSlider() {
  const { data: cmsSlides, isLoading } = useHeroSlides();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isVisibleRef = useRef(true);
  const loadedImages = useRef<Set<string>>(new Set());

  const slides = useMemo(() => {
    if (cmsSlides && cmsSlides.length > 0) {
      return cmsSlides;
    }
    return STATIC_SLIDES as unknown as CMSHeroSlide[];
  }, [cmsSlides]);

  const SLIDE_DURATION = 8000;
  const TICK_INTERVAL = 100;

  // Précharger images
  useEffect(() => {
    if (!slides.length) return;
    
    slides.forEach((slide, index) => {
      const img = new window.Image();
      img.src = getMediaUrl(slide.image);
      img.onload = () => {
        loadedImages.current.add(getMediaUrl(slide.image));
        if (index === 0) setIsReady(true);
      };
    });
  }, [slides]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setProgress(0);
    
    setTimeout(() => {
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 600);
    }, 300);
  }, [isTransitioning]);

  // Timer progression
  useEffect(() => {
    if (!isReady || slides.length === 0) return;

    const handleVisibility = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibility);

    const timer = setInterval(() => {
      if (!isVisibleRef.current || isTransitioning) return;

      setProgress(prev => {
        const next = prev + (100 / (SLIDE_DURATION / TICK_INTERVAL));
        if (next >= 100) {
          goToSlide((currentIndex + 1) % slides.length);
          return 0;
        }
        return next;
      });
    }, TICK_INTERVAL);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isReady, currentIndex, isTransitioning, goToSlide, slides.length]);

  if (isLoading && !isReady) {
    return <div className="h-full w-full bg-vida-teal/10 animate-pulse" />;
  }

  const currentSlide = slides[currentIndex];
  if (!currentSlide) return null;

  return (
    <section className="relative h-full w-full overflow-hidden">
      {/* Images - CSS transitions */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentIndex && isReady ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src={getMediaUrl(slide.image)}
              alt={slide.title}
              fill
              priority={index === 0}
              loading={index === 0 ? 'eager' : 'lazy'}
              className={`
                object-cover
                object-center
                ${index === currentIndex ? 'hero-ken-burns' : ''}
              `}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
              quality={90}
            />
          </div>
        </div>
      ))}

      {/* Overlay gradient - Adapté responsive */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none hidden md:block"
        style={{
          background: `
            linear-gradient(
              to right,
              rgba(13, 92, 99, 0.95) 0%,
              rgba(13, 92, 99, 0.75) 40%,
              rgba(13, 92, 99, 0.4) 70%,
              transparent 100%
            )
          `
        }}
      />
      {/* Overlay mobile - Gradient vertical léger pour voir l'image */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none md:hidden"
        style={{
          background: `
            linear-gradient(
              to bottom,
              rgba(13, 92, 99, 0.1) 0%,
              rgba(13, 92, 99, 0.3) 40%,
              rgba(13, 92, 99, 0.7) 70%,
              rgba(13, 92, 99, 0.92) 100%
            )
          `
        }}
      />
      <div className="vida-grain absolute inset-0 z-20 pointer-events-none opacity-30" />

      {/* Eye Scanner - Slide 1 (Défini par l'ID 1 du CMS ou statique) */}
      {currentSlide.id === 1 && (
        <div className="absolute z-25 pointer-events-none hidden md:block" style={{ right: '5%', top: '25%' }}>
          <svg width="320" height="320" viewBox="0 0 280 280" className="lg:w-[380px] lg:h-[380px] scanner-rotate">
            <circle cx="140" cy="140" r="130" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.5" />
            <circle cx="140" cy="140" r="100" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <line x1="140" y1="5" x2="140" y2="30" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
            <line x1="125" y1="10" x2="155" y2="10" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
            <line x1="140" y1="250" x2="140" y2="275" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
            <line x1="125" y1="270" x2="155" y2="270" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
            <line x1="5" y1="140" x2="30" y2="140" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
            <line x1="10" y1="125" x2="10" y2="155" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
            <line x1="250" y1="140" x2="275" y2="140" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
            <line x1="270" y1="125" x2="270" y2="155" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
            <path d="M 140 15 A 125 125 0 0 1 265 140" fill="none" stroke="rgba(249,115,22,0.8)" strokeWidth="4" strokeLinecap="round" />
            <path d="M 140 265 A 125 125 0 0 1 15 140" fill="none" stroke="rgba(249,115,22,0.8)" strokeWidth="4" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Contenu texte - Adapté responsive */}
      <div className="absolute z-30 left-6 right-6 md:left-16 md:right-auto lg:left-24 bottom-20 md:top-1/2 md:-translate-y-1/2 md:bottom-auto max-w-full md:max-w-lg lg:max-w-xl">
        <div
          key={currentSlide.id}
          className={`space-y-3 md:space-y-4 lg:space-y-5 hero-content-animate ${isReady && !isTransitioning ? 'visible' : ''}`}
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white font-hero leading-tight">
            {currentSlide.title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 md:text-white/85 font-body leading-relaxed">
            {currentSlide.subtitle}
          </p>
        </div>
      </div>

      {/* Navigation dots - Adapté responsive */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/50 to-transparent md:from-black/40">
        <div className="flex justify-center px-6 md:px-16 lg:px-24 pb-4 md:pb-6">
          <div className="flex gap-1.5 md:gap-2">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className="group relative w-8 h-8 md:w-10 md:h-10 flex items-center justify-center cursor-pointer"
                aria-label={`Aller au slide ${index + 1}`}
              >
                <div className="relative">
                  {/* Dot */}
                  <div
                    className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'bg-white scale-125'
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                  {/* Progress ring pour le slide actif */}
                  {index === currentIndex && (
                    <svg
                      className="absolute -inset-1.5 md:-inset-2 w-5 h-5 md:w-6 md:h-6 -rotate-90"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="rgba(249, 115, 22, 0.3)"
                        strokeWidth="2"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        fill="none"
                        stroke="rgba(249, 115, 22, 0.9)"
                        strokeWidth="2"
                        strokeDasharray="62.83"
                        strokeDashoffset={62.83 - (62.83 * progress) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-100 ease-linear"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
