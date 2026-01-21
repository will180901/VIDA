'use client';

import { useState, useEffect } from 'react';

export default function ScrollIndicator() {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Détecter si on est proche du bas de la page (100px de marge)
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const isNearBottom = scrollTop + windowHeight >= documentHeight - 100;
      setIsAtBottom(isNearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    if (isAtBottom) {
      // Remonter tout en haut
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Descendre tout en bas
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <button 
        onClick={handleClick}
        className="w-10 h-10 rounded-full bg-gray-900/5 backdrop-blur-sm border border-gray-900/10 flex items-center justify-center shadow-lg scroll-bounce cursor-pointer hover:bg-gray-900/10 transition-colors duration-150"
        aria-label={isAtBottom ? 'Remonter en haut' : 'Défiler vers le bas'}
      >
        <svg 
          className={`w-5 h-5 text-orange-500 scroll-glow transition-transform duration-300 ${isAtBottom ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="m7 6 5 5 5-5" />
          <path d="m7 13 5 5 5-5" />
        </svg>
      </button>
    </div>
  );
}
