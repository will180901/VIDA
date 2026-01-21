'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
}

export default function Dropdown({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Sélectionner...',
  className,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Trouver l'option sélectionnée
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label || placeholder;

  // Calculer la position du bouton quand le dropdown s'ouvre
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      {/* Bouton du dropdown */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 py-2 px-3 text-xs rounded-md transition-all cursor-pointer',
          'bg-white border border-gray-200 shadow-sm',
          'hover:border-gray-300 hover:shadow-md',
          'focus:outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal',
          isOpen && 'border-vida-teal ring-1 ring-vida-teal/30',
          className
        )}
      >
        {/* Icône à gauche */}
        {icon && <div className="flex-shrink-0 text-gray-400">{icon}</div>}

        {/* Label sélectionné */}
        <span className="text-gray-700 font-medium select-none whitespace-nowrap">
          {selectedLabel}
        </span>

        {/* Flèche */}
        <svg
          className={cn(
            'h-3 w-3 text-gray-400 flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M6 9L1 4h10z" />
        </svg>
      </button>

      {/* Liste déroulante - Rendu dans un portal pour éviter les problèmes d'overflow */}
      {isOpen && buttonRect && typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed z-[9999]"
              style={{
                top: `${buttonRect.bottom + window.scrollY + 8}px`,
                left: `${buttonRect.left + window.scrollX}px`,
                minWidth: `${buttonRect.width}px`,
              }}
            >
              {/* Flèche décorative en haut */}
              <div className="absolute -top-1.5 left-6 w-3 h-3 rotate-45 bg-white/90 backdrop-blur-md border-l border-t border-white/40 z-10" />

              {/* Contenu du dropdown - Effet verre dépoli */}
              <div className="relative bg-white/90 backdrop-blur-md border border-white/40 rounded-lg shadow-2xl overflow-hidden">
                <div className="py-1">
                  {options.map((option) => {
                    const isSelected = option.value === value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                          'w-full flex items-center justify-between gap-3 px-4 py-2 text-xs transition-all',
                          'hover:bg-white/60 hover:text-vida-teal hover:backdrop-blur-lg',
                          isSelected
                            ? 'bg-vida-teal/10 text-vida-teal font-semibold'
                            : 'text-gray-700'
                        )}
                      >
                        <span className="whitespace-nowrap">{option.label}</span>
                        {isSelected && (
                          <Check className="h-3.5 w-3.5 text-vida-teal flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
