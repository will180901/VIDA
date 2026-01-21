'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { WifiOff, ServerCrash, AlertTriangle, RefreshCw, Home } from 'lucide-react';

type ErrorType = 'network' | 'server' | 'unknown';

function getErrorType(error: Error): ErrorType {
  const message = error.message.toLowerCase();
  if (message.includes('network') || message.includes('fetch') || message.includes('connection') || message.includes('offline')) {
    return 'network';
  }
  if (message.includes('server') || message.includes('500') || message.includes('503')) {
    return 'server';
  }
  return 'unknown';
}

const errorConfig = {
  network: {
    icon: WifiOff,
    title: 'Connexion perdue',
    description: 'Vérifiez votre connexion internet et réessayez.',
  },
  server: {
    icon: ServerCrash,
    title: 'Erreur serveur',
    description: 'Nos serveurs rencontrent un problème. Réessayez dans quelques instants.',
  },
  unknown: {
    icon: AlertTriangle,
    title: 'Une erreur est survenue',
    description: 'Quelque chose s\'est mal passé. Veuillez réessayer.',
  },
};

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const [errorType, setErrorType] = useState<ErrorType>('unknown');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setErrorType(getErrorType(error));
    setTimeout(() => setIsVisible(true), 100);
  }, [error]);

  const config = errorConfig[errorType];
  const Icon = config.icon;

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center relative overflow-hidden">
      {/* Cercles décoratifs subtils */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-vida-teal/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-vida-teal/5 rounded-full blur-3xl" />
      
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
            <Icon className="w-7 h-7 text-vida-teal" strokeWidth={1.5} />
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-lg font-semibold text-text-primary font-heading mb-2">
          {config.title}
        </h1>

        {/* Description */}
        <p className="text-sm text-text-secondary font-body mb-8 max-w-xs mx-auto">
          {config.description}
        </p>

        {/* Boutons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-vida-teal rounded-lg hover:bg-vida-teal-dark transition-colors duration-150"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-text-secondary bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-text-primary transition-colors duration-150"
          >
            <Home className="w-3.5 h-3.5" />
            Accueil
          </Link>
        </div>

        {/* Code d'erreur discret */}
        {error && (
          <p className="mt-8 text-[10px] text-text-secondary/50 font-mono">
            {error.name}: {error.message.slice(0, 50)}{error.message.length > 50 ? '...' : ''}
          </p>
        )}
      </div>
    </div>
  );
}
