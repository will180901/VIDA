'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Calendar, 
  Mail, 
  Phone, 
  Printer, 
  BarChart3,
  Archive
} from 'lucide-react';

interface PatientActionMenuProps {
  onViewDetails?: () => void;
  onEdit?: () => void;
  onCreateAppointment?: () => void;
  onSendEmail?: () => void;
  onCall?: () => void;
  onPrint?: () => void;
  onViewStats?: () => void;
  onArchive?: () => void;
}

export default function PatientActionMenu({
  onViewDetails,
  onEdit,
  onCreateAppointment,
  onSendEmail,
  onCall,
  onPrint,
  onViewStats,
  onArchive,
}: PatientActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleAction = (action: (() => void) | undefined) => {
    if (action) {
      action();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 text-gray-600 hover:text-vida-teal hover:bg-vida-teal/5 rounded transition-colors"
        aria-label="Actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-[#F5F5F0] rounded-lg shadow-lg border border-gray-200 py-1 z-50 vida-grain"
          >
            {/* Flèche décorative */}
            <div className="absolute -top-1 right-2 w-2 h-2 bg-[#F5F5F0] border-l border-t border-gray-200 transform rotate-45" />

            {onViewDetails && (
              <button
                onClick={() => handleAction(onViewDetails)}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-white/80 hover:text-vida-teal transition-colors"
              >
                <Eye className="h-4 w-4" />
                <span>Voir dossier complet</span>
              </button>
            )}

            {onEdit && (
              <button
                onClick={() => handleAction(onEdit)}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-white/80 hover:text-vida-teal transition-colors"
              >
                <Edit className="h-4 w-4" />
                <span>Modifier informations</span>
              </button>
            )}

            {onCreateAppointment && (
              <button
                onClick={() => handleAction(onCreateAppointment)}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-white/80 hover:text-vida-teal transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Créer rendez-vous</span>
              </button>
            )}

            {onSendEmail && (
              <button
                onClick={() => handleAction(onSendEmail)}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-white/80 hover:text-vida-teal transition-colors"
              >
                <Mail className="h-4 w-4" />
                <span>Envoyer email</span>
              </button>
            )}

            {onCall && (
              <button
                onClick={() => handleAction(onCall)}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-white/80 hover:text-vida-teal transition-colors"
              >
                <Phone className="h-4 w-4" />
                <span>Appeler</span>
              </button>
            )}

            {onPrint && (
              <button
                onClick={() => handleAction(onPrint)}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-white/80 hover:text-vida-teal transition-colors"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimer fiche</span>
              </button>
            )}

            {onViewStats && (
              <button
                onClick={() => handleAction(onViewStats)}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-white/80 hover:text-vida-teal transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Voir statistiques</span>
              </button>
            )}

            {onArchive && (
              <>
                <div className="my-1 border-t border-gray-300" />
                <button
                  onClick={() => handleAction(onArchive)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Archive className="h-4 w-4" />
                  <span>Archiver patient</span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
