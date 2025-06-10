import { marked } from "marked";
import "highlight.js/styles/github-dark.css"; // 다크 테마
import hljs from "highlight.js";

const renderer = new marked.Renderer();

renderer.code = function ({ text, lang, escaped }) {
  const validLanguage = lang && hljs.getLanguage(lang) ? lang : "plaintext";
  const highlighted = hljs.highlight(text, { language: validLanguage }).value;

  return `
    <div class="code-block-wrapper my-6">
      <div class="code-block-header bg-gray-200 dark:bg-gray-700 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border-t border-l border-r border-gray-300 dark:border-gray-600 rounded-t-lg">
        <span class="font-mono">${validLanguage}</span>
      </div>
      <pre class="code-block bg-gray-900 dark:bg-gray-800 p-4 overflow-x-auto border border-gray-300 dark:border-gray-600 rounded-b-lg"><code class="language-${validLanguage} text-sm font-mono leading-relaxed hljs">${highlighted}</code></pre>
    </div>
  `;
};

// marked 설정
marked.setOptions({
  renderer: renderer,
  breaks: true,
  gfm: true,
});

/**
 * 텍스트가 마크다운인지 HTML인지 감지
 */
export function detectContentType(
  content: string
): "markdown" | "html" | "text" {
  if (!content) return "text";

  // HTML 태그가 많이 포함되어 있으면 HTML로 판단
  const htmlTagCount = (content.match(/<[^>]+>/g) || []).length;
  const contentLength = content.length;

  // HTML 태그가 충분히 많으면 HTML로 간주
  if (htmlTagCount > 3 && (htmlTagCount / contentLength) * 1000 > 8) {
    return "html";
  }

  // 마크다운 패턴 감지
  const markdownPatterns = [
    /^#{1,6}\s+.+$/m, // 헤딩 (# ## ### 등)
    /^\* .+$/m, // 리스트 (* item)
    /^- .+$/m, // 리스트 (- item)
    /^\d+\. .+$/m, // 순서 리스트 (1. item)
    /\*\*.+\*\*/, // 볼드 (**text**)
    /\[.+\]\(.+\)/, // 링크 [text](url)
    /!\[.*\]\(.+\)/, // 이미지 ![alt](url)
    /^```.+```$/, // 코드 블록
    /`.+`/, // 인라인 코드
    /^>.+$/m, // 인용구 (> text)
  ];

  const markdownMatches = markdownPatterns.filter((pattern) =>
    pattern.test(content)
  ).length;

  if (markdownMatches >= 2) {
    return "markdown";
  }

  return "text";
}

/**
 * 마크다운을 HTML로 변환하고 Tailwind CSS 클래스 적용
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";

  try {
    // marked로 마크다운을 HTML로 변환
    let html = marked.parse(markdown) as string;

    // Tailwind CSS 클래스 적용
    html = addTailwindClasses(html);

    return html;
  } catch (error) {
    console.error("마크다운 변환 오류:", error);
    // 오류 발생 시 원본 텍스트를 단락으로 래핑해서 반환
    return `<p class="mb-4 text-base leading-7">${markdown}</p>`;
  }
}

/**
 * HTML에 Tailwind CSS 클래스 추가
 */
function addTailwindClasses(html: string): string {
  // 헤딩 태그에 클래스 추가
  html = html.replace(
    /<h1>/g,
    '<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">'
  );
  html = html.replace(
    /<h2>/g,
    '<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">'
  );
  html = html.replace(
    /<h3>/g,
    '<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">'
  );
  html = html.replace(
    /<h4>/g,
    '<h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">'
  );
  html = html.replace(
    /<h5>/g,
    '<h5 class="text-base font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">'
  );
  html = html.replace(
    /<h6>/g,
    '<h6 class="text-sm font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">'
  );

  // 단락에 클래스 추가
  html = html.replace(/<p>/g, '<p class="mb-4 text-base leading-7">');

  // 리스트에 클래스 추가
  html = html.replace(/<ul>/g, '<ul class="mb-4 pl-6">');
  html = html.replace(/<ol>/g, '<ol class="mb-4 pl-6">');
  html = html.replace(/<li>/g, '<li class="mb-2">');

  // 링크에 클래스 추가
  html = html.replace(
    /<a href/g,
    '<a class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" href'
  );

  // 이미지에 클래스 추가
  html = html.replace(
    /<img/g,
    '<img class="max-w-full h-auto rounded-lg my-4 mx-auto"'
  );

  // 코드 블록에 클래스 추가
  html = html.replace(
    /<pre>/g,
    '<pre class="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">'
  );
  html = html.replace(
    /<code>/g,
    '<code class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded text-sm font-mono">'
  );

  // pre 안의 code는 배경 제거
  html = html.replace(/<pre[^>]*><code[^>]*>/g, (match) => {
    return match.replace(
      /bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded/,
      "bg-transparent p-0"
    );
  });

  // 인용구에 클래스 추가
  html = html.replace(
    /<blockquote>/g,
    '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4">'
  );

  // 테이블에 클래스 추가
  html = html.replace(
    /<table>/g,
    '<table class="w-full border-collapse border border-gray-300 dark:border-gray-600 my-4">'
  );
  html = html.replace(
    /<th>/g,
    '<th class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left bg-gray-100 dark:bg-gray-800 font-semibold">'
  );
  html = html.replace(
    /<td>/g,
    '<td class="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left">'
  );

  // 수평선에 클래스 추가
  html = html.replace(
    /<hr>/g,
    '<hr class="border-gray-300 dark:border-gray-600 my-8">'
  );

  // 강조 텍스트에 클래스 추가
  html = html.replace(
    /<strong>/g,
    '<strong class="font-semibold text-gray-900 dark:text-gray-100">'
  );
  html = html.replace(/<em>/g, '<em class="italic">');

  return html;
}

/**
 * 컨텐츠 타입에 따라 적절한 HTML 변환
 */
export function processArticleContent(content: string): string {
  if (!content) return "";

  const contentType = detectContentType(content);

  switch (contentType) {
    case "markdown":
      return convertMarkdownToHtml(content);
    case "html":
      return content; // 이미 HTML이므로 그대로 반환
    case "text":
    default:
      // 일반 텍스트는 단락으로 나누어서 <p> 태그로 감싸기
      return content
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p) => `<p class="mb-4 text-base leading-7">${p}</p>`)
        .join("\n");
  }
}

/**
 * 마크다운 컨텐츠인지 확인하는 헬퍼 함수
 */
export function isMarkdownContent(content: string): boolean {
  return detectContentType(content) === "markdown";
}
