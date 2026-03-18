import { Article } from '@/types/articles';
import { getArticleUrl, getImageUrl } from '@/utils/url';

interface ArticleJsonLdProps {
  article: Article;
  articleId: string;
}

export default function ArticleJsonLd({ article, articleId }: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.description || article.title,
    image: getImageUrl(article.thumbnail),
    datePublished: article.pub_date,
    author: {
      '@type': 'Organization',
      name: article.source_name,
    },
    publisher: {
      '@type': 'Organization',
      name: '한눈IT',
      logo: {
        '@type': 'ImageObject',
        url: 'https://hanun-it.com/assets/logo/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': getArticleUrl(articleId),
    },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
}
