import Image from 'next/image';

/** 목록 페이지 상단 히어로 영역 (로고 + 타이틀 + 설명). 순수 표현용 컴포넌트. */
export function ArticlesHero() {
  return (
    <div className="mb-8 flex flex-col items-center text-center sm:mb-12">
      <Image
        src="/assets/icons/eyes.gif"
        alt="eyes"
        width={60}
        height={60}
        className="h-12 w-12 sm:h-16 sm:w-16"
        unoptimized
      />
      <div className="mb-4 flex items-center justify-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">한눈에 모아보는 IT 뉴스</h1>
      </div>
      <p className="mx-auto max-w-2xl text-base text-gray-600 sm:text-lg">
        최신 IT 뉴스와 기술 아티클, 인기 영상을 한눈에 모아보세요.
      </p>
    </div>
  );
}
