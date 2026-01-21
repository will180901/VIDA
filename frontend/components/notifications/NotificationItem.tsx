'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  CalendarPlus,
  CheckCircle,
  XCircle,
  CalendarX,
  CalendarClock,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Bell,
  Info,
  Eye,
  Trash2,
} from 'lucide-react';
import { useNotifications, Notification } from '@/contexts/NotificationContext';

interface NotificationItemProps {
  notification: Notification;
  onClose: () => void;
}

/**
 * Composant pour afficher une notification
 * 
 * Fonctionnalités :
 * - Icône colorée selon le type
 * - Titre + message
 * - Timestamp relatif (il y a 5 min)
 * - Badge "Nouveau" si unread
 * - Hover : Fond blanc/80 + actions (Voir, Supprimer)
 * - Clic → Marquer lu + Redirection
 */
export default function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const router = useRouter();
  const { markAsRead, deleteNotification } = useNotifications();
  const [isHovered, setIsHovered] = useState(false);

  // Map des icônes selon le type
  const iconMap: Record<string, React.ReactNode> = {
    new_appointment: <CalendarPlus className="h-4 w-4" />,
    appointment_confirmed: <CheckCircle className="h-4 w-4" />,
    appointment_rejected: <XCircle className="h-4 w-4" />,
    appointment_cancelled: <CalendarX className="h-4 w-4" />,
    appointment_modified: <CalendarClock className="h-4 w-4" />,
    counter_proposal: <MessageSquare className="h-4 w-4" />,
    proposal_accepted: <ThumbsUp className="h-4 w-4" />,
    proposal_rejected: <ThumbsDown className="h-4 w-4" />,
    appointment_reminder: <Bell className="h-4 w-4" />,
    system: <Info className="h-4 w-4" />,
  };

  // Map des couleurs selon le type
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  const icon = iconMap[notification.type] || <Bell className="h-4 w-4" />;
  const colorClass = colorMap[notification.color] || colorMap.gray;

  const handleClick = async () => {
    // Marquer comme lu si non lu
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Rediriger si URL d'action
    if (notification.action_url) {
      router.push(notification.action_url);
      onClose();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notification.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`relative p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
        notification.is_read
          ? 'bg-transparent border-gray-200 hover:bg-white/80'
          : 'bg-vida-teal/5 border-vida-teal/20 hover:bg-white/80'
      }`}
    >
      <div className="flex gap-3">
        {/* Icône */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
          {icon}
        </div>

        {/* Contenu */}
        <div className="flex-1 min-w-0">
          {/* Titre + Badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`text-xs font-semibold text-gray-900 ${!notification.is_read ? 'font-bold' : ''}`}>
              {notification.title}
            </h4>
            {!notification.is_read && (
              <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold text-white bg-vida-teal rounded-full">
                Nouveau
              </span>
            )}
          </div>

          {/* Message */}
          <p className="text-[11px] text-gray-700 mb-2 line-clamp-2">
            {notification.message}
          </p>

          {/* Infos RDV si disponibles */}
          {notification.patient_name && (
            <p className="text-[10px] text-gray-600 mb-1">
              <span className="font-medium">{notification.patient_name}</span>
              {notification.appointment_date && notification.appointment_time && (
                <span className="text-gray-500">
                  {' '}• {new Date(notification.appointment_date).toLocaleDateString('fr-FR')} à {notification.appointment_time}
                </span>
              )}
            </p>
          )}

          {/* Timestamp */}
          <p className="text-[10px] text-gray-500">
            {notification.time_ago}
          </p>
        </div>
      </div>

      {/* Actions au hover */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2 flex gap-1"
        >
          {notification.action_url && (
            <button
              onClick={handleClick}
              className="p-1.5 bg-vida-teal text-white rounded-md hover:bg-vida-teal/90 transition-colors"
              title="Voir"
            >
              <Eye className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
