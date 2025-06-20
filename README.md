# 🚀 한눈IT

<div align="center">
  <img src="public/logo/code.png" alt="한눈IT 로고" width="120" height="120">
  
  **국내, 해외의 IT 최신 아티클을 한눈에**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
</div>

## 📖 소개

**한눈IT**는 국내외 최신 IT 기술 아티클과 뉴스를 한 곳에서 모아볼 수 있도록 서비스를 제공합니다.

### ✨ 주요 특징

- 🌍 **국내/해외 아티클**: 우아한형제들, 카카오, 토스 등 국내 기술 블로그와 해외 유명 기술 블로그
- 📰 **IT 뉴스 섹션**: ZDNet, IT동아, 디지털타임스 등 주요 IT 미디어 뉴스 수집
- 🔍 **스마트 검색**: 제목, 내용, 소스별 통합 검색
- 📊 **다양한 정렬**: 인기순, 최신순, 댓글순 정렬 지원

## 🛠 기술 스택

### Frontend

- **Next.js 15.1.4**
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI**
- **TanStack Query**
- **Lucide React**

### Backend & Database

- **Supabase** - PostgreSQL 기반 BaaS
  - 실시간 데이터베이스
  - 인증 시스템
  - Row Level Security (RLS)
- **Next.js API Routes** - 서버리스 API

## 🏗 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   │   ├── articles/      # 아티클 관련 API
│   │   ├── it-news/       # IT 뉴스 API
│   │   └── rss/           # RSS 수집 API
│   ├── articles/          # 아티클 페이지
│   └── auth/              # 인증 페이지
├── components/            # 재사용 컴포넌트
│   ├── ui/               # 기본 UI 컴포넌트
│   ├── auth/             # 인증 관련 컴포넌트
│   ├── comments/         # 댓글 시스템
│   └── sidebar/          # 사이드바 컴포넌트
├── hooks/                # 커스텀 훅
├── types/                # TypeScript 타입 정의
├── utils/                # 유틸리티 함수
└── styles/               # 스타일 파일
```

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

- **이메일**: hanun.help@gmail.com
