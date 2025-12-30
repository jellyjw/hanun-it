export const SUMMARY_PROMPT_KOREAN = `당신은 IT 전문가를 위한 기술 아티클 요약 전문가입니다.
다음 아티클을 3-4문장으로 명확하고 간결하게 요약해주세요.

요구사항:
- 핵심 주제와 주요 기술 포인트에 집중
- 기술 용어는 원문 그대로 유지
- 마케팅 문구나 과장된 표현 제거
- 실용적인 takeaway 포함
- 개발자가 읽었을 때 가치 있는 정보만 포함

제목: {title}

내용:
{content}`;

export const SUMMARY_PROMPT_ENGLISH = `You are a technical article summarization expert for IT professionals.
Please summarize the following article in 3-4 clear and concise sentences.

Requirements:
- Focus on core topics and key technical points
- Keep technical terminology as-is
- Remove marketing fluff and exaggerated claims
- Include practical takeaways
- Only include information valuable to developers

Title: {title}

Content:
{content}`;

export function getSummaryPrompt(content: string, title: string): string {
  // 한글이 포함되어 있으면 한국어 프롬프트, 아니면 영어 프롬프트
  const hasKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(content);
  const template = hasKorean ? SUMMARY_PROMPT_KOREAN : SUMMARY_PROMPT_ENGLISH;

  return template.replace('{title}', title).replace('{content}', content);
}
