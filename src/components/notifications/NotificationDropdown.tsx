'use client';

import { useRouter } from 'next/navigation';
import { MessageSquare, Heart, Newspaper, Bell, Check, Trash2 } from 'lucide-react';
import { Notification, useMarkAsRead, useDeleteNotification } from '@/hooks/useNotifications';

interface NotificationDropdownProps {
  notifications: Notification[];
  onClose: () => void;
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'comment_reply':
    case 'new_comment':
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    case 'like':
      return <Heart className="h-4 w-4 text-red-500" />;
    case 'new_article':
      return <Newspaper className="h-4 w-4 text-emerald-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '방금 전';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  const months = Math.floor(days / 30);
  return `${months}개월 전`;
}

export default function NotificationDropdown({ notifications, onClose }: NotificationDropdownProps) {
  const router = useRouter();
  const markAsRead = useMarkAsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkAllAsRead = () => {
    markAsRead.mutate('all');
  };

  const handleClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.link) {
      router.push(notification.link);
    }
    onClose();
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg sm:w-96">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">알림</h3>
        <button
          onClick={handleMarkAllAsRead}
          className="flex items-center gap-1 text-xs text-emerald-600 transition-colors hover:text-emerald-700"
        >
          <Check className="h-3 w-3" />
          모두 읽음
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-400">알림이 없습니다.</div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`flex cursor-pointer items-start gap-3 border-b border-gray-50 px-4 py-3 transition-colors hover:bg-gray-50 ${
                !notification.is_read ? 'bg-emerald-50/50' : ''
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">{getNotificationIcon(notification.type)}</div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm ${!notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                  {notification.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500">{notification.message}</p>
                <p className="mt-1 text-xs text-gray-400">{timeAgo(notification.created_at)}</p>
              </div>
              <button
                onClick={(e) => handleDelete(e, notification.id)}
                className="mt-0.5 flex-shrink-0 rounded p-1 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
