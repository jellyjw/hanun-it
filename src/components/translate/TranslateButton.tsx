// src/components/TranslateButton.tsx
"use client";

import { useState } from "react";
import { Languages } from "lucide-react";

interface TranslateButtonProps {
  articleId: string;
  isDomestic: boolean;
}

export function TranslateButton({
  articleId,
  isDomestic,
}: TranslateButtonProps) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);

  const handleTranslate = async () => {
    if (isDomestic) {
      alert("국내 아티클은 번역할 수 없습니다.");
      return;
    }

    setIsTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ articleId }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(result, "result");
        setIsTranslated(true);
        alert("번역이 완료되었습니다!");
      } else {
        alert(result.error || "번역 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("번역 요청 실패:", error);
      alert("번역 요청 중 오류가 발생했습니다.");
    } finally {
      setIsTranslating(false);
    }
  };

  if (isDomestic) {
    return null; // 국내 아티클에는 번역 버튼 표시 안함
  }

  return (
    <button
      onClick={handleTranslate}
      disabled={isTranslating || isTranslated}
      className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
        isTranslated
          ? "bg-green-100 text-green-800 cursor-not-allowed"
          : isTranslating
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
      }`}
    >
      <Languages size={16} />
      {isTranslating
        ? "번역 중..."
        : isTranslated
          ? "번역 완료"
          : "한국어로 번역"}
    </button>
  );
}
