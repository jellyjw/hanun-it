import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ArticleDetailClient from './ArticleDetailClient';
import { getArticleUrl, getImageUrl } from '@/utils/url';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getArticle(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: '아티클을 찾을 수 없습니다 | 한눈IT',
    };
  }

  const title = `${article.title} | 한눈IT`;
  const description = article.description || article.title;
  const imageUrl = getImageUrl(article.thumbnail);
  const articleUrl = getArticleUrl(id);

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

export default async function ArticleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return <ArticleDetailClient articleId={id} initialArticle={article} />;
}