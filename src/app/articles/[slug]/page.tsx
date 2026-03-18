import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ArticleDetailClient from './ArticleDetailClient';
import CategoryPageClient from './CategoryPageClient';
import ArticleJsonLd from '@/components/seo/ArticleJsonLd';
import { getArticleUrl, getImageUrl } from '@/utils/url';
import { ARTICLE_CATEGORIES, CATEGORY_INFO, type CategoryType } from '@/utils/constants';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Check if slug is a valid category
function isCategory(slug: string): slug is CategoryType {
  return Object.values(ARTICLE_CATEGORIES).includes(slug as CategoryType);
}

// React.cache()로 같은 요청 내 중복 호출 방지 (generateMetadata + page)
const getArticle = cache(async function getArticle(id: string) {
  const supabase = await createClient();

  // 두 테이블 병렬 조회
  const [articleResult, newsResult] = await Promise.allSettled([
    supabase.from('articles').select('*').eq('id', id).single(),
    supabase.from('it_news').select('*').eq('id', id).single(),
  ]);

  if (articleResult.status === 'fulfilled' && articleResult.value.data) {
    return articleResult.value.data;
  }

  if (newsResult.status === 'fulfilled' && newsResult.value.data) {
    return {
      ...newsResult.value.data,
      is_domestic: true,
      category: 'it-news',
    };
  }

  return null;
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // If slug is a category, return category metadata
  if (isCategory(slug)) {
    const categoryInfo = CATEGORY_INFO[slug];
    return {
      title: `${categoryInfo.label} - ${categoryInfo.description} | 한눈IT`,
      description: `${categoryInfo.description}을 한눈에 모아보세요`,
      keywords: ['IT뉴스', '기술뉴스', '개발자뉴스', categoryInfo.label, slug],
      openGraph: {
        title: `${categoryInfo.label} | 한눈IT`,
        description: categoryInfo.description,
        url: `https://hanun-it.com/articles/${slug}`,
        siteName: '한눈IT',
        locale: 'ko_KR',
        type: 'website',
      },
    };
  }

  // Otherwise, it's an article ID
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: '아티클을 찾을 수 없습니다 | 한눈IT',
    };
  }

  const title = `${article.title} | 한눈IT`;
  const description = article.description || article.title;
  const ogImageUrl = `https://hanun-it.com/api/og?title=${encodeURIComponent(article.title)}&source=${encodeURIComponent(article.source_name)}&category=${encodeURIComponent(article.category)}`;
  const articleUrl = getArticleUrl(slug);

  return {
    title,
    description,
    keywords: [
      'IT뉴스',
      '기술뉴스',
      '개발자뉴스',
      article.source_name,
      article.category,
      ...(article.is_domestic ? ['국내', '한국'] : ['해외', '글로벌']),
    ],
    authors: [{ name: article.source_name }],
    publisher: '한눈IT',
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName: '한눈IT',
      locale: 'ko_KR',
      type: 'article',
      publishedTime: article.pub_date,
      modifiedTime: article.updated_at,
      authors: [article.source_name],
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: articleUrl,
    },
    other: {
      'article:author': article.source_name,
      'article:published_time': article.pub_date,
      'article:modified_time': article.updated_at,
      'article:section': article.category,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;

  // If slug is a category, render category page
  if (isCategory(slug)) {
    return <CategoryPageClient category={slug} />;
  }

  // Otherwise, render article detail page
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <>
      <ArticleJsonLd article={article} articleId={slug} />
      <ArticleDetailClient articleId={slug} initialArticle={article} />
    </>
  );
}