import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createServiceRoleClient } from '@supabase/supabase-js';

interface TestResult {
  success: boolean;
  count?: number;
  data?: any[];
  error?: string;
  insertedData?: any;
}

interface DiagnosticResults {
  timestamp: string;
  environment: {
    supabaseUrl: string;
    serviceRoleKey: string;
  };
  tests: {
    rssSourcesNormal?: TestResult;
    rssSourcesService?: TestResult;
    itNewsNormal?: TestResult;
    itNewsService?: TestResult;
    insertTest?: TestResult;
  };
}

export async function GET() {
  try {
    console.log('🔍 IT 뉴스 시스템 진단 시작...');

    // 일반 클라이언트와 서비스 역할 클라이언트 둘 다 테스트
    const normalClient = await createClient();

    let serviceClient;
    try {
      serviceClient = createServiceRoleClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
    } catch (error) {
      console.error('서비스 클라이언트 생성 실패:', error);
    }

    const results: DiagnosticResults = {
      timestamp: new Date().toISOString(),
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '설정됨' : '누락',
        serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨' : '누락',
      },
      tests: {},
    };

    // 1. it_news_rss_sources 테이블 확인 (일반 클라이언트)
    console.log('📋 RSS 소스 테이블 확인 (일반 클라이언트)...');
    try {
      const {
        data: rssSourcesNormal,
        error: rssErrorNormal,
        count,
      } = await normalClient.from('it_news_rss_sources').select('*', { count: 'exact' });

      results.tests.rssSourcesNormal = {
        success: !rssErrorNormal,
        count: count || 0,
        data: rssSourcesNormal?.slice(0, 3), // 처음 3개만 표시
        error: rssErrorNormal?.message,
      };
    } catch (error: any) {
      results.tests.rssSourcesNormal = {
        success: false,
        error: error?.message || '알 수 없는 오류',
      };
    }

    // 2. it_news_rss_sources 테이블 확인 (서비스 클라이언트)
    if (serviceClient) {
      console.log('📋 RSS 소스 테이블 확인 (서비스 클라이언트)...');
      try {
        const {
          data: rssSourcesService,
          error: rssErrorService,
          count,
        } = await serviceClient.from('it_news_rss_sources').select('*', { count: 'exact' });

        results.tests.rssSourcesService = {
          success: !rssErrorService,
          count: count || 0,
          data: rssSourcesService?.slice(0, 3), // 처음 3개만 표시
          error: rssErrorService?.message,
        };
      } catch (error: any) {
        results.tests.rssSourcesService = {
          success: false,
          error: error?.message || '알 수 없는 오류',
        };
      }
    }

    // 3. it_news 테이블 확인 (일반 클라이언트)
    console.log('📰 IT 뉴스 테이블 확인 (일반 클라이언트)...');
    try {
      const {
        data: newsNormal,
        error: newsErrorNormal,
        count,
      } = await normalClient.from('it_news').select('*', { count: 'exact' });

      results.tests.itNewsNormal = {
        success: !newsErrorNormal,
        count: count || 0,
        data: newsNormal?.slice(0, 3), // 처음 3개만 표시
        error: newsErrorNormal?.message,
      };
    } catch (error: any) {
      results.tests.itNewsNormal = {
        success: false,
        error: error?.message || '알 수 없는 오류',
      };
    }

    // 4. it_news 테이블 확인 (서비스 클라이언트)
    if (serviceClient) {
      console.log('📰 IT 뉴스 테이블 확인 (서비스 클라이언트)...');
      try {
        const {
          data: newsService,
          error: newsErrorService,
          count,
        } = await serviceClient.from('it_news').select('*', { count: 'exact' });

        results.tests.itNewsService = {
          success: !newsErrorService,
          count: count || 0,
          data: newsService?.slice(0, 3), // 처음 3개만 표시
          error: newsErrorService?.message,
        };
      } catch (error: any) {
        results.tests.itNewsService = {
          success: false,
          error: error?.message || '알 수 없는 오류',
        };
      }

      // 5. 간단한 데이터 삽입 테스트
      console.log('💾 데이터 삽입 테스트...');
      try {
        const testItem = {
          title: '테스트 뉴스 - ' + Date.now(),
          description: '테스트용 뉴스 아이템입니다.',
          content: '테스트 컨텐츠',
          link: 'https://test.com/news/' + Date.now(),
          pub_date: new Date().toISOString(),
          source_name: '테스트 소스',
          source_url: 'https://test.com',
          category: 'news',
          view_count: 0,
          comment_count: 0,
        };

        const { data: insertResult, error: insertError } = await serviceClient
          .from('it_news')
          .insert(testItem)
          .select();

        results.tests.insertTest = {
          success: !insertError,
          insertedData: insertResult?.[0],
          error: insertError?.message,
        };

        // 테스트 데이터 삭제
        if (insertResult?.[0]?.id) {
          await serviceClient.from('it_news').delete().eq('id', insertResult[0].id);
          console.log('🗑️ 테스트 데이터 삭제 완료');
        }
      } catch (error: any) {
        results.tests.insertTest = {
          success: false,
          error: error?.message || '알 수 없는 오류',
        };
      }
    }

    console.log('✅ IT 뉴스 시스템 진단 완료');
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('❌ 진단 중 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || '알 수 없는 오류',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
