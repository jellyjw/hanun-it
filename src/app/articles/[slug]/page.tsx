import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ArticleDetailClient from './ArticleDetailClient';
import CategoryPageClient from './CategoryPageClient';
import { getArticleUrl, getImageUrl } from '@/utils/url';
import { ARTICLE_CATEGORIES, CATEGORY_INFO, type CategoryType } from '@/utils/constants';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Check if slug is a valid category
function isCategory(slug: string): slug is CategoryType {
  return Object.values(ARTICLE_CATEGORIES).includes(slug as CategoryType);
}

async function getArticle(id: string) {
  const supabase = await createClient();
  
  // First try to find in regular articles table
  const { data: articleData, error: articleError } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (articleData && !articleError) {
    return articleData;
  }

  // If not found, try IT news table
  const { data: newsData, error: newsError } = await supabase
    .from('it_news')
    .select('*')
    .eq('id', id)
    .single();

  if (newsData && !newsError) {
    // Transform IT news data to match article structure
    return {
      ...newsData,
      is_domestic: true, // IT news are typically domestic
      category: 'it-news',
    };
  }

  return null;
}

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
  const imageUrl = getImageUrl(article.thumbnail);
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
          url: imageUrl,
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
      images: [imageUrl],
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

  return <ArticleDetailClient articleId={slug} initialArticle={article} />;
}