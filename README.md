# 한눈IT - IT 아티클 & YouTube 영상 큐레이션 플랫폼

국내외 IT 기술 아티클과 YouTube 영상을 한 곳에서 볼 수 있는 큐레이션 플랫폼입니다.

## 주요 기능

- 📰 **아티클 큐레이션**: 국내/해외 IT 기업 및 개발자 블로그의 최신 아티클
- 🎥 **YouTube 영상**: 최신 IT 기술 및 프로그래밍 관련 YouTube 영상
- 🔍 **통합 검색**: 아티클과 영상을 동시에 검색
- 📊 **트렌딩**: 조회수 기준 인기 콘텐츠
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화

## 기술 스택

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand, TanStack Query
- **HTTP Client**: Axios
- **APIs**: RSS Feeds, YouTube Data API v3

## 설정 방법

### 1. 프로젝트 클론 및 설치

```bash
git clone <repository-url>
cd hanun-it
pnpm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 환경 변수를 설정하세요:

```bash
# YouTube API 설정 (YouTube 영상 기능 사용 시 필요)
YOUTUBE_API_KEY=your_youtube_api_key_here

# 데이터베이스 (아티클 저장용)
DATABASE_URL=your_database_url_here
```

### 3. YouTube API 키 발급 방법

1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" → "라이브러리"에서 "YouTube Data API v3" 활성화
4. "사용자 인증 정보" → "사용자 인증 정보 만들기" → "API 키" 선택
5. 생성된 API 키를 `.env.local`의 `YOUTUBE_API_KEY`에 설정

### 4. 개발 서버 실행

```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 결과를 확인할 수 있습니다.

## 사용 방법

### 아티클 기능

- **전체 아티클**: 모든 RSS 소스의 아티클을 통합해서 확인
- **국내 아티클**: 한국 기업 및 개발자의 기술 블로그
- **해외 아티클**: 해외 기술 블로그 및 미디어
- **주간 인기**: 조회수 기준 인기 아티클

### YouTube 영상 기능

- **최신 기술 영상**: AI가 선별한 최신 IT/프로그래밍 관련 영상
- **실시간 검색**: 원하는 기술 키워드로 영상 검색
- **원클릭 재생**: 영상 클릭 시 YouTube에서 바로 재생

## 개발 정보

### 프로젝트 구조

```
src/
├── app/
│   ├── articles/          # 아티클 페이지
│   ├── videos/           # YouTube 영상 페이지
│   └── api/
│       ├── articles/     # 아티클 API
│       ├── youtube/      # YouTube API
│       └── rss/         # RSS 수집 API
├── components/
│   ├── header/          # 헤더 컴포넌트
│   ├── sidebar/         # 사이드바 (카테고리)
│   └── ui/             # 공통 UI 컴포넌트
└── types/              # TypeScript 타입 정의
```

### RSS 소스 관리

`src/utils/constants.ts`에서 RSS 소스를 추가/제거할 수 있습니다.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 소셜 로그인 설정

이 프로젝트는 Supabase를 사용하여 GitHub, Google, Kakao 소셜 로그인을 지원합니다.

### 1. 환경변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:7007
```

### 2. Supabase 대시보드 설정

#### GitHub OAuth 설정

1. [GitHub Developer Settings](https://github.com/settings/developers)에서 새 OAuth App 생성
2. Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. Supabase 대시보드 > Authentication > Providers > GitHub에서 Client ID와 Client Secret 입력

#### Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI: `https://your-project.supabase.co/auth/v1/callback`
4. Supabase 대시보드 > Authentication > Providers > Google에서 Client ID와 Client Secret 입력

#### Kakao OAuth 설정

1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션 생성
2. 플랫폼 설정 > Web > 사이트 도메인 등록
3. 카카오 로그인 > Redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Supabase 대시보드 > Authentication > Providers > Kakao에서 Client ID와 Client Secret 입력

### 3. 사용 방법

#### 로그인 페이지

```typescript
import SocialLogin from "@/components/auth/SocialLogin";

export default function LoginPage() {
  return (
    <div>
      <h1>로그인</h1>
      <SocialLogin redirectTo="/profile" />
    </div>
  );
}
```

#### 사용자 프로필 표시

```typescript
import UserProfile from "@/components/auth/UserProfile";

export default function Header() {
  return (
    <header>
      <UserProfile />
    </header>
  );
}
```

#### 보호된 라우트

```typescript
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function PrivatePage() {
  return (
    <ProtectedRoute>
      <div>인증된 사용자만 볼 수 있는 내용</div>
    </ProtectedRoute>
  );
}
```

#### 인증 상태 확인

```typescript
import { useAuth } from "@/hooks/useAuth";

export default function MyComponent() {
  const { user, isAuthenticated, loading, signOut } = useAuth();

  if (loading) return <div>로딩 중...</div>;

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>안녕하세요, {user?.email}님!</p>
          <button onClick={signOut}>로그아웃</button>
        </div>
      ) : (
        <a href="/auth/login">로그인</a>
      )}
    </div>
  );
}
```

### 4. 라우트 구조

- `/auth/login` - 로그인 페이지
- `/auth/callback` - OAuth 콜백 처리
- `/profile` - 보호된 프로필 페이지 (예시)

### 5. 주요 컴포넌트

- `SocialLogin` - 소셜 로그인 버튼들
- `UserProfile` - 사용자 정보 및 로그아웃 버튼
- `ProtectedRoute` - 인증이 필요한 페이지 보호
- `useAuth` - 인증 상태 관리 훅

## 개발 서버 실행

```bash
pnpm dev
```

서버가 http://localhost:7007에서 실행됩니다.
