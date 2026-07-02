import { useDebounce } from '@/hooks/useDebounce';
import { useSocketEvent } from '@/hooks/SocketContext';
import { fetchAPI } from '@/services/api';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Notification } from '../types';
import { useSession } from 'next-auth/react';

interface UseNotificationsOptions {
  isSystem?: boolean;
  limit?: number;
}

export function useNotifications({ isSystem = false, limit = 10 }: UseNotificationsOptions = {}) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Reset page on search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchNotifications = useCallback(async (page: number, type: string, search: string) => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      let url = `/infra/notifications?limit=${limit}&offset=${offset}`;
      if (type && type !== 'ALL') {
        url += `&type=${type}`;
      }
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const headers = isSystem ? { 'x-store-id': '' } : undefined;
      const data = await fetchAPI(url, headers ? { headers } : undefined);

      if (data.success && data.data) {
        setNotifications(data.data.notifications || []);
        setTotal(data.data.total || 0);
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (error) {
      console.error(isSystem ? 'Failed to fetch system notifications:' : 'Failed to fetch notifications:', error);
      toast.error(isSystem ? 'Failed to load system notifications' : 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [isSystem, limit]);

  useEffect(() => {
    if (session) {
      fetchNotifications(currentPage, activeTab, debouncedSearch);
    }
  }, [session, currentPage, activeTab, debouncedSearch, fetchNotifications]);

  // Handle incoming real-time notifications
  useSocketEvent('notification', (newNotif: any) => {
    const matchesTab = activeTab === 'ALL' || newNotif.type === activeTab;
    const matchesSearch = !debouncedSearch ||
      newNotif.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      newNotif.message.toLowerCase().includes(debouncedSearch.toLowerCase());

    if (matchesTab && matchesSearch) {
      setNotifications((prev) => [newNotif, ...prev.slice(0, limit - 1)]);
      setTotal((prev) => prev + 1);
    }
    setUnreadCount((prev) => prev + 1);
  });

  const markAllAsRead = async () => {
    try {
      const headers = isSystem ? { 'x-store-id': '' } : undefined;
      await fetchAPI('/infra/notifications/read-all', {
        method: 'PATCH',
        ...(headers ? { headers } : {}),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success(isSystem ? 'All platform notifications marked as read' : 'All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = async (notif: Notification, onRedirect?: (link?: string) => void) => {
    if (!notif.isRead) {
      try {
        const headers = isSystem ? { 'x-store-id': '' } : undefined;
        await fetchAPI(`/infra/notifications/${notif.id}/read`, {
          method: 'PATCH',
          ...(headers ? { headers } : {}),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }

    if (onRedirect) {
      onRedirect(notif.link);
    } else if (notif.link) {
      window.location.href = notif.link;
    }
  };

  const totalPages = Math.ceil(total / limit);

  return {
    notifications,
    loading,
    total,
    unreadCount,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    currentPage,
    setCurrentPage,
    totalPages,
    markAllAsRead,
    handleNotificationClick,
  };
}
