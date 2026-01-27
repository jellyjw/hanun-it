'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function PasswordChangeForm() {
  const { isSocialLogin } = useAuth();
  const { toast } = useToast();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getPasswordStrength = (password: string) => {
    if (!password) return { level: 0, text: '', color: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, text: '약함', color: 'bg-red-400' };
    if (score <= 3) return { level: 2, text: '보통', color: 'bg-amber-400' };
    if (score <= 4) return { level: 3, text: '강함', color: 'bg-emerald-400' };
    return { level: 4, text: '매우 강함', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  async function handleChangePassword() {
    if (!newPassword || !confirmPassword) {
      toast({ title: '새 비밀번호를 입력해주세요.', variant: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: '새 비밀번호가 일치하지 않습니다.', variant: 'error' });
      return;
    }

    if (newPassword.length < 8) {
      toast({ title: '비밀번호는 최소 8자 이상이어야 합니다.', variant: 'error' });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/users/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (!data.success) {
        toast({ title: data.error || '비밀번호 변경에 실패했습니다.', variant: 'error' });
        return;
      }

      toast({ title: '비밀번호가 변경되었습니다.', variant: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('비밀번호 변경 오류:', error);
      toast({ title: '비밀번호 변경 중 오류가 발생했습니다.', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  if (isSocialLogin) {
    return (
      <Card>
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold">비밀번호 변경</h3>
          <p className="text-muted-foreground mt-1.5 text-sm">소셜 로그인 계정은 비밀번호를 변경할 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold">비밀번호 변경</h3>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-muted-foreground text-xs">
              새 비밀번호
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8자 이상"
                className="pr-14 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:text-foreground">
                {showNewPassword ? '숨기기' : '보기'}
              </button>
            </div>
            {newPassword && (
              <div className="flex items-center gap-2 pt-1">
                <div className="flex flex-1 gap-0.5">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`h-0.5 flex-1 rounded-full transition-colors ${
                        level <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-muted-foreground text-[11px]">{passwordStrength.text}</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-muted-foreground text-xs">
              비밀번호 확인
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="비밀번호 확인"
                className="pr-14 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 text-xs hover:text-foreground">
                {showConfirmPassword ? '숨기기' : '보기'}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-[11px] text-red-500">비밀번호가 일치하지 않습니다.</p>
            )}
          </div>

          <p className="text-muted-foreground text-[11px]">대문자, 소문자, 숫자를 포함해주세요.</p>

          <Button
            onClick={handleChangePassword}
            disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            size="sm"
            className="w-full">
            {loading ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
