/**
 * getResumeState()(progress.ts)의 결과를 TutorApp이 받는 props 모양(JSON-safe DTO)으로
 * 바꾼다 — `/api/tutor/resume` 라우트가 쓴다(Lesson 페이지에 임베드된 Tutor Sidebar가
 * 처음 열릴 때만 lazy fetch). ResumeState.progressByLessonId는 Map이라 JSON으로 그대로
 * 직렬화할 수 없어서, `/tutor/page.tsx`가 이미 하는 것과 같은 배열 변환을 여기 한 곳에
 * 모아둔다(두 곳에서 각자 만들지 않는다).
 */
import type { ResumeState } from "./progress";

export interface ResumeStateDTO {
  lastSession: ResumeState["lastSession"];
  inProgressLesson: ResumeState["inProgressLesson"];
  nextLesson: ResumeState["nextLesson"];
  dueReviewCount: number;
  dueReviewItems: { id: string; sourceKind: string; sourceId: string; prompt: string }[];
  allLessons: { id: string; title: string; trackTitle: string; chapterTitle: string }[];
  lessonProgress: { lessonId: string; status: string }[];
}

export function toResumeStateDTO(resume: ResumeState): ResumeStateDTO {
  return {
    lastSession: resume.lastSession,
    inProgressLesson: resume.inProgressLesson,
    nextLesson: resume.nextLesson,
    dueReviewCount: resume.dueReviewCount,
    dueReviewItems: resume.dueReviewItems.map((item) => ({
      id: item.id,
      sourceKind: item.sourceKind,
      sourceId: item.sourceId,
      prompt: item.prompt,
    })),
    allLessons: resume.lessons.map((l) => ({
      id: l.id,
      title: l.title,
      trackTitle: l.trackTitle,
      chapterTitle: l.chapterTitle,
    })),
    lessonProgress: Array.from(resume.progressByLessonId.entries()).map(([lessonId, p]) => ({
      lessonId,
      status: p.status,
    })),
  };
}
