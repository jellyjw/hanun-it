'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { loginWithCredentials, signupWithCredentials } from '@/app/auth/login/actions';
import { useToast } from '@/hooks/use-toast';

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// 비밀번호 강도 계산 함수
const calculatePasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
};

const getPasswordStrengthLabel = (score: number) => {
  if (score <= 2) return { label: '약함', color: 'bg-red-500' };
  if (score <= 4) return { label: '보통', color: 'bg-yellow-500' };
  return { label: '강함', color: 'bg-green-500' };
};

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onChange',
  });

  const signupForm = useForm<SignupFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const onLoginSubmit = (data: LoginFormData) => {
    setError(null);

    startTransition(async () => {
      try {
        const result = await loginWithCredentials(data);
        if (result.success) {
          toast({
            title: '로그인 완료',
            description: '로그인에 성공했습니다.',
            variant: 'success',
          });
          router.push('/articles');
        } else {
          setError(result.error || '로그인에 실패했습니다.');
        }
      } catch {
        setError('로그인 중 오류가 발생했습니다.');
      }
    });
  };

  const onSignupSubmit = (data: SignupFormData) => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await signupWithCredentials(data);
        if (result.success) {
          setError(null);
          toast({
            title: '회원가입 완료',
            description: '회원가입이 완료되었습니다! 이메일을 확인해주세요.',
            variant: 'success',
          });
          setIsLogin(true);
          signupForm.reset();
        } else {
          setError(result.error || '회원가입에 실패했습니다.');
        }
      } catch {
        setError('회원가입 중 오류가 발생했습니다.');
      }
    });
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    loginForm.reset();
    signupForm.reset();
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  // 이메일 유효성 검사
  const emailValidation = {
    required: '이메일을 입력해주세요',
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: '올바른 이메일 형식을 입력해주세요',
    },
  };

  // 비밀번호 유효성 검사
  const passwordValidation = {
    required: '비밀번호를 입력해주세요',
    minLength: {
      value: 6,
      message: '비밀번호는 최소 6자 이상이어야 합니다',
    },
    validate: {
      hasLowerCase: (value: string) => /[a-z]/.test(value) || '영문 소문자를 포함해야 합니다',
      hasUpperCase: (value: string) => /[A-Z]/.test(value) || '영문 대문자를 포함해야 합니다',
      hasNumber: (value: string) => /\d/.test(value) || '숫자를 포함해야 합니다',
    },
  };

  // 현재 비밀번호 강도 계산 (회원가입 시에만)
  const currentPassword = signupForm.watch('password');
  const passwordStrength = !isLogin && currentPassword ? calculatePasswordStrength(currentPassword) : 0;
  const strengthInfo = getPasswordStrengthLabel(passwordStrength);

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-primary/10 rounded-full mb-4">
          <User className="w-6 h-6 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">{isLogin ? '로그인' : '회원가입'}</CardTitle>
        <CardDescription>
          {isLogin ? '계정에 로그인하여 서비스를 이용하세요' : '새 계정을 만들어 서비스를 시작하세요'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md mb-6 text-sm flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-destructive flex-shrink-0" />
            {error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className={`pl-10 transition-colors ${
                    loginForm.formState.errors.email
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'focus-visible:ring-primary'
                  }`}
                  {...loginForm.register('email', emailValidation)}
                />
                {loginForm.formState.isValid && loginForm.watch('email') && !loginForm.formState.errors.email && (
                  <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  className={`pl-10 pr-10 transition-colors ${
                    loginForm.formState.errors.password
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'focus-visible:ring-primary'
                  }`}
                  {...loginForm.register('password', {
                    required: '비밀번호를 입력해주세요',
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full transition-all duration-200"
              disabled={isPending || !loginForm.formState.isValid}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-email">이메일</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  className={`pl-10 transition-colors ${
                    signupForm.formState.errors.email
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'focus-visible:ring-primary'
                  }`}
                  {...signupForm.register('email', emailValidation)}
                />
                {!signupForm.formState.errors.email && signupForm.watch('email') && (
                  <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                )}
              </div>
              {signupForm.formState.errors.email && (
                <p className="text-sm text-destructive">{signupForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">비밀번호</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 입력하세요"
                  className={`pl-10 pr-10 transition-colors ${
                    signupForm.formState.errors.password
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'focus-visible:ring-primary'
                  }`}
                  {...signupForm.register('password', passwordValidation)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              {/* 비밀번호 강도 표시기 */}
              {currentPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">비밀번호 강도:</span>
                    <span
                      className={`font-medium ${
                        strengthInfo.color === 'bg-red-500'
                          ? 'text-red-500'
                          : strengthInfo.color === 'bg-yellow-500'
                            ? 'text-yellow-500'
                            : 'text-green-500'
                      }`}>
                      {strengthInfo.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${strengthInfo.color}`}
                      style={{ width: `${(passwordStrength / 6) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {signupForm.formState.errors.password && (
                <p className="text-sm text-destructive">{signupForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">비밀번호 확인</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력하세요"
                  className={`pl-10 pr-10 transition-colors ${
                    signupForm.formState.errors.confirmPassword
                      ? 'border-destructive focus-visible:ring-destructive'
                      : 'focus-visible:ring-primary'
                  }`}
                  {...signupForm.register('confirmPassword', {
                    required: '비밀번호 확인을 입력해주세요',
                    validate: (value) => value === signupForm.watch('password') || '비밀번호가 일치하지 않습니다',
                  })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                {!signupForm.formState.errors.confirmPassword &&
                  signupForm.watch('confirmPassword') &&
                  signupForm.watch('confirmPassword') === signupForm.watch('password') && (
                    <CheckCircle className="absolute right-10 top-3 h-4 w-4 text-green-500" />
                  )}
              </div>
              {signupForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{signupForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full transition-all duration-200"
              disabled={isPending || !signupForm.formState.isValid}>
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  회원가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Button
            variant="link"
            onClick={toggleMode}
            className="text-sm hover:text-primary transition-colors"
            disabled={isPending}>
            {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
