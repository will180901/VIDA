'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';

interface ActionMenuProps {
  onViewDetails: () => void;
  onRespond?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onMarkCompleted?: () => void;
  onMarkNoShow?: () => void;
  showRespond?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showCancel?: boolean;
  showMarkCompleted?: boolean;
  showMarkNoShow?: boolean;
}

export default function ActionMenu({ 
  onViewDetails, 
  onRespond, 
  onEdit,
  onDelete,
  onCancel,
  onMarkCompleted,
  onMarkNoShow,
  showRespond = false,
  showEdit = false,
  showDelete = false,
  showCancel = false,
  showMarkCompleted = false,
  showMarkNoShow = false,
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Calculer la position du bouton quand le menu s'ouvre
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      setButtonRect(buttonRef.current.getBoundingClientRect());
    }
  }, [isOpen]);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
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

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Bouton trois points */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
        title="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {/* Menu déroulant - Rendu dans un portal */}
      {isOpen && buttonRect && typeof window !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="fixed z-[9999]"
              style={{
                top: `${buttonRect.bottom + window.scrollY + 8}px`,
                left: `${buttonRect.left + window.scrollX - 140}px`, // Poussé plus à gauche
                minWidth: '160px', // Largeur augmentée
              }}
            >
              {/* Flèche décorative en haut à droite */}
              <div className="absolute -top-1.5 right-3 w-3 h-3 rotate-45 bg-white/90 backdrop-blur-md border-l border-t border-white/40 z-10" />

              {/* Contenu du menu - Effet verre dépoli */}
              <div className="relative bg-white/90 backdrop-blur-md border border-white/40 rounded-lg shadow-2xl overflow-hidden">
                <div className="py-1.5">
                  {/* Voir les détails */}
                  <button
                    type="button"
                    onClick={() => handleAction(onViewDetails)}
                    className="w-full px-4 py-3 text-xs text-gray-700 hover:bg-white/60 hover:text-vida-teal transition-all text-left"
                  >
                    <span>Voir les détails</span>
                  </button>

                  {/* Modifier */}
                  {showEdit && onEdit && (
                    <button
                      type="button"
                      onClick={() => handleAction(onEdit)}
                      className="w-full px-4 py-3 text-xs text-gray-700 hover:bg-white/60 hover:text-amber-600 transition-all text-left"
                    >
                      <span>Modifier</span>
                    </button>
                  )}

                  {/* Répondre au rendez-vous */}
                  {showRespond && onRespond && (
                    <>
                      <div className="h-px bg-gray-200/50 my-1" />
                      <button
                        type="button"
                        onClick={() => handleAction(onRespond)}
                        className="w-full px-4 py-3 text-xs text-gray-700 hover:bg-white/60 hover:text-blue-600 transition-all text-left"
                      >
                        <span>Répondre au rendez-vous</span>
                      </button>
                    </>
                  )}

                  {/* Marquer comme terminé */}
                  {showMarkCompleted && onMarkCompleted && (
                    <button
                      type="button"
                      onClick={() => handleAction(onMarkCompleted)}
                      className="w-full px-4 py-3 text-xs text-gray-700 hover:bg-white/60 hover:text-green-600 transition-all text-left"
                    >
                      <span>Marquer comme terminé</span>
                    </button>
                  )}

                  {/* Marquer comme absent */}
                  {showMarkNoShow && onMarkNoShow && (
                    <button
                      type="button"
                      onClick={() => handleAction(onMarkNoShow)}
                      className="w-full px-4 py-3 text-xs text-gray-700 hover:bg-white/60 hover:text-gray-600 transition-all text-left"
                    >
                      <span>Marquer comme absent</span>
                    </button>
                  )}

                  {/* Annuler */}
                  {showCancel && onCancel && (
                    <>
                      <div className="h-px bg-gray-200/50 my-1" />
                      <button
                        type="button"
                        onClick={() => handleAction(onCancel)}
                        className="w-full px-4 py-3 text-xs text-orange-600 hover:bg-orange-50 transition-all text-left"
                      >
                        <span>Annuler le rendez-vous</span>
                      </button>
                    </>
                  )}

                  {/* Supprimer */}
                  {showDelete && onDelete && (
                    <>
                      <div className="h-px bg-gray-200/50 my-1" />
                      <button
                        type="button"
                        onClick={() => handleAction(onDelete)}
                        className="w-full px-4 py-3 text-xs text-red-600 hover:bg-red-50 transition-all text-left"
                      >
                        <span>Supprimer</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
