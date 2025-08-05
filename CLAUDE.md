# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**한눈IT** is a Korean IT news and article aggregation platform built with Next.js 15.1.4, TypeScript, and Supabase. The platform collects and displays IT articles from domestic and international sources, providing search, categorization, and user interaction features.

## Development Commands

- `pnpm dev` - Start development server on port 7007 with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint with Next.js configuration
- `pnpm prettier` - Format code using Prettier

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 15.1.4 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **State Management**: TanStack Query for server state, Zustand for client state
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS with custom theme, Pretendard font
- **Analytics**: Vercel Analytics, Google AdSense integration

### Key Architecture Patterns

1. **App Router Structure**: Uses Next.js 15 App Router with route handlers in `src/app/api/`
2. **Server-Side Data Fetching**: Supabase SSR for server components
3. **Client-Side Caching**: TanStack Query with 1-minute stale time, 5-minute garbage collection
4. **Component Architecture**: Atomic design with UI components in `src/components/ui/`
5. **Type Safety**: Comprehensive TypeScript interfaces in `src/types/`

### Database Schema (Supabase)
- **articles**: Main content table with fields like `id`, `title`, `description`, `link`, `content`, `pub_date`, `source_name`, `category`, `is_domestic`, `thumbnail`, `view_count`
- **comments**: User comments linked to articles
- **article_likes**: Like system for articles (recently added)
- Uses Row Level Security (RLS) policies

### Data Flow
1. RSS feeds collected via API routes (`/api/rss`, `/api/it-news`)
2. Content stored in Supabase with automatic translation capabilities
3. Client fetches via TanStack Query with caching
4. Real-time updates through Supabase subscriptions

### Key Features
- **Article Aggregation**: Collects from domestic (우아한형제들, 카카오, 토스) and international sources
- **IT News**: Integrates with ZDNet, IT동아, 디지털타임스
- **Search & Filter**: By title, content, source, category, domestic/international
- **Sorting**: Latest, popular (by view count), comments
- **Authentication**: Supabase Auth with social login
- **Like System**: Recently implemented article likes functionality
- **Responsive Design**: Mobile-first with dark/light theme support

## File Structure Conventions

- `src/app/api/` - Server-side API routes (Next.js Route Handlers)
- `src/components/` - Reusable React components organized by feature
- `src/hooks/` - Custom React hooks (useGetArticles, useLikeMutation, etc.)
- `src/types/` - TypeScript type definitions
- `src/utils/supabase/` - Supabase client configurations (client, server, middleware)
- `src/store/` - Zustand stores for client state
- `supabase/migrations/` - Database migration files

## Development Guidelines

### API Routes
- Use consistent error handling with `NextResponse.json()`
- Implement caching headers (`s-maxage=300`)
- Handle search parameters with proper validation
- Use Supabase server client for database operations

### Component Development
- Follow existing component patterns in `src/components/ui/`
- Use TypeScript interfaces from `src/types/`
- Leverage TanStack Query for data fetching
- Implement proper loading and error states

### Database Operations
- Use Supabase server client for API routes
- Use Supabase browser client for client components
- Respect RLS policies
- Optimize queries with proper indexing and select clauses

### Code Quality
- ESLint configuration includes React, TypeScript, and import sorting rules
- Prettier with Tailwind CSS plugin for consistent formatting
- Unused imports are automatically removed
- Use proper TypeScript typing throughout

## Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- Additional API keys for external services (translation, RSS feeds)

## Recent Changes (Based on Git Status)
- Added article like functionality with API route and database migration
- Implemented LikeButton component and related hooks
- Updated article pages to include like/share functionality
- Added ShareButton component (untracked file)