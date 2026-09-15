/**
 * Lesson 본문(요약/섹션/코드 예제/연결 Unit/출처) — 렌더링만 담당하는 순수 부품.
 *
 * `/lesson/[...id]/page.tsx`와 AI Tutor(교재 중심 레이아웃)가 **같은 렌더러**를
 * 공유하기 위해 뽑아냈다 — Tutor 전용 Lesson 렌더러를 새로 만들지 않는다.
 * data-fetching(getLesson)과 페이지별 헤더(브레드크럼, "AI Tutor로 시작" 버튼 등)는
 * 각 페이지가 그대로 맡고, 이 컴포넌트는 `LessonDetail`을 받아 그리기만 한다.
 */
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Markdown } from "@/components/Markdown";
import { NavChip, NavListItem } from "@/components/nav";
import type { LessonDetail } from "@/lib/curriculum";
import { inlineCodeRefs, SECTION_LABEL } from "@/lib/curriculum-render";
import { safeHref } from "@/lib/url";

interface SourceItem {
  title?: string;
  url?: string;
  publisher?: string;
  reference_slug?: string;
}

export function LessonContent({ lesson }: { lesson: LessonDetail }) {
  return (
    <>
      {lesson.summary && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "action.hover" }}>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            {lesson.summary}
          </Typography>
        </Paper>
      )}

      {/* ── 본문 섹션 ── */}
      {lesson.sections.map((section) => (
        <Box key={section.id} sx={{ mb: 3.5 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
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
                <NavListItem key={unit.unitId} href={`/unit/${unit.unitId.split("/").map(encodeURIComponent).join("/")}`}>
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
    </>
  );
}
