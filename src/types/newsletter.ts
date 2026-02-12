export interface NewsletterSubscription {
  id: string;
  user_id: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  unsubscribed_at: string | null;
}

export interface NewsletterArticle {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  source_name: string;
  pub_date: string;
  view_count: number;
  link: string;
}

export interface NewsletterEmailData {
  subscriberEmail: string;
  subscriberName?: string;
  newArticles: NewsletterArticle[];
  popularArticles: NewsletterArticle[];
  unsubscribeUrl: string;
}
