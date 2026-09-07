/**
 * Project Unit 상세 — authored 본문 섹션 + 실제 코드 예제 + 관련 Lesson.
 *
 * Unit → Lesson 역방향 이동으로 "이 코드가 어떤 개념을 쓰는가" 로 이어진다.
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
import { NavChip, NavListItem } from "@/components/nav";
import { getUnit, SECTION_LABEL } from "@/lib/curriculum";

const UNIT_KIND_LABEL: Record<string, string> = {
  overview: "개요",
  feature: "기능",
  component: "컴포넌트",
  hook: "훅",
  data_model: "데이터 모델",
  infra: "인프라",
};

export async function generateMetadata({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params;
  const unit = await getUnit(id.map(decodeURIComponent).join("/"));
  return { title: unit ? `${unit.title} · Unit` : "Unit" };
}

export default async function UnitPage({ params }: { params: Promise<{ id: string[] }> }) {
  const { id } = await params;
  const unitId = id.map(decodeURIComponent).join("/");
  const unit = await getUnit(unitId);
  if (!unit) notFound();

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <NavChip size="small" href="/projects" label="실전 프로젝트 학습" clickable />
        {unit.projectTitle && (
          <NavChip
            size="small"
            href={`/projects/${encodeURIComponent(unit.projectId)}`}
            label={unit.projectTitle}
            clickable
          />
        )}
      </Typography>

      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mt: 2 }} gutterBottom>
        {unit.title}
      </Typography>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
        <Chip size="small" color="primary" label={UNIT_KIND_LABEL[unit.unitKind] ?? unit.unitKind} />
        {unit.featureArea && <Chip size="small" variant="outlined" label={unit.featureArea} />}
        {unit.concepts.map((concept) => (
          <Chip key={concept} size="small" variant="outlined" label={concept} />
        ))}
      </Box>

      {unit.summary && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: "action.hover" }}>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            {unit.summary}
          </Typography>
        </Paper>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* ── authored 본문 섹션 ── */}
      {unit.sections.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          이 Unit 의 본문은 아직 집필되지 않았습니다.
        </Typography>
      ) : (
        unit.sections.map((section) => (
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
              <Markdown>{section.body}</Markdown>
            </Box>
          </Box>
        ))
      )}

      {/* ── 실제 코드 예제 ── */}
      {unit.examples.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
            💻 실제 코드 예제
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            고정 커밋의 원문입니다.
          </Typography>
          <Paper variant="outlined">
            <List dense disablePadding>
              {unit.examples.map((example) => (
                <NavListItem
                  key={example.id}
                  href={`/examples/${encodeURIComponent(example.id)}`}
                >
                  <ListItemText
                    primary={example.title}
                    secondary={example.filePath}
                    slotProps={{
                      primary: { sx: { fontSize: "0.875rem" } },
                      secondary: {
                        sx: { fontSize: "0.72rem", fontFamily: "'D2Coding', 'Consolas', monospace" },
                      },
                    }}
                  />
                  {example.language && (
                    <Chip size="small" variant="outlined" label={example.language} />
                  )}
                </NavListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}

      {/* ── 관련 Lesson (역방향) ── */}
      {unit.linkedLessons.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 0.5 }}>
            📘 이 코드가 쓰는 개념
          </Typography>
          <Paper variant="outlined">
            <List dense disablePadding>
              {unit.linkedLessons.map((lesson) => (
                <NavListItem
                  key={lesson.lessonId}
                  href={`/lesson/${lesson.lessonId.split("/").map(encodeURIComponent).join("/")}`}
                >
                  <ListItemText
                    primary={lesson.lessonTitle}
                    secondary={lesson.note ?? undefined}
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
    </Box>
  );
}
