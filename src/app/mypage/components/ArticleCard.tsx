'use client';

import { MyPageArticle } from '@/types/user';
import Image from 'next/image';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

interface ArticleCardProps {
  article: MyPageArticle;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/articles/${article.id}`}>
      <div className="group flex gap-3 rounded-lg border border-transparent p-3 transition-colors hover:border-border hover:bg-accent/50">
        {/* 썸네일 */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded sm:h-[72px] sm:w-[72px]">
          {article.thumbnail ? (
            <Image
              src={article.thumbnail}
              alt={article.title}
              fill
              className="object-cover"
              sizes="72px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50 text-[10px] text-gray-300 dark:bg-gray-800">
              IMG
            </div>
          )}
        </div>

        {/* 내용 */}
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground group-hover:text-primary sm:text-sm">
            {article.title}
          </h3>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span>{article.sourceName}</span>
            <span>·</span>
            <span>{dayjs(article.actionAt).fromNow()}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
