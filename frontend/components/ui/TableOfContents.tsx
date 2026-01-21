'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface TocSection {
  id: string;
  title: string;
  level: number;
}

interface TableOfContentsProps {
  sections: TocSection[];
  alwaysExpanded?: boolean;
}

export default function TableOfContents({ sections, alwaysExpanded = false }: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(alwaysExpanded);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
      }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sections]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100; // Hauteur du header fixe + marge
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const activeIndex = sections.findIndex((s) => s.id === activeSection);
  const progress = sections.length > 0 ? ((activeIndex + 1) / sections.length) * 100 : 0;

  return (
    <motion.div
      className="relative"
      onMouseEnter={() => !alwaysExpanded && setIsExpanded(true)}
      onMouseLeave={() => !alwaysExpanded && setIsExpanded(false)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        {/* Conteneur */}
        <motion.div
          className="vida-grain bg-white/80 backdrop-blur-xl border border-white/60 rounded-lg shadow-vida-3 p-4"
          animate={{
            width: alwaysExpanded || isExpanded ? '260px' : '48px',
            borderRadius: alwaysExpanded || isExpanded ? '8px' : '24px',
          }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {!isExpanded && !alwaysExpanded ? (
              <motion.div
                key="compact"
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Cercle de progression */}
                <div className="relative w-6 h-6">
                  <svg className="transform -rotate-90 w-6 h-6">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 10}`}
                      strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
                      className="text-gray-900 transition-all duration-300"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-gray-900">
                      {activeIndex + 1}
                    </span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="expanded"
                className="max-h-[70vh] overflow-y-auto custom-scrollbar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-200/50">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Sommaire
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="font-medium text-gray-900">
                      {activeIndex + 1}
                    </span>
                    <span>/</span>
                    <span>{sections.length}</span>
                  </div>
                </div>

                {/* Sections */}
                <nav className="space-y-1">
                  {sections.map((section, index) => {
                    const isActive = section.id === activeSection;
                    const isPassed = index < activeIndex;

                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full text-left flex items-start gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 group ${
                          isActive
                            ? 'bg-gray-900/10 text-gray-900'
                            : isPassed
                            ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                        style={{
                          paddingLeft: `${section.level * 12 + 8}px`,
                        }}
                      >
                        <ChevronRight
                          className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 transition-transform ${
                            isActive ? 'rotate-90' : ''
                          }`}
                        />
                        <span className="text-xs font-medium leading-tight">
                          {section.title}
                        </span>
                      </button>
                    );
                  })}
                </nav>

                {/* Progress bar */}
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-gray-700 to-gray-900 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5 text-center">
                    {Math.round(progress)}% complété
                  </p>
                </div>

                {/* Bouton Retour à l'accueil */}
                <div className="mt-3 pt-3 border-t border-gray-200/50">
                  <a
                    href="/"
                    className="flex items-center justify-center gap-2 text-xs text-gray-600 hover:text-vida-teal font-medium transition-colors py-2"
                  >
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                    Retour à l'accueil
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
