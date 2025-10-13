import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: string;
  userId: string;
  type: 'opportunity_update' | 'placement_success' | 'application_status';
  title: string;
  message: string;
  opportunityId?: string;
  isRead: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!profileData) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const { data, error: supabaseError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (supabaseError) throw supabaseError;

      const notificationsData: Notification[] = (data || []).map(notif => ({
        id: notif.id,
        userId: notif.user_id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        opportunityId: notif.opportunity_id,
        isRead: notif.is_read,
        createdAt: notif.created_at
      }));

      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (supabaseError) throw supabaseError;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (!profileData) return;

      const { error: supabaseError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profileData.id)
        .eq('is_read', false);

      if (supabaseError) throw supabaseError;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (supabaseError) throw supabaseError;

      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();

      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications'
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};
