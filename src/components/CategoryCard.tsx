import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  onClick?: () => void;
  className?: string;
}

export function CategoryCard({
  title,
  description,
  icon: Icon,
  badgeText,
  badgeVariant = "secondary",
  onClick,
  className = "",
}: CategoryCardProps) {
  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 border border-gray-200 ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
              <Icon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
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
        <p className="text-sm text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
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

export function CategorySection({
  title,
  children,
  className = "",
}: CategorySectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-6 px-2">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
