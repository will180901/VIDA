'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationPanel from './NotificationPanel';

/**
 * Bouton de notification avec badge animé
 * 
 * Fonctionnalités :
 * - Badge avec count des notifications non lues
 * - Animation pulse si unread > 0
 * - Changement de couleur (gris → rouge)
 * - Clic → Ouvre le NotificationPanel
 */
export default function NotificationButton() {
  const { unreadCount } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const hasUnread = unreadCount > 0;

  return (
    <>
      {/* Bouton de notification */}
      <motion.button
        type="button"
        onClick={() => setIsPanelOpen(true)}
        className="relative p-2 rounded-full transition-all duration-200 hover:bg-vida-teal/10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={`Notifications${hasUnread ? ` (${unreadCount} non lues)` : ''}`}
      >
        {/* Icône cloche */}
        <Bell
          className={`h-5 w-5 transition-colors duration-200 ${
            hasUnread ? 'text-red-500' : 'text-gray-600'
          }`}
        />

        {/* Badge avec count */}
        <AnimatePresence>
          {hasUnread && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Panel de notifications */}
      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />

      {/* Animation pulse CSS */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  );
}
