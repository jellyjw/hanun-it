"use client";

import {
  Globe,
  MapPin,
  Code,
  Palette,
  Database,
  Smartphone,
  Monitor,
  Cpu,
} from "lucide-react";

interface FallbackThumbnailProps {
  title: string;
  category?: string;
  sourceName: string;
  isDomestic: boolean;
  className?: string;
}

// 카테고리별 색상 및 아이콘 정의
const getCategoryStyle = (category: string, isDomestic: boolean) => {
  const styles = {
    // 프론트엔드 관련
    frontend: {
      gradient: "from-blue-400 via-purple-500 to-blue-600",
      icon: Code,
      textColor: "text-white",
    },
    react: {
      gradient: "from-cyan-400 via-blue-500 to-blue-600",
      icon: Code,
      textColor: "text-white",
    },
    vue: {
      gradient: "from-green-400 via-emerald-500 to-green-600",
      icon: Code,
      textColor: "text-white",
    },
    angular: {
      gradient: "from-red-400 via-red-500 to-red-600",
      icon: Code,
      textColor: "text-white",
    },

    // 백엔드 관련
    backend: {
      gradient: "from-gray-600 via-gray-700 to-gray-800",
      icon: Database,
      textColor: "text-white",
    },
    nodejs: {
      gradient: "from-green-500 via-green-600 to-green-700",
      icon: Database,
      textColor: "text-white",
    },

    // 모바일
    mobile: {
      gradient: "from-purple-400 via-pink-500 to-purple-600",
      icon: Smartphone,
      textColor: "text-white",
    },
    ios: {
      gradient: "from-gray-400 via-gray-500 to-gray-600",
      icon: Smartphone,
      textColor: "text-white",
    },
    android: {
      gradient: "from-green-400 via-green-500 to-green-600",
      icon: Smartphone,
      textColor: "text-white",
    },

    // 디자인
    design: {
      gradient: "from-pink-400 via-rose-500 to-pink-600",
      icon: Palette,
      textColor: "text-white",
    },
    ui: {
      gradient: "from-purple-400 via-violet-500 to-purple-600",
      icon: Palette,
      textColor: "text-white",
    },
    ux: {
      gradient: "from-indigo-400 via-blue-500 to-indigo-600",
      icon: Palette,
      textColor: "text-white",
    },

    // 기타
    ai: {
      gradient: "from-orange-400 via-red-500 to-orange-600",
      icon: Cpu,
      textColor: "text-white",
    },
    devops: {
      gradient: "from-teal-400 via-teal-500 to-teal-600",
      icon: Monitor,
      textColor: "text-white",
    },
  };

  // 카테고리별 스타일 찾기
  const categoryKey = category?.toLowerCase() || "";
  let style = styles[categoryKey as keyof typeof styles];

  // 카테고리 매칭이 안되면 국내/해외별 기본 스타일
  if (!style) {
    if (isDomestic) {
      style = {
        gradient: "from-emerald-400 via-teal-500 to-emerald-600",
        icon: MapPin,
        textColor: "text-white",
      };
    } else {
      style = {
        gradient: "from-sky-400 via-blue-500 to-sky-600",
        icon: Globe,
        textColor: "text-white",
      };
    }
  }

  return style;
};

// 제목에서 키워드 추출
const extractKeyword = (title: string, sourceName: string) => {
  const lowerTitle = title.toLowerCase();

  // 기술 키워드 우선 추출
  const techKeywords = [
    "react",
    "vue",
    "angular",
    "svelte",
    "next.js",
    "nuxt",
    "typescript",
    "javascript",
    "python",
    "java",
    "kotlin",
    "swift",
    "flutter",
    "react native",
    "node.js",
    "express",
    "spring",
    "django",
    "fastapi",
    "docker",
    "kubernetes",
    "aws",
    "azure",
    "gcp",
    "firebase",
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "graphql",
    "rest api",
    "microservice",
    "ai",
    "ml",
    "machine learning",
    "deep learning",
    "chatgpt",
    "design system",
    "figma",
    "ui",
    "ux",
    "design",
  ];

  for (const keyword of techKeywords) {
    if (lowerTitle.includes(keyword)) {
      return keyword.toUpperCase();
    }
  }

  // 기술 키워드가 없으면 소스명 사용
  if (sourceName.length <= 8) {
    return sourceName;
  }

  // 제목의 첫 번째 중요한 단어 추출
  const words = title.split(" ").filter((word) => word.length > 2);
  return words[0]?.substring(0, 8) || sourceName.substring(0, 8);
};

export default function FallbackThumbnail({
  title,
  category,
  sourceName,
  isDomestic,
  className = "",
}: FallbackThumbnailProps) {
  const style = getCategoryStyle(category || "", isDomestic);
  const keyword = extractKeyword(title, sourceName);
  const Icon = style.icon;

  return (
    <div
      className={`relative w-full h-full bg-gradient-to-br ${style.gradient} flex flex-col items-center justify-center p-4 ${className}`}
    >
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.3),transparent_50%)]" />
      </div>

      {/* 아이콘 */}
      <Icon className="w-8 h-8 mb-2 text-white/80" />

      {/* 키워드 텍스트 */}
      <div className={`text-center ${style.textColor}`}>
        <div className="text-lg font-bold tracking-tight leading-tight">
          {keyword}
        </div>
        {isDomestic && <div className="text-xs opacity-75 mt-1">🇰🇷 국내</div>}
        {!isDomestic && <div className="text-xs opacity-75 mt-1">🌍 해외</div>}
      </div>

      {/* 소스명 */}
      <div className="absolute bottom-2 left-2 text-xs text-white/60 truncate max-w-[80%]">
        {sourceName}
      </div>
    </div>
  );
}
