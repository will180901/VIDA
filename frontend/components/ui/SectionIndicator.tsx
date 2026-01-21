'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface Section {
  id: string;
  label: string;
}

const SECTIONS: Section[] = [
  { id: 'hero', label: 'Accueil' },
  { id: 'services', label: 'Services' },
  { id: 'a-propos', label: 'À propos' },
  { id: 'pourquoi-vida', label: 'Pourquoi VIDA' },
  { id: 'cta', label: 'Contact' },
];

export default function SectionIndicator() {
  const [state, setState] = useState({ activeSection: 'hero', isVisible: false });
  const rafRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  const handleScroll = useCallback(() => {
    // Throttle à 60fps max
    const now = performance.now();
    if (now - lastUpdateRef.current < 16) return;
    lastUpdateRef.current = now;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    rafRef.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const isVisible = scrollY > 200;
      const scrollPosition = scrollY + window.innerHeight / 3;

      let activeSection = 'hero';
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const section = document.getElementById(SECTIONS[i].id);
        if (section && scrollPosition >= section.offsetTop) {
          activeSection = SECTIONS[i].id;
          break;
        }
      }

      setState(prev => {
        if (prev.activeSection === activeSection && prev.isVisible === isVisible) {
          return prev; // Pas de changement = pas de re-render
        }
        return { activeSection, isVisible };
      });
    });
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <nav
      className={`fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-3 transition-all duration-300 ${
        state.isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-5'
      }`}
    >
      <div className="absolute left-1/2 -translate-x-1/2 h-full w-px bg-gray-300/40" />

      {SECTIONS.map((section) => {
        const isActive = state.activeSection === section.id;
        return (
          <button
            key={section.id}
            onClick={() => scrollToSection(section.id)}
            className="group relative flex items-center cursor-pointer"
            aria-label={`Aller à ${section.label}`}
          >
            <span className="absolute right-8 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-sm font-medium text-text-primary bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded shadow-md">
              {section.label}
            </span>

            <div className="relative flex items-center justify-center">
              {isActive && (
                <>
                  <div className="absolute w-6 h-6 rounded-full border-2 border-vida-accent/50" />
                  <div className="absolute w-6 h-6 rounded-full border-2 border-vida-accent indicator-ping" />
                </>
              )}

              <div
                className={`relative z-10 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'w-3 h-3 bg-vida-accent shadow-[0_0_10px_rgba(249,115,22,0.6)]'
                    : 'w-2 h-2 bg-gray-400 group-hover:bg-gray-500 group-hover:scale-125'
                }`}
              />
            </div>
          </button>
        );
      })}
    </nav>
  );
}
