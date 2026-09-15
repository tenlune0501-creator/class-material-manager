/**
 * Lesson/Unit 본문을 "그리기" 위한 순수 헬퍼 — DB 접근이 전혀 없다.
 *
 * `curriculum.ts`에서 분리한 이유: 그 파일은 `@/lib/supabase/server`(next/headers 사용,
 * Server Component 전용)를 최상단에서 import한다. `LessonContent.tsx`는 AI Tutor의
 * 교재 중심 레이아웃에서 **클라이언트 컴포넌트(TutorApp.tsx) 트리 안에서도** 쓰이므로,
 * curriculum.ts를 그대로 import하면 next/headers가 클라이언트 번들에 끌려 들어가
 * 빌드가 깨진다("You're importing a module that depends on next/headers ..."). 그래서
 * DB를 읽지 않는 순수 렌더링 헬퍼만 이 파일로 옮기고, curriculum.ts는 하위 호환을 위해
 * 그대로 재노출(re-export)한다 — 기존 서버 쪽 호출부(app/unit/[...id]/page.tsx,
 * lib/tutor/context.ts 등)는 고칠 필요가 없다.
 */
import type { LessonCodeExample } from "@/lib/curriculum";

/** 본문의 `{{code: slug}}` 를 실제 코드 예제로 치환한다. */
export function inlineCodeRefs(body: string, examples: LessonCodeExample[]): string {
  const bySlug = new Map(examples.map((e) => [e.slug, e]));
  return body.replace(/\{\{\s*code:\s*([a-z0-9-]+)\s*\}\}/g, (whole, slug: string) => {
    const ex = bySlug.get(slug);
    if (!ex || !ex.code) return whole;
    const lang = ex.language ?? "";
    return `\n\`\`\`${lang}\n${ex.code.replace(/\n$/, "")}\n\`\`\`\n`;
  });
}

/** 섹션 타입 → 한국어 라벨 (curriculum/README.md §5 어휘). */
export const SECTION_LABEL: Record<string, string> = {
  goal: "이 Lesson을 끝내면",
  prerequisite: "먼저 알아야 할 것",
  dev_problem: "이게 없으면 겪는 문제",
  concept: "개념",
  mechanism: "동작 원리",
  code: "코드",
  code_breakdown: "코드 해설",
  experiment: "직접 해 보기",
  must_know: "반드시 기억할 것",
  delegatable: "도구에 맡겨도 되는 것",
  mission: "직접 구현 과제",
  project_link: "실제 프로젝트에서",
  interview_question: "면접 대비",
  check_question: "이해 점검",
  digest_prompt: "복습용 요약 프롬프트",
  review: "한 줄 정리",
  role: "이 코드가 하는 일",
  where: "코드 위치",
  flow: "데이터·상태 흐름",
  why: "왜 이렇게 했나",
  framework_role: "프레임워크가 대신하는 것",
  related_lesson: "이어지는 Lesson",
  caution: "주의점",
  next: "다음",
};
