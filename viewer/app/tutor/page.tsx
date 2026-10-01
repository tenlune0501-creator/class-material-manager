/**
 * AI Tutor 진입(수업 선택) 화면.
 *
 * 서버에서 지난 세션·현재 진도·복습 필요·다음 Lesson을 한 번에 읽어(lib/tutor/progress)
 * 수업 선택 화면(TutorApp standalone = StartScreen)에 넘긴다. Lesson을 고르면 실제 수업은
 * 그 Lesson 화면(/lesson/[...id]?tutor=open — 교재 + AI Tutor 사이드바)에서 진행된다.
 */
import { redirect } from "next/navigation";

import { TutorApp } from "@/components/tutor/TutorApp";
import { getResumeState } from "@/lib/tutor/progress";
import { lessonHref } from "@/lib/url";

export const metadata = { title: "AI Tutor · 수업자료 아카이브" };

export default async function TutorPage({
  searchParams,
}: {
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { lessonId } = await searchParams;
  // 예전 방식의 바로 시작 링크(/tutor?lessonId=...)도 같은 수업 화면으로 보낸다.
  if (lessonId) redirect(lessonHref(lessonId, { openTutor: true }));

  const resume = await getResumeState();
  const ttsConfigured = Boolean(process.env.NEXT_PUBLIC_MELOTTS_URL);

  return (
    <TutorApp
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
