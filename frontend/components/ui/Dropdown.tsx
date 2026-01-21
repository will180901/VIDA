'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';
import { useDropdownContext } from '@/contexts/DropdownContext';

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
  maxHeight?: number;
  searchable?: boolean;
  preferredDirection?: 'down' | 'up' | 'auto';
}

export default function Dropdown({
  value,
  onChange,
  options,
  icon,
  placeholder = 'Sélectionner...',
  className,
  maxHeight = 300,
  searchable = false,
  preferredDirection = 'auto',
}: DropdownProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsListRef = useRef<HTMLDivElement>(null);

  // Contexte global des dropdowns (un seul ouvert à la fois)
  const { openDropdownId, openDropdown, closeDropdown, registerDropdown } = useDropdownContext();
  
  // ID unique pour ce dropdown
  const dropdownId = useMemo(() => registerDropdown(), [registerDropdown]);
  
  // État d'ouverture basé sur le contexte global
  const isOpen = openDropdownId === dropdownId;

  // Utiliser le hook de positionnement intelligent
  const dropdownPosition = useDropdownPosition(buttonRef, isOpen, {
    maxHeight,
    offset: 8,
    preferredDirection,
    minSpaceRequired: 200,
  });

  // Trouver l'option sélectionnée
  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label || placeholder;

  // Filtrer les options selon la recherche
  const filteredOptions = searchable && searchQuery
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeDropdown]);

  // Focus sur le champ de recherche quand le dropdown s'ouvre
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, searchable]);

  // Scroll vers l'option sélectionnée quand le dropdown s'ouvre
  useEffect(() => {
    if (isOpen && optionsListRef.current && selectedOption) {
      const selectedIndex = filteredOptions.findIndex(
        (opt) => opt.value === selectedOption.value
      );
      if (selectedIndex !== -1) {
        const optionElement = optionsListRef.current.children[
          selectedIndex
        ] as HTMLElement;
        if (optionElement) {
          optionElement.scrollIntoView({ block: 'nearest' });
        }
      }
    }
  }, [isOpen, selectedOption, filteredOptions]);

  // Navigation clavier
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeDropdown();
          buttonRef.current?.focus();
          break;

        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;

        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;

        case 'Home':
          e.preventDefault();
          setHighlightedIndex(0);
          break;

        case 'End':
          e.preventDefault();
          setHighlightedIndex(filteredOptions.length - 1);
          break;

        default:
          // Recherche rapide par lettre (si pas de champ de recherche)
          if (!searchable && e.key.length === 1) {
            const char = e.key.toLowerCase();
            const index = filteredOptions.findIndex((opt) =>
              opt.label.toLowerCase().startsWith(char)
            );
            if (index !== -1) {
              setHighlightedIndex(index);
            }
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, highlightedIndex, filteredOptions, searchable]);

  // Scroll vers l'option surlignée
  useEffect(() => {
    if (highlightedIndex >= 0 && optionsListRef.current) {
      const optionElement = optionsListRef.current.children[
        highlightedIndex
      ] as HTMLElement;
      if (optionElement) {
        optionElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    closeDropdown();
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  const handleToggle = () => {
    if (isOpen) {
      closeDropdown();
    } else {
      openDropdown(dropdownId);
      // Réinitialiser la recherche et le highlight
      setSearchQuery('');
      const selectedIndex = filteredOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(selectedIndex);
    }
  };

  return (
    <>
      {/* Bouton du dropdown */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-2 py-2 px-3 text-xs rounded-md transition-all cursor-pointer',
          'bg-white border border-gray-200',
          'hover:border-gray-300',
          'focus:outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal',
          isOpen && 'border-vida-teal ring-1 ring-vida-teal/30',
          className
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Icône à gauche */}
        {icon && <div className="flex-shrink-0 text-gray-400">{icon}</div>}

        {/* Label sélectionné */}
        <span className="text-gray-700 font-medium select-none whitespace-nowrap">
          {selectedLabel}
        </span>

        {/* Flèche adaptative */}
        {dropdownPosition.direction === 'down' ? (
          <ChevronDown
            className={cn(
              'h-3 w-3 text-gray-400 flex-shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        ) : (
          <ChevronUp
            className={cn(
              'h-3 w-3 text-gray-400 flex-shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </button>

      {/* Liste déroulante - Rendu dans un portal pour éviter les problèmes d'overflow */}
      {isOpen && typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={dropdownRef}
              initial={{
                opacity: 0,
                y: dropdownPosition.direction === 'down' ? -10 : 10,
                scale: 0.95,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                y: dropdownPosition.direction === 'down' ? -10 : 10,
                scale: 0.95,
              }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed z-[9999]"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                minWidth: `${dropdownPosition.width}px`,
                zIndex: dropdownPosition.zIndex,
              }}
            >
              {/* Flèche décorative - Position adaptative et centrée sur le bouton */}
              <div
                className={cn(
                  'absolute w-3 h-3 rotate-45 bg-white/90 backdrop-blur-md border-white/40 z-10',
                  dropdownPosition.direction === 'down'
                    ? '-top-1.5 border-l border-t'
                    : '-bottom-1.5 border-r border-b'
                )}
                style={{
                  left: '20px', // Position fixe à gauche pour cohérence
                }}
              />

              {/* Contenu du dropdown - Effet verre dépoli */}
              <div className="relative bg-white/90 backdrop-blur-md border border-white/40 rounded-lg shadow-2xl overflow-hidden">
                {/* Champ de recherche */}
                {searchable && (
                  <div className="p-2 border-b border-gray-200">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setHighlightedIndex(0);
                      }}
                      placeholder="Rechercher..."
                      className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-md outline-none focus:ring-1 focus:ring-vida-teal/30 focus:border-vida-teal"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}

                {/* Liste des options avec scroll */}
                <div
                  ref={optionsListRef}
                  className="py-1 overflow-y-auto relative"
                  style={{
                    maxHeight: `${dropdownPosition.maxHeight}px`,
                  }}
                  role="listbox"
                >
                  {/* Fade gradient top (si scroll) */}
                  <div className="sticky top-0 h-4 bg-gradient-to-b from-white/90 to-transparent pointer-events-none z-10" />

                  {filteredOptions.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-gray-500 text-center">
                      Aucun résultat
                    </div>
                  ) : (
                    filteredOptions.map((option, index) => {
                      const isSelected = option.value === value;
                      const isHighlighted = index === highlightedIndex;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSelect(option.value)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={cn(
                            'w-full flex items-center justify-between gap-3 px-4 py-2 text-xs transition-all',
                            'hover:bg-white/60 hover:text-vida-teal hover:backdrop-blur-lg',
                            isSelected &&
                              'bg-vida-teal/10 text-vida-teal font-semibold',
                            isHighlighted &&
                              !isSelected &&
                              'bg-gray-100 text-gray-900'
                          )}
                          role="option"
                          aria-selected={isSelected}
                        >
                          <span className="whitespace-nowrap">{option.label}</span>
                          {isSelected && (
                            <Check className="h-3.5 w-3.5 text-vida-teal flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}

                  {/* Fade gradient bottom (si scroll) */}
                  <div className="sticky bottom-0 h-4 bg-gradient-to-t from-white/90 to-transparent pointer-events-none z-10" />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
