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
import { NavButton, NavChip } from "@/components/nav";
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

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <NavChip size="small" href="/curriculum" label="커리큘럼" clickable />
        {lesson.trackTitle && (
          <NavChip size="small" href={trackHref} label={lesson.trackTitle} clickable />
        )}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mt: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
          {lesson.title}
        </Typography>
        <NavButton
          variant="contained"
          size="small"
          href={`/tutor?lessonId=${encodeURIComponent(lesson.id)}`}
          sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
        >
          🎧 AI Tutor로 시작
        </NavButton>
      </Box>

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
  );
}
