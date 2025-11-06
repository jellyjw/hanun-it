// 아티클 카테고리 타입 및 상수
export const ARTICLE_CATEGORIES = {
  TECH: 'tech',
  NEWS: 'news',
  AI: 'ai',
  DATA: 'data',
  COMMUNITY: 'community',
  PERSONAL: 'personal',
} as const;

export type CategoryType = (typeof ARTICLE_CATEGORIES)[keyof typeof ARTICLE_CATEGORIES];

export const CATEGORY_INFO: Record<
  CategoryType,
  { label: string; description: string }
> = {
  tech: { label: 'Tech', description: '기술 블로그 및 개발 아티클' },
  news: { label: 'News', description: 'IT 뉴스 및 동향' },
  ai: { label: 'AI', description: '인공지능 및 머신러닝' },
  data: { label: 'Data', description: '데이터 사이언스 및 분석' },
  community: { label: 'Community', description: '개발자 커뮤니티' },
  personal: { label: 'Personal', description: '개인 개발자 블로그' },
};

export const RSS_SOURCES = [
  {
    name: '네이버 D2',
    url: 'https://d2.naver.com/d2.atom',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '넷마블 기술블로그',
    url: 'https://netmarble.engineering/feed/',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '지마켓 기술블로그',
    url: 'https://ebay-korea.tistory.com/rss',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '티빙 기술블로그',
    url: 'https://medium.com/feed/tving-team',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '기억보단 기록을',
    url: 'https://jojoldu.tistory.com/rss',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '우아한형제들 기술블로그',
    url: 'https://techblog.woowahan.com/feed/',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '우아한형제들 기술블로그',
    url: 'https://techblog.woowahan.com/author/tech_root/feed/',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '직방',
    url: 'https://medium.com/feed/zigbang',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '토스 기술블로그',
    url: 'https://toss.tech/rss.xml',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '당근마켓 기술블로그',
    url: 'https://medium.com/feed/daangn',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '라인 기술블로그',
    url: 'https://engineering.linecorp.com/ko/rss/',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '쏘카',
    url: 'https://tech.socarcorp.kr/feed',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: 'NHN 기술블로그',
    url: 'https://meetup.nhncloud.com/rss',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '뱅크샐러드 기술블로그',
    url: 'https://blog.banksalad.com/rss.xml',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '컬리 기술블로그',
    url: 'https://helloworld.kurly.com/feed.xml',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '요기요 기술블로그',
    url: 'https://medium.com/feed/deliverytechkorea',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '쿠팡 기술블로그',
    url: 'https://medium.com/feed/coupang-engineering',
    isDomestic: true,
    category: 'tech',
  }, // // 해외 개발 블로그 & 테크 미디어
  {
    name: '무신사 기술블로그',
    url: 'https://medium.com/feed/musinsa-tech',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '쿠팡 기술블로그',
    url: 'https://medium.com/feed/coupang-engineering',
    isDomestic: true,
    category: 'tech',
  }, // // 해외 개발 블로그 & 테크 미디어
  {
    name: '카카오 기술블로그',
    url: 'https://tech.kakao.com/feed/',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '카카오 엔터프라이즈 기술블로그',
    url: 'https://tech.kakaoenterprise.com/feed',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '왓챠',
    url: 'https://medium.com/feed/watcha',
    isDomestic: true,
    category: 'tech',
  },

  {
    name: 'Hacker News',
    url: 'https://hnrss.org/frontpage',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Dev.to',
    url: 'https://dev.to/feed',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Medium - Programming',
    url: 'https://medium.com/feed/tag/programming',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'GitHub Blog',
    url: 'https://github.blog/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Stack Overflow Blog',
    url: 'https://stackoverflow.blog/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Google Developers Blog',
    url: 'https://developers.googleblog.com/feeds/posts/default',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Netflix Tech Blog',
    url: 'https://netflixtechblog.com/feed',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Uber Engineering',
    url: 'https://eng.uber.com/rss/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Airbnb Engineering',
    url: 'https://medium.com/feed/airbnb-engineering',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Facebook Engineering',
    url: 'https://engineering.fb.com/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'AWS Blog',
    url: 'https://aws.amazon.com/blogs/aws/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Microsoft Developer Blog',
    url: 'https://devblogs.microsoft.com/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Vercel Blog',
    url: 'https://vercel.com/blog/rss.xml',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'CSS-Tricks',
    url: 'https://css-tricks.com/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Smashing Magazine',
    url: 'https://www.smashingmagazine.com/feed/',
    isDomestic: false,
    category: 'tech',
  },
  // 기존 리스트에 추가할 수 있는 RSS 소스들

  // 1. 누락된 국내 기업 기술블로그들
  {
    name: '야놀자 기술블로그',
    url: 'https://yanolja.github.io/feed.xml',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '리디 기술블로그',
    url: 'https://www.ridicorp.com/story-category/tech-blog/feed/',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '하이퍼커넥트 기술블로그',
    url: 'https://hyperconnect.github.io/feed.xml',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '데브시스터즈 기술블로그',
    url: 'https://tech.devsisters.com/rss.xml',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '레진 기술블로그',
    url: 'https://tech.lezhin.com/rss',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '플래티어 기술블로그',
    url: 'https://blog.plateer.com/feed/',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '29CM 기술블로그',
    url: 'https://medium.com/feed/29cm',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '스타일쉐어 기술블로그',
    url: 'https://medium.com/feed/styleshare',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '마켓보로 기술블로그',
    url: 'https://medium.com/feed/marketboro',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '이스트소프트 기술블로그',
    url: 'https://blog.est.ai/rss/',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '플래티팜 기술블로그',
    url: 'https://medium.com/feed/platfarm-tech-blog',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '플라네타리움 기술블로그',
    url: 'https://snack.planetarium.dev/kor/feed.xml',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '센드버드 기술블로그',
    url: 'https://sendbird.com/developer/tutorials/rss',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '토스랩 기술블로그',
    url: 'https://tosslab.github.io/feed.xml',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '크래프톤 기술블로그',
    url: 'https://krafton.game/feed/',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '스켈터랩스 기술블로그',
    url: 'https://skelter-labs.github.io/feed.xml',
    isDomestic: true,
    category: 'tech',
  },
  {
    name: '비바리퍼블리카 기술블로그',
    url: 'https://blog.toss.im/feed.xml',
    isDomestic: true,
    category: 'tech',
  },

  // 2. 추가 해외 기업 기술블로그들
  {
    name: 'Spotify Engineering',
    url: 'https://labs.spotify.com/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Dropbox Tech Blog',
    url: 'https://dropbox.tech/feed',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Pinterest Engineering',
    url: 'https://medium.com/feed/pinterest-engineering',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'LinkedIn Engineering',
    url: 'https://engineering.linkedin.com/blog.rss',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Twitter Engineering',
    url: 'https://blog.twitter.com/engineering/en_us/blog.rss',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Slack Engineering',
    url: 'https://slack.engineering/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Shopify Engineering',
    url: 'https://shopify.engineering/blog.rss',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Stripe Blog',
    url: 'https://stripe.com/blog/feed.rss',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Cloudflare Blog',
    url: 'https://blog.cloudflare.com/rss/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Atlassian Developer Blog',
    url: 'https://blog.developer.atlassian.com/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Twilio Blog',
    url: 'https://www.twilio.com/blog/feed',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Redis Blog',
    url: 'https://redis.com/blog/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'MongoDB Developer Blog',
    url: 'https://developer.mongodb.com/feed.xml',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'Docker Blog',
    url: 'https://www.docker.com/blog/feed/',
    isDomestic: false,
    category: 'tech',
  },
  {
    name: 'GitLab Blog',
    url: 'https://about.gitlab.com/atom.xml',
    isDomestic: false,
    category: 'tech',
  },

  // 3. 개발 커뮤니티 및 뉴스 사이트
  {
    name: 'GeekNews',
    url: 'https://news.hada.io/rss',
    isDomestic: true,
    category: 'news',
  },
  {
    name: '개발자스럽다',
    url: 'https://blog.gaerae.com/feeds/posts/default',
    isDomestic: true,
    category: 'news',
  },
  {
    name: 'velog 인기글',
    url: 'https://api.velog.io/rss/@trending',
    isDomestic: true,
    category: 'community',
  },
  {
    name: 'InfoQ',
    url: 'https://feed.infoq.com/',
    isDomestic: false,
    category: 'news',
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    isDomestic: false,
    category: 'news',
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    isDomestic: false,
    category: 'news',
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/technology-lab',
    isDomestic: false,
    category: 'news',
  },

  // 4. 개인 개발자 블로그 (유명한 분들)
  {
    name: '44BITS',
    url: 'https://www.44bits.io/ko/feed.xml',
    isDomestic: true,
    category: 'personal',
  },
  {
    name: '박성철 블로그',
    url: 'https://seongcheol.org/feed/',
    isDomestic: true,
    category: 'personal',
  },
  {
    name: 'Outsider 블로그',
    url: 'https://blog.outsider.ne.kr/rss',
    isDomestic: true,
    category: 'personal',
  },
  {
    name: '조영호 블로그',
    url: 'http://aeternum.egloos.com/rss',
    isDomestic: true,
    category: 'personal',
  },

  // 5. 특화 분야 (AI, 데이터, 클라우드 등)
  {
    name: 'Google AI Blog',
    url: 'http://ai.googleblog.com/feeds/posts/default',
    isDomestic: false,
    category: 'ai',
  },
  {
    name: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    isDomestic: false,
    category: 'ai',
  },
  {
    name: 'Towards Data Science',
    url: 'https://towardsdatascience.com/feed',
    isDomestic: false,
    category: 'data',
  },
  {
    name: 'KDnuggets',
    url: 'https://www.kdnuggets.com/feed',
    isDomestic: false,
    category: 'data',
  },
];
