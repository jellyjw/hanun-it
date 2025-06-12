import { marked } from 'marked';
import hljs from 'highlight.js';
// CSS는 컴포넌트에서 직접 import하지 않고 전역 CSS에서 처리

const renderer = new marked.Renderer();

// 커스텀 렉서 확장
const lexer = new marked.Lexer();

// 코드 블록 렌더링 - highlight.js를 사용한 syntax highlighting
renderer.code = function ({ text, lang }) {
  // 언어가 지정되어 있고 highlight.js가 지원하는 언어인 경우
  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre><code class="hljs language-${lang}" data-language="${lang}">${highlighted}</code></pre>`;
    } catch (err) {
      console.warn('Highlight.js error:', err);
    }
  }

  // 언어가 지정되지 않았거나 지원하지 않는 언어인 경우 자동 감지 시도
  try {
    const highlighted = hljs.highlightAuto(text).value;
    return `<pre><code class="hljs">${highlighted}</code></pre>`;
  } catch (err) {
    console.warn('Highlight.js auto-detect error:', err);
    // 하이라이팅 실패 시 일반 코드 블록으로 표시
    const escapedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
    return `<pre><code>${escapedText}</code></pre>`;
  }
};

// 인라인 코드 렌더링
renderer.codespan = function ({ text }) {
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  return `<code class="inline-code">${escapedText}</code>`;
};

// marked 설정
marked.setOptions({
  renderer: renderer,
  breaks: false,
  gfm: true,
  pedantic: false,
});

// 코드 블록 전처리 함수
function preprocessCodeBlocks(content: string): string {
  // 백틱 3개로 시작하는 코드 블록을 찾아서 하나로 묶기
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;

  return content.replace(codeBlockRegex, (match, lang, code) => {
    // 코드 블록 내용을 그대로 유지
    return `\`\`\`${lang || ''}\n${code}\n\`\`\``;
  });
}

// 연속된 코드 블록을 병합하는 함수
function mergeConsecutiveCodeBlocks(html: string): string {
  // 연속된 code-block div들을 찾아서 병합
  const consecutiveCodeBlockRegex = /<\/div>\s*<div class="code-block"><code>([\s\S]*?)<\/code><\/div>/g;

  let mergedHtml = html;
  let hasChanges = true;

  // 연속된 코드 블록이 없을 때까지 반복
  while (hasChanges) {
    const beforeReplace = mergedHtml;

    // 첫 번째 코드 블록과 연속된 코드 블록을 찾아서 병합
    mergedHtml = mergedHtml.replace(
      /(<div class="code-block"><code>[\s\S]*?)<\/code><\/div>\s*<div class="code-block"><code>([\s\S]*?)<\/code><\/div>/g,
      (match, firstBlock, secondBlock) => {
        // 두 코드 블록의 내용을 병합
        const firstContent = firstBlock.replace('<div class="code-block"><code>', '');
        return `<div class="code-block"><code>${firstContent}\n${secondBlock}</code></div>`;
      },
    );

    hasChanges = beforeReplace !== mergedHtml;
  }

  return mergedHtml;
}

// HTML에서 잘못 분리된 코드 블록을 정리하는 함수
function cleanupFragmentedCodeBlocks(html: string): string {
  // <p> 태그로 감싸진 코드 조각들을 찾아서 병합
  const fragmentedCodeRegex = /<\/code><\/div>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<div class="code-block"><code>/g;

  let cleanedHtml = html.replace(fragmentedCodeRegex, (match, middleContent) => {
    // 중간 p 태그 내용이 코드의 일부인지 확인
    const trimmedContent = middleContent.trim();

    // p 태그 내용이 비어있거나 단순한 텍스트라면 코드 블록에 포함
    if (!trimmedContent || !/[<>]/.test(trimmedContent)) {
      return `\n${trimmedContent}\n`;
    }

    return match; // 복잡한 HTML이 포함된 경우 원본 유지
  });

  // 연속된 코드 블록 병합
  cleanedHtml = mergeConsecutiveCodeBlocks(cleanedHtml);

  return cleanedHtml;
}

