'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ScrollNavigation() {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2 lg:bottom-8 lg:right-8">
      <Button
        onClick={scrollToTop}
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full border-2 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105"
      >
        <ChevronUp className="h-5 w-5" />
        <span className="sr-only">맨 위로 이동</span>
      </Button>
      
      <Button
        onClick={scrollToBottom}
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-full border-2 bg-white/90 shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105"
      >
        <ChevronDown className="h-5 w-5" />
        <span className="sr-only">맨 아래로 이동</span>
      </Button>
    </div>
  );
}