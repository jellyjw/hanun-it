import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Info, CheckCircle, AlertTriangle, AlertCircle, Flame } from 'lucide-react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        // 기본 variant들 (Heavy 스타일)
        default: 'border-transparent bg-gray-900 text-white shadow hover:bg-gray-800',
        info: 'border-transparent bg-blue-600 text-white shadow hover:bg-blue-700',
        success: 'border-transparent bg-green-700 text-white shadow hover:bg-green-800',
        warning: 'border-transparent bg-amber-700 text-white shadow hover:bg-amber-800',
        destructive: 'border-transparent bg-red-600 text-white shadow hover:bg-red-700',
        hot: 'border-transparent bg-red-500 text-white shadow hover:bg-red-600 animate-pulse',

        // Medium 스타일
        'info-medium': 'border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200',
        'success-medium': 'border-transparent bg-green-100 text-green-700 hover:bg-green-200',
        'warning-medium': 'border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200',
        'destructive-medium': 'border-transparent bg-red-100 text-red-700 hover:bg-red-200',
        'default-medium': 'border-transparent bg-gray-100 text-gray-700 hover:bg-gray-200',

        // Light 스타일
        'info-light': 'border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100',
        'success-light': 'border border-green-200 bg-green-50 text-green-600 hover:bg-green-100',
        'warning-light': 'border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100',
        'destructive-light': 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100',
        'default-light': 'border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100',

        // 기존 호환성을 위한 variant들
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'text-foreground',
      },
      size: {
        default: 'px-3 py-1.5 text-xs',
        sm: 'px-2 py-1 text-xs',
        lg: 'px-4 py-2 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const getIcon = (variant: string) => {
  if (variant?.includes('info')) return <Info className="mr-1.5 h-3 w-3" />;
  if (variant?.includes('success')) return <CheckCircle className="mr-1.5 h-3 w-3" />;
  if (variant?.includes('warning')) return <AlertTriangle className="mr-1.5 h-3 w-3" />;
  if (variant?.includes('destructive')) return <AlertCircle className="mr-1.5 h-3 w-3" />;
  if (variant === 'hot') return <Flame className="mr-1.5 h-3 w-3" />;
  return null;
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
  showIcon?: boolean;
}

function Badge({ className, variant, size, showIcon = true, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {showIcon && getIcon(variant || 'default')}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
