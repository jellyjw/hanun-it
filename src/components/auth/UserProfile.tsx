"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

export default function UserProfile() {
  const { user, loading, signOut, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button asChild>
        <a href="/auth/login">로그인</a>
      </Button>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        {user?.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="프로필"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        )}
        <span className="text-sm font-medium">
          {user?.user_metadata?.full_name ||
            user?.user_metadata?.name ||
            user?.email?.split("@")[0] ||
            "사용자"}
        </span>
      </div>

      <Button
        onClick={signOut}
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
      >
        <LogOut className="w-4 h-4" />
        <span>로그아웃</span>
      </Button>
    </div>
  );
}
