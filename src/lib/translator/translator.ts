interface DeepLResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

export class ArticleTranslator {
  private apiKey: string;
  private baseUrl = 'https://api-free.deepl.com/v2/translate';

  // 번역하지 않을 기술 용어들
  private techTerms = [
    'flex',
    'flexbox',
    'grid',
    'CSS',
    'HTML',
    'JavaScript',
    'TypeScript',
    'React',
    'Vue',
    'Angular',
    'Node.js',
    'npm',
    'yarn',
    'webpack',
    'div',
    'span',
    'class',
    'id',
    'src',
    'href',
    'alt',
    'title',
    'padding',
    'margin',
    'border',
    'width',
    'height',
    'display',
    'position',
    'absolute',
    'relative',
    'fixed',
    'static',
    'sticky',
    'float',
    'clear',
    'overflow',
    'z-index',
    'opacity',
    'transform',
    'transition',
    'animation',
    'keyframes',
    'hover',
    'focus',
    'active',
    'before',
    'after',
    'nth-child',
    'first-child',
    'last-child',
    'API',
    'REST',
    'GraphQL',
    'JSON',
    'XML',
    'HTTP',
    'HTTPS',
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'HEAD',
    'OPTIONS',
    'async',
    'await',
    'Promise',
    'callback',
    'function',
    'const',
    'let',
    'var',
    'if',
    'else',
    'for',
    'while',
    'switch',
    'case',
    'break',
    'continue',
    'return',
    'import',
    'export',
    'default',
    'class',
    'extends',
    'super',
    'this',
    'new',
    'typeof',
    'instanceof',
    'try',
    'catch',
    'finally',
    'throw',
    'Error',
    'console',
    'log',
    'warn',
    'error',
    'debug',
  ];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // 코드 블록과 기술 용어를 보호하는 전처리 함수
  private protectCodeAndTerms(text: string): {
    protectedText: string;
    placeholders: Map<string, string>;
  } {
    const placeholders = new Map<string, string>();
    let protectedText = text;
    let placeholderIndex = 0;

    // 1. 코드 블록 보호 (```로 감싸진 부분)
    protectedText = protectedText.replace(/```[\s\S]*?```/g, (match) => {
      const placeholder = `__CODE_BLOCK_${placeholderIndex++}__`;
      placeholders.set(placeholder, match);
      return placeholder;
    });

    // 2. 인라인 코드 보호 (`로 감싸진 부분)
    protectedText = protectedText.replace(/`[^`]+`/g, (match) => {
      const placeholder = `__INLINE_CODE_${placeholderIndex++}__`;
      placeholders.set(placeholder, match);
      return placeholder;
    });

    // 3. HTML 태그 보호
    protectedText = protectedText.replace(/<[^>]+>/g, (match) => {
      const placeholder = `__HTML_TAG_${placeholderIndex++}__`;
      placeholders.set(placeholder, match);
      return placeholder;
    });

    // 4. CSS 속성값 보호 (: 뒤의 값들)
    protectedText = protectedText.replace(/(\w+):\s*([^;}\n]+)/g, (match, property, value) => {
      if (this.techTerms.includes(property.toLowerCase()) || this.techTerms.includes(value.trim().toLowerCase())) {
        const placeholder = `__CSS_PROP_${placeholderIndex++}__`;
        placeholders.set(placeholder, match);
        return placeholder;
      }
      return match;
    });

    // 5. 기술 용어 보호 (단어 경계 고려)
    this.techTerms.forEach((term) => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi');
      protectedText = protectedText.replace(regex, (match) => {
        const placeholder = `__TECH_TERM_${placeholderIndex++}__`;
        placeholders.set(placeholder, match);
        return placeholder;
      });
    });

    // 6. URL 보호
    protectedText = protectedText.replace(/https?:\/\/[^\s]+/g, (match) => {
      const placeholder = `__URL_${placeholderIndex++}__`;
      placeholders.set(placeholder, match);
      return placeholder;
    });

    // 7. 파일 경로 보호
    protectedText = protectedText.replace(/[a-zA-Z0-9_-]+\.[a-zA-Z0-9]+/g, (match) => {
      const placeholder = `__FILE_PATH_${placeholderIndex++}__`;
      placeholders.set(placeholder, match);
      return placeholder;
    });

    return { protectedText, placeholders };
  }

  // 보호된 요소들을 복원하는 후처리 함수
  private restoreProtectedElements(text: string, placeholders: Map<string, string>): string {
    let restoredText = text;

    placeholders.forEach((original, placeholder) => {
      restoredText = restoredText.replace(new RegExp(placeholder, 'g'), original);
    });

    return restoredText;
  }

  async translateText(text: string, targetLang: string = 'KO', sourceLang?: string): Promise<string> {
    try {
      // 코드와 기술 용어 보호
      const { protectedText, placeholders } = this.protectCodeAndTerms(text);

      const params = new URLSearchParams({
        auth_key: this.apiKey,
        text: protectedText,
        target_lang: targetLang,
        preserve_formatting: '1',
        formality: 'default',
        tag_handling: 'html', // HTML 태그 처리 개선
      });

      if (sourceLang) {
        params.append('source_lang', sourceLang);
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      });

      if (!response.ok) {
        throw new Error(`DeepL API error: ${response.status}`);
      }

      const data: DeepLResponse = await response.json();
      const translatedText = data.translations[0].text;

      // 보호된 요소들 복원
      return this.restoreProtectedElements(translatedText, placeholders);
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  async translateArticle(article: { title: string; content: string; description: string }) {
    try {
      // 제목은 기술 용어만 보호 (코드 블록은 거의 없음)
      const { protectedText: protectedTitle, placeholders: titlePlaceholders } = this.protectCodeAndTerms(
        article.title,
      );

      const [translatedTitle, translatedContent, translatedDescription] = await Promise.all([
        this.translateText(article.title),
        this.translateText(article.content),
        this.translateText(article.description),
      ]);

      return {
        title: translatedTitle,
        content: translatedContent,
        description: translatedDescription,
      };
    } catch (error) {
      console.error('Article translation error:', error);
      throw error;
    }
  }
}
