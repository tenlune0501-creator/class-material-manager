/**
 * AI Tutor 진입 화면.
 *
 * 서버에서 지난 세션·현재 진도·복습 필요·다음 Lesson을 한 번에 읽어(lib/tutor/progress)
 * 클라이언트 컴포넌트(TutorApp)에 초기 상태로 넘긴다. 이후 대화·요약·저장은 전부
 * TutorApp 안에서 /api/tutor/** 를 호출해 처리한다(페이지 자체는 새로고침되지 않는다).
 */
import { TutorApp } from "@/components/tutor/TutorApp";
import { getResumeState } from "@/lib/tutor/progress";

export const metadata = { title: "AI Tutor · 수업자료 아카이브" };

export default async function TutorPage({
  searchParams,
}: {
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { lessonId } = await searchParams;
  const resume = await getResumeState();
  const ttsConfigured = Boolean(process.env.NEXT_PUBLIC_MELOTTS_URL);

  return (
    <TutorApp
      autoStartLessonId={lessonId ?? null}
      ttsConfigured={ttsConfigured}
      lastSession={resume.lastSession}
      inProgressLesson={resume.inProgressLesson}
      nextLesson={resume.nextLesson}
      dueReviewCount={resume.dueReviewCount}
      dueReviewItems={resume.dueReviewItems.map((item) => ({
        id: item.id,
        sourceKind: item.sourceKind,
        sourceId: item.sourceId,
        prompt: item.prompt,
      }))}
      allLessons={resume.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        trackTitle: l.trackTitle,
        chapterTitle: l.chapterTitle,
      }))}
      lessonProgress={Array.from(resume.progressByLessonId.entries()).map(([lessonId2, p]) => ({
        lessonId: lessonId2,
        status: p.status,
      }))}
    />
  );
}
