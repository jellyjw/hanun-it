import OpenAI from 'openai';
import { getSummaryPrompt } from './prompts';

export class ArticleSummarizer {
  private client: OpenAI;
  private model = 'gpt-4o-mini';
  private maxTokens = 300; // 요약 최대 길이
  private temperature = 0.3; // 일관성 있는 요약을 위해 낮은 temperature

  // 비용 계산용 (GPT-4o-mini 가격)
  private inputCostPer1M = 0.15; // $0.15 per 1M input tokens
  private outputCostPer1M = 0.6; // $0.60 per 1M output tokens

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * 콘텐츠 전처리 - 너무 긴 콘텐츠 잘라내기
   */
  private preprocessContent(content: string): string {
    // 코드 블록 제거 (요약에 불필요)
    let processed = content.replace(/```[\s\S]*?```/g, '[코드 블록]');

    // HTML 태그 제거
    processed = processed.replace(/<[^>]+>/g, ' ');

    // 여러 공백을 하나로
    processed = processed.replace(/\s+/g, ' ').trim();

    // 최대 4000 단어로 제한 (토큰 제한 고려)
    const words = processed.split(' ');
    if (words.length > 4000) {
      processed = words.slice(0, 4000).join(' ') + '...';
    }

    return processed;
  }

  /**
   * 요약 생성
   */
  async summarizeArticle(content: string, title: string): Promise<string> {
    try {
      // 콘텐츠 전처리
      const processedContent = this.preprocessContent(content);

      // 너무 짧은 콘텐츠는 요약하지 않음
      if (processedContent.length < 100) {
        return '';
      }

      // 프롬프트 생성
      const prompt = getSummaryPrompt(processedContent, title);

      // OpenAI API 호출
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              '당신은 기술 아티클을 명확하고 간결하게 요약하는 전문가입니다. 항상 3-4문장으로 핵심만 요약합니다.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const summary = response.choices[0]?.message?.content?.trim() || '';

      // 요약이 너무 짧거나 비어있으면 실패로 간주
      if (summary.length < 50) {
        return '';
      }

      return summary;
    } catch (error) {
      if (error instanceof Error) {
        console.error('OpenAI summarization error:', error.message);

        // Rate limit 에러인 경우 재시도 가능하도록 에러 던지기
        if (error.message.includes('rate_limit')) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
      }

      // 다른 에러는 빈 문자열 반환 (fallback)
      return '';
    }
  }

  /**
   * 재시도 로직이 포함된 요약 생성 (선택적 사용)
   */
  async summarizeArticleWithRetry(
    content: string,
    title: string,
    maxRetries: number = 3,
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.summarizeArticle(content, title);
      } catch (error) {
        lastError = error as Error;
        // Rate limit 에러면 exponential backoff
        if (lastError.message.includes('rate_limit') || lastError.message.includes('Rate limit')) {
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          // 다른 에러는 재시도하지 않음
          break;
        }
      }
    }

    console.error('All retry attempts failed');
    return '';
  }
}
