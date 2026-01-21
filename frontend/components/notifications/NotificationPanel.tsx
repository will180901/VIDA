'use client';

import { useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { Z_INDEX } from '@/lib/zIndex';
import NotificationItem from './NotificationItem';
import NotificationGroupSkeleton from './skeletons/NotificationGroupSkeleton';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Panel de notifications (modal côté droit)
 * 
 * Fonctionnalités :
 * - Animation slide-in depuis la droite
 * - Fond glassmorphism (verre poli transparent)
 * - Ombre flottante
 * - Liste des notifications groupées par date
 * - Actions : Marquer lu, Supprimer, Tout marquer lu
 * - Bouton fermer (X)
 */
export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAllAsRead,
    deleteAllRead,
  } = useNotifications();

  // Récupérer les notifications quand le panel s'ouvre
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Grouper les notifications par date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {
      "Aujourd'hui": [],
      "Hier": [],
      "Cette semaine": [],
      "Plus ancien": [],
    };

    notifications.forEach(notif => {
      const group = notif.date_group;
      if (groups[group]) {
        groups[group].push(notif);
      }
    });

    // Retourner uniquement les groupes non vides
    return Object.entries(groups).filter(([_, notifs]) => notifs.length > 0);
  }, [notifications]);

  // Ne rien rendre si pas monté côté client
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            style={{ zIndex: Z_INDEX.BACKDROP }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-white/90 backdrop-blur-xl shadow-2xl flex flex-col"
            style={{ zIndex: Z_INDEX.MODAL }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-200/50 bg-white/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-vida-teal" />
                  <h2 className="text-base font-bold text-gray-900">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>

              {/* Actions */}
              {notifications.length > 0 && (
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-vida-teal bg-vida-teal/10 hover:bg-vida-teal/20 rounded-md transition-colors"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      Tout marquer lu
                    </button>
                  )}
                  <button
                    onClick={deleteAllRead}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Supprimer lues
                  </button>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {isLoading && notifications.length === 0 ? (
                // Loading state avec skeletons
                <>
                  <NotificationGroupSkeleton count={3} />
                  <NotificationGroupSkeleton count={2} />
                </>
              ) : notifications.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Bell className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-sm font-medium">Aucune notification</p>
                  <p className="text-xs text-gray-400 mt-1">Vous êtes à jour !</p>
                </div>
              ) : (
                // Notifications groupées par date
                groupedNotifications.map(([group, notifs]) => (
                  <div key={group}>
                    <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      {group}
                    </h3>
                    <div className="space-y-2">
                      {notifs.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onClose={onClose}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
