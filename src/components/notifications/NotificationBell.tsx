'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications, useUnreadCount } from '@/hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/utils/supabase/client';
import NotificationDropdown from './NotificationDropdown';

interface NotificationBellProps {
  userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: unreadCount } = useUnreadCount();
  const { data: notificationsData } = useNotifications(1, 10);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Supabase Realtime 구독
  const handleRealtimeInsert = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }, [queryClient]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        handleRealtimeInsert,
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, handleRealtimeInsert]);

  const displayCount = unreadCount || 0;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
        aria-label="알림"
      >
        <Bell className="h-5 w-5" />
        {displayCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {displayCount > 99 ? '99+' : displayCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notificationsData?.notifications || []}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
