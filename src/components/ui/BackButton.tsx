'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export default function BackButton({ className, variant = "outline", size = "default" }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <Button variant={variant} size={size} onClick={handleBack} className={`flex items-center gap-2 ${className || ''}`}>
      <ArrowLeft className="h-4 w-4" />
      목록 가기
    </Button>
  );
}