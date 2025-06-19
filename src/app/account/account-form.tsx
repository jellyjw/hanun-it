'use client';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { type User } from '@supabase/supabase-js';
import Avatar from './avatar';
import { useToast } from '@/hooks/use-toast';

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [fullname, setFullname] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [website, setWebsite] = useState<string | null>(null);
  const [avatar_url, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const getProfile = useCallback(async () => {
    try {
      setLoading(true);

      if (user) {
        // auth.users 테이블에서 직접 사용자 정보 가져오기
        const userData = user.user_metadata || {};

        setFullname(userData.full_name || user.email?.split('@')[0] || null);
        setUsername(userData.username || user.email?.split('@')[0] || null);
        setWebsite(userData.website || null);
        setAvatarUrl(userData.avatar_url || null);
      }
    } catch (error) {
      console.error('사용자 데이터 로드 오류:', error);
      toast({
        title: '사용자 데이터를 불러오는 중 오류가 발생했습니다!',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    getProfile();
  }, [user, getProfile]);

  async function updateProfile({
    username,
    fullname,
    website,
    avatar_url,
  }: {
    username: string | null;
    fullname: string | null;
    website: string | null;
    avatar_url: string | null;
  }) {
    try {
      setLoading(true);

      // auth.users 테이블의 user_metadata 업데이트
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullname,
          username,
          website,
          avatar_url,
          updated_at: new Date().toISOString(),
        },
      });

      if (error) throw error;
      toast({
        title: '프로필이 업데이트되었습니다!',
        variant: 'success',
      });
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      toast({
        title: '프로필 업데이트 중 오류가 발생했습니다!',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="form-widget">
      <Avatar
        uid={user?.id ?? null}
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          setAvatarUrl(url);
          updateProfile({ fullname, username, website, avatar_url: url });
        }}
      />

      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={user?.email} disabled />
      </div>
      <div>
        <label htmlFor="fullName">Full Name</label>
        <input id="fullName" type="text" value={fullname || ''} onChange={(e) => setFullname(e.target.value)} />
      </div>
      <div>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" value={username || ''} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label htmlFor="website">Website</label>
        <input id="website" type="url" value={website || ''} onChange={(e) => setWebsite(e.target.value)} />
      </div>

      <div>
        <button
          className="button primary block"
          onClick={() => updateProfile({ fullname, username, website, avatar_url })}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <form action="/auth/signout" method="post">
          <button className="button block" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