// ASCII 테이블을 HTML 테이블로 변환하는 함수
function convertAsciiTableToHtml(content: string): string {
  const lines = content.split('\n');
  const result = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    // 테이블 시작 감지: | 로 시작하고 끝나는 라인
    if (line.startsWith('|') && line.endsWith('|') && line.split('|').length > 2) {
      const tableLines = [];
      let j = i;

      // 연속된 테이블 라인들 수집
      while (j < lines.length) {
        const currentLine = lines[j].trim();
        if (currentLine.startsWith('|') && currentLine.endsWith('|')) {
          tableLines.push(currentLine);
          j++;
        } else if (currentLine === '') {
          j++;
        } else {
          break;
        }
      }

      // 최소 2줄 이상의 테이블이어야 변환
      if (tableLines.length >= 2) {
        const htmlTable = convertTableLines(tableLines);
        if (htmlTable) {
          result.push(htmlTable);
          i = j;
          continue;
        }
      }
    }

    result.push(lines[i]);
    i++;
  }

  return result.join('\n');
}

// 테이블 라인들을 HTML 테이블로 변환
function convertTableLines(tableLines: string[]): string | null {
  if (tableLines.length < 2) return null;

  // 구분선 찾기
  let separatorIndex = -1;
  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i];
    if (/^\|[\s]*[-:+\s]+[\s]*\|$/.test(line)) {
      separatorIndex = i;
      break;
    }
  }

  let headerLines: string[];
  let bodyLines: string[];

  if (separatorIndex > 0) {
    headerLines = tableLines.slice(0, separatorIndex);
    bodyLines = tableLines.slice(separatorIndex + 1);
  } else {
    headerLines = [tableLines[0]];
    bodyLines = tableLines.slice(1);
  }

  if (headerLines.length === 0 || bodyLines.length === 0) {
    return null;
  }

  const headerCells = parseTableRow(headerLines[0]);
  if (headerCells.length === 0) return null;

  const bodyRows = bodyLines.map(parseTableRow).filter((row) => row.length > 0);

  if (bodyRows.length === 0) return null;

  let tableHtml = '<div class="table-wrapper"><table><thead><tr>';

  headerCells.forEach((cell) => {
    tableHtml += `<th>${cell.trim()}</th>`;
  });
  tableHtml += '</tr></thead><tbody>';

  bodyRows.forEach((row) => {
    tableHtml += '<tr>';
    for (let i = 0; i < headerCells.length; i++) {
      const cell = i < row.length ? row[i].trim() : '';
      tableHtml += `<td>${cell}</td>`;
    }
    tableHtml += '</tr>';
  });

  tableHtml += '</tbody></table></div>';

  return tableHtml;
}

// 테이블 행을 파싱하는 함수
function parseTableRow(line: string): string[] {
  if (!line.startsWith('|') || !line.endsWith('|')) {
    return [];
  }

  const content = line.slice(1, -1);
  return content.split('|').map((cell) => cell.trim());
}

/**
 * 텍스트가 마크다운인지 HTML인지 감지
 */
export function detectContentType(content: string): 'markdown' | 'html' | 'text' {
  if (!content) return 'text';

  // HTML 태그가 많이 포함되어 있으면 HTML로 판단
  const htmlTagCount = (content.match(/<[^>]+>/g) || []).length;
  const contentLength = content.length;

  if (htmlTagCount > 3 && (htmlTagCount / contentLength) * 1000 > 8) {
    return 'html';
  }

  // 마크다운 패턴 감지
  const markdownPatterns = [
    /^#{1,6}\s+.+$/m,
    /^\* .+$/m,
    /^- .+$/m,
    /^\d+\. .+$/m,
    /\*\*.+\*\*/,
    /\[.+\]\(.+\)/,
    /!\[.*\]\(.+\)/,
    /^```[\s\S]*?```$/m,
    /`.+`/,
    /^>.+$/m,
    /\|.+\|/,
  ];

  const markdownMatches = markdownPatterns.filter((pattern) => pattern.test(content)).length;

  if (markdownMatches >= 2) {
    return 'markdown';
  }

  return 'text';
}

