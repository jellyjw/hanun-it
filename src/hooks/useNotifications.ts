import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const EMPTY_RESPONSE: NotificationsResponse = {
  success: true,
  notifications: [],
  unreadCount: 0,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
};

export function useNotifications(page = 1, limit = 20) {
  return useQuery<NotificationsResponse>({
    queryKey: ['notifications', page, limit],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?page=${page}&limit=${limit}`);
      if (!res.ok) return EMPTY_RESPONSE;
      return res.json();
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useUnreadCount() {
  return useQuery<number>({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: async () => {
      const res = await fetch('/api/notifications?page=1&limit=1');
      if (!res.ok) return 0;
      const data = await res.json();
      return data.unreadCount || 0;
    },
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('읽음 처리에 실패했습니다.');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('알림 삭제에 실패했습니다.');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
