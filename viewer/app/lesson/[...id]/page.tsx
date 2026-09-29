/**
 * Lesson 상세 — 섹션 본문 + 코드 예제 + 연결된 Project Unit.
 *
 * 본문 섹션의 `{{code: slug}}` 는 코드 예제로 치환해 렌더한다. Lesson → Unit 이동으로
 * "개념이 실제 코드에서 어떻게 조립되는가" 로 이어진다.
 */
import { notFound } from "next/navigation";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { LessonContent } from "@/components/LessonContent";
import { NavChip } from "@/components/nav";
import { LessonTutorSidebar } from "@/components/tutor/LessonTutorSidebar";
import { getLesson } from "@/lib/curriculum";

const MASTERY_LABEL: Record<string, string> = {
  understand: "이해",
  required: "직접 구현",
  practical: "응용·설계",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params;
  const lesson = await getLesson(id.map(decodeURIComponent).join("/"));
  return { title: lesson ? `${lesson.title} · Lesson` : "Lesson" };
}

export default async function LessonPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params;
  const lessonId = id.map(decodeURIComponent).join("/");
  const lesson = await getLesson(lessonId);
  if (!lesson) notFound();

  const trackHref = `/curriculum/${encodeURIComponent(lesson.trackId)}`;
  const ttsConfigured = Boolean(process.env.NEXT_PUBLIC_MELOTTS_URL);

  return (
    // key={lesson.id}: 다른 Lesson으로 이동하면 이 Lesson의 Tutor 패널(세션·대화 포함)을
    // 강제로 새로 마운트한다 — 두 Lesson의 context가 한 세션에 섞이지 않는다.
    <LessonTutorSidebar
      key={lesson.id}
      lesson={{
        id: lesson.id,
        title: lesson.title,
        trackTitle: lesson.trackTitle ?? "",
        chapterTitle: lesson.chapterTitle ?? "",
      }}
      ttsConfigured={ttsConfigured}
    >
      <Box sx={{ maxWidth: 900 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <NavChip size="small" href="/curriculum" label="커리큘럼" clickable />
          {lesson.trackTitle && (
            <NavChip size="small" href={trackHref} label={lesson.trackTitle} clickable />
          )}
        </Typography>

        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mt: 2 }} gutterBottom>
          {lesson.title}
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          <Chip size="small" color="primary" label={MASTERY_LABEL[lesson.mastery] ?? lesson.mastery} />
          {lesson.estimatedMinutes && (
            <Chip size="small" variant="outlined" label={`약 ${lesson.estimatedMinutes}분`} />
          )}
          {lesson.chapterTitle && <Chip size="small" variant="outlined" label={lesson.chapterTitle} />}
          {lesson.tags.map((tag) => (
            <Chip key={tag} size="small" variant="outlined" label={tag} />
          ))}
        </Box>

        <Divider sx={{ mb: 3 }} />

        <LessonContent lesson={lesson} />
      </Box>
    </LessonTutorSidebar>
  );
}
