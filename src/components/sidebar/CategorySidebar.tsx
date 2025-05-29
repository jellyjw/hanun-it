"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  MapPin,
  TrendingUp,
  Calendar,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CategorySidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface CategoryStats {
  domestic: number;
  foreign: number;
  total: number;
  weekly: number;
}

export function CategorySidebar({
  selectedCategory,
  onCategoryChange,
  isOpen = true,
  onClose,
}: CategorySidebarProps) {
  const { data: stats } = useQuery<CategoryStats>({
    queryKey: ["category-stats"],
    queryFn: async () => {
      const response = await fetch("/api/articles/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  const categories = [
    {
      id: "all",
      label: "전체 아티클",
      icon: FileText,
      count: stats?.total || 0,
      description: "모든 아티클 보기",
    },
    {
      id: "domestic",
      label: "국내 아티클",
      icon: MapPin,
      count: stats?.domestic || 0,
      description: "한국 기업 및 개발자 블로그",
    },
    {
      id: "foreign",
      label: "해외 아티클",
      icon: Globe,
      count: stats?.foreign || 0,
      description: "해외 기술 블로그 및 미디어",
    },
    {
      id: "weekly",
      label: "주간 인기",
      icon: TrendingUp,
      count: stats?.weekly || 0,
      description: "조회수 기준 인기 아티클",
    },
  ];

  const handleCategoryClick = (categoryId: string) => {
    onCategoryChange(categoryId);
    // 모바일에서 카테고리 선택 후 사이드바 닫기
    if (onClose && window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* 사이드바 */}
      <div
        className={`
        fixed md:static top-0 left-0 h-full md:h-auto w-64 bg-background z-50 md:z-auto
        transform transition-transform duration-300 ease-in-out md:transform-none
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        space-y-4 p-4 md:p-0 overflow-y-auto
      `}
      >
        {/* 모바일 닫기 버튼 */}
        {onClose && (
          <div className="flex justify-end md:hidden mb-4">
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              카테고리
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 group ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-muted/50 border border-transparent hover:border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`}
                      />
                      <div
                        className={`font-medium text-sm ${isSelected ? "text-primary-foreground" : "text-foreground"}`}
                      >
                        {category.label}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isSelected ? "secondary" : "outline"}
                        className={`text-xs ${
                          isSelected
                            ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                            : ""
                        }`}
                      >
                        {category.count}
                      </Badge>
                      <ChevronRight
                        className={`w-3 h-3 transition-transform ${
                          isSelected
                            ? "rotate-90 text-primary-foreground"
                            : "text-muted-foreground group-hover:translate-x-1"
                        }`}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* 빠른 통계 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">통계</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">총 아티클</span>
              <Badge variant="outline">{stats?.total || 0}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">국내</span>
              <Badge
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200"
              >
                {stats?.domestic || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">해외</span>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {stats?.foreign || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">주간 인기</span>
              <Badge
                variant="outline"
                className="bg-orange-50 text-orange-700 border-orange-200"
              >
                {stats?.weekly || 0}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
