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
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Markdown } from "@/components/Markdown";
import { NavButton, NavChip, NavListItem } from "@/components/nav";
import { getLesson, inlineCodeRefs, SECTION_LABEL } from "@/lib/curriculum";
import { safeHref } from "@/lib/url";

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

interface SourceItem {
  title?: string;
  url?: string;
  publisher?: string;
  reference_slug?: string;
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

      {lesson.summary && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "action.hover" }}>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            {lesson.summary}
          </Typography>
        </Paper>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* ── 본문 섹션 ── */}
      {lesson.sections.map((section) => (
        <Box key={section.id} sx={{ mb: 3.5 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontWeight: 700, letterSpacing: 0.5 }}
          >
            {section.title ?? SECTION_LABEL[section.sectionType] ?? section.sectionType}
            {section.isOptional ? " (선택)" : ""}
          </Typography>
          <Box sx={{ mt: 0.5 }}>
            <Markdown>{inlineCodeRefs(section.body, lesson.codeExamples)}</Markdown>
          </Box>
        </Box>
      ))}

      {/* ── 코드 예제 (본문에서 참조하지 않은 것도 전부) ── */}
      {lesson.codeExamples.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
            💻 코드 예제
          </Typography>
          {lesson.codeExamples.map((ex) => (
            <Box key={ex.id} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {ex.title}
                {ex.sourceType === "user_project" && (
                  <Chip size="small" variant="outlined" label="실제 프로젝트" sx={{ ml: 1 }} />
                )}
              </Typography>
              {ex.code ? (
                <Paper
                  variant="outlined"
                  component="pre"
                  sx={{
                    m: 0,
                    mt: 0.5,
                    px: 2,
                    py: 1.5,
                    overflow: "auto",
                    fontSize: "0.84rem",
                    lineHeight: 1.7,
                    fontFamily: "'D2Coding', 'Consolas', monospace",
                  }}
                >
                  <code>{ex.code}</code>
                </Paper>
              ) : ex.projectExampleId ? (
                <Typography variant="caption" color="text.secondary">
                  실전 예제{" "}
                  <NavChip
                    size="small"
                    href={`/examples/${encodeURIComponent(ex.projectExampleId)}`}
                    label={ex.projectExampleId}
                    clickable
                  />
                </Typography>
              ) : null}
            </Box>
          ))}
        </Box>
      )}

      {/* ── 연결된 Project Unit ── */}
      {lesson.linkedUnits.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
            🧩 이 개념이 실제 코드에서
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            배운 개념이 실제 프로젝트에서 어떻게 조립되는지 봅니다.
          </Typography>
          <Paper variant="outlined">
            <List dense disablePadding>
              {lesson.linkedUnits.map((unit) => (
                <NavListItem
                  key={unit.unitId}
                  href={`/unit/${unit.unitId.split("/").map(encodeURIComponent).join("/")}`}
                >
                  <ListItemText
                    primary={`${unit.projectTitle} — ${unit.unitTitle}`}
                    secondary={unit.note ?? undefined}
                    slotProps={{
                      primary: { sx: { fontSize: "0.875rem" } },
                      secondary: { sx: { fontSize: "0.75rem", lineHeight: 1.6 } },
                    }}
                  />
                </NavListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* ── 출처 ── */}
      {lesson.sources.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            공식 근거
          </Typography>
          <List dense disablePadding>
            {(lesson.sources as SourceItem[]).map((source, index) => {
              const href = safeHref(source.url);
              return (
                <Box key={index} component="li" sx={{ listStyle: "none", py: 0.3 }}>
                  <Typography variant="caption" color="text.secondary">
                    {href ? (
                      <Box component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ color: "inherit" }}>
                        {source.title ?? href}
                      </Box>
                    ) : (
                      source.title ?? source.reference_slug ?? "(출처)"
                    )}
                    {source.publisher ? ` · ${source.publisher}` : ""}
                  </Typography>
                </Box>
              );
            })}
          </List>
        </Box>
      )}
    </Box>
  );
}
