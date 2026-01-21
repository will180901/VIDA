'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '@/lib/api';

/**
 * Interface pour une notification
 */
export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  icon: string;
  color: string;
  action_url: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  time_ago: string;
  date_group: string;
  related_appointment: number | null;
  patient_name: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
}

/**
 * Interface pour le contexte des notifications
 */
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isPolling: boolean;
  fetchNotifications: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  markAsUnread: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  deleteAllRead: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * Provider pour le contexte des notifications
 * 
 * Fonctionnalités :
 * - Récupération des notifications
 * - Polling automatique toutes les 30s (quand connecté)
 * - Count des notifications non lues
 * - Actions : marquer lu, supprimer, etc.
 */
export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  /**
   * Récupérer les notifications de l'utilisateur
   */
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const response = await api.get('/notifications/');
      setNotifications(response.data.results || response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Récupérer le count des notifications non lues
   */
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get('/notifications/count/');
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Erreur lors de la récupération du count:', error);
    }
  }, [isAuthenticated]);

  /**
   * Marquer une notification comme lue
   */
  const markAsRead = useCallback(async (id: number) => {
    try {
      await api.post(`/notifications/${id}/mark-as-read/`);
      
      // Mettre à jour l'état local
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true, read_at: new Date().toISOString() } : notif
        )
      );
      
      // Mettre à jour le count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  }, []);

  /**
   * Marquer une notification comme non lue
   */
  const markAsUnread = useCallback(async (id: number) => {
    try {
      await api.post(`/notifications/${id}/mark-as-unread/`);
      
      // Mettre à jour l'état local
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: false, read_at: null } : notif
        )
      );
      
      // Mettre à jour le count
      setUnreadCount(prev => prev + 1);
    } catch (error) {
      console.error('Erreur lors du marquage comme non lu:', error);
    }
  }, []);

  /**
   * Marquer toutes les notifications comme lues
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/mark-all-as-read/');
      
      // Mettre à jour l'état local
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      );
      
      // Réinitialiser le count
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors du marquage de toutes comme lues:', error);
    }
  }, []);

  /**
   * Supprimer une notification
   */
  const deleteNotification = useCallback(async (id: number) => {
    try {
      await api.delete(`/notifications/${id}/`);
      
      // Mettre à jour l'état local
      const notif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      // Mettre à jour le count si la notification était non lue
      if (notif && !notif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  }, [notifications]);

  /**
   * Supprimer toutes les notifications lues
   */
  const deleteAllRead = useCallback(async () => {
    try {
      await api.delete('/notifications/delete-all-read/');
      
      // Mettre à jour l'état local
      setNotifications(prev => prev.filter(notif => !notif.is_read));
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les lues:', error);
    }
  }, []);

  /**
   * Démarrer le polling automatique
   */
  const startPolling = useCallback(() => {
    if (pollingInterval || !isAuthenticated) return;

    setIsPolling(true);
    
    // Polling toutes les 30 secondes
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    setPollingInterval(interval);
  }, [pollingInterval, isAuthenticated, fetchUnreadCount]);

  /**
   * Arrêter le polling automatique
   */
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
      setIsPolling(false);
    }
  }, [pollingInterval]);

  /**
   * Démarrer le polling quand l'utilisateur est connecté
   */
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      startPolling();
    } else {
      stopPolling();
      setNotifications([]);
      setUnreadCount(0);
    }

    return () => {
      stopPolling();
    };
  }, [isAuthenticated, fetchUnreadCount, startPolling, stopPolling]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isPolling,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        deleteNotification,
        deleteAllRead,
        startPolling,
        stopPolling,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook pour accéder au contexte des notifications
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
}
