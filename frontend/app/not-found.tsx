'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, Home, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Cercles décoratifs subtils */}
      <div className="absolute top-1/3 -left-40 w-80 h-80 bg-vida-teal/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 -right-40 w-80 h-80 bg-vida-teal/5 rounded-full blur-3xl" />
      
      {/* Contenu principal */}
      <div 
        className={`relative z-10 text-center px-6 transition-all duration-700 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Icône avec animation */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-vida-teal/10 rounded-full blur-xl scale-150" />
          <div className="relative w-16 h-16 rounded-full bg-white shadow-vida-2 flex items-center justify-center">
            <Search className="w-7 h-7 text-vida-teal" strokeWidth={1.5} />
          </div>
        </div>

        {/* Code 404 discret */}
        <p className="text-xs font-medium text-vida-teal/60 tracking-widest mb-3">
          ERREUR 404
        </p>

        {/* Titre */}
        <h1 className="text-lg font-semibold text-text-primary font-heading mb-2">
          Page introuvable
        </h1>

        {/* Description */}
        <p className="text-sm text-text-secondary font-body mb-8 max-w-xs mx-auto">
          Cette page n'existe pas ou a été déplacée.
        </p>

        {/* Boutons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-secondary bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-text-primary transition-colors duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Retour
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-lg hover:bg-vida-teal-dark transition-colors duration-150"
          >
            <Home className="w-3.5 h-3.5" />
            Accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