/**
 * 마크다운을 HTML로 변환하고 Tailwind CSS 클래스 적용
 */
export function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  try {
    // 코드 블록 전처리
    let processedMarkdown = preprocessCodeBlocks(markdown);

    // ASCII 테이블을 먼저 HTML 테이블로 변환
    processedMarkdown = convertAsciiTableToHtml(processedMarkdown);

    // marked로 마크다운을 HTML로 변환
    let html = marked.parse(processedMarkdown) as string;

    // Tailwind CSS 클래스 적용
    html = addTailwindClasses(html);

    // 분리된 코드 블록 정리 (후처리)
    html = cleanupFragmentedCodeBlocks(html);

    return html;
  } catch (error) {
    console.error('마크다운 변환 오류:', error);
    // 오류 발생 시 원본 텍스트를 단락으로 래핑해서 반환
    return `<p class="mb-4 text-base leading-7">${markdown}</p>`;
  }
}

/**
 * HTML에 Tailwind CSS 클래스 추가
 */
function addTailwindClasses(html: string): string {
  // 헤딩 태그에 클래스 추가
  html = html.replace(/<h1>/g, '<h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">');
  html = html.replace(/<h2>/g, '<h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">');
  html = html.replace(/<h3>/g, '<h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">');
  html = html.replace(/<h4>/g, '<h4 class="text-lg font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">');
  html = html.replace(/<h5>/g, '<h5 class="text-base font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">');
  html = html.replace(/<h6>/g, '<h6 class="text-sm font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4">');

  // 단락에 클래스 추가
  html = html.replace(/<p>/g, '<p class="mb-4 text-base leading-7">');

  // 리스트에 클래스 추가
  html = html.replace(/<ul>/g, '<ul class="mb-4 pl-6">');
  html = html.replace(/<ol>/g, '<ol class="mb-4 pl-6">');
  html = html.replace(/<li>/g, '<li class="mb-2">');

  // 링크에 클래스 추가
  html = html.replace(
    /<a href/g,
    '<a class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer" href',
  );

  // 이미지에 클래스 추가
  html = html.replace(/<img/g, '<img class="max-w-full h-auto rounded-lg my-4 mx-auto"');

  // 인용구에 클래스 추가
  html = html.replace(
    /<blockquote>/g,
    '<blockquote class="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4">',
  );

  // 수평선에 클래스 추가
  html = html.replace(/<hr>/g, '<hr class="border-gray-300 dark:border-gray-600 my-8">');

  // 강조 텍스트에 클래스 추가
  html = html.replace(/<strong>/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">');
  html = html.replace(/<em>/g, '<em class="italic">');

  return html;
}

/**
 * 컨텐츠 타입에 따라 적절한 HTML 변환
 */
export function processArticleContent(content: string): string {
  if (!content) return '';

  const contentType = detectContentType(content);

  switch (contentType) {
    case 'markdown':
      return convertMarkdownToHtml(content);
    case 'html':
      return content; // 이미 HTML이므로 그대로 반환
    case 'text':
    default:
      // 일반 텍스트는 단락으로 나누어서 <p> 태그로 감싸기
      return content
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0)
        .map((p) => `<p class="mb-4 text-base leading-7">${p}</p>`)
        .join('\n');
  }
}

/**
 * 마크다운 컨텐츠인지 확인하는 헬퍼 함수
 */
export function isMarkdownContent(content: string): boolean {
  return detectContentType(content) === 'markdown';
}
