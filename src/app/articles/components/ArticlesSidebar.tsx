import { NewsletterSubscribeCard } from '@/components/sidebar/NewsletterSubscribeCard';
import { WeeklyPopularSidebar } from '@/components/sidebar/WeeklyPopularSidebar';

/** 목록 페이지 우측 사이드바 (뉴스레터 구독 + 주간 인기 아티클). sticky 레이아웃. */
export function ArticlesSidebar() {
  return (
    <div className="mt-6 w-full sm:mt-8 lg:mt-0 lg:w-80">
      <div className="space-y-6 sm:space-y-8 lg:sticky lg:top-24 lg:transition-all lg:duration-300">
        <NewsletterSubscribeCard />
        <WeeklyPopularSidebar />
      </div>
    </div>
  );
}
