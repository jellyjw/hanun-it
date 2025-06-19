import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onClick?: () => void;
  className?: string;
}

export function CategoryCard({
  title,
  description,
  icon: Icon,
  badgeText,
  badgeVariant = 'secondary',
  onClick,
  className = '',
}: CategoryCardProps) {
  return (
    <Card
      className={`group cursor-pointer border border-gray-200 bg-gradient-to-br from-white to-gray-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 p-3 transition-all duration-300 group-hover:from-purple-200 group-hover:to-purple-300">
              <Icon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 transition-colors duration-300 group-hover:text-purple-700">
                {title}
              </h3>
            </div>
          </div>
          {badgeText && (
            <Badge variant={badgeVariant} className="text-xs">
              {badgeText}
            </Badge>
          )}
        </div>
        <p className="text-sm leading-relaxed text-gray-600 transition-colors duration-300 group-hover:text-gray-700">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

interface CategorySectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function CategorySection({ title, children, className = '' }: CategorySectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="mb-6 px-2 text-xl font-bold text-gray-900">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
