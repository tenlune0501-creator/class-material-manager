/**
 * 실전 프로젝트 학습 — 한 Project 의 Unit 목록.
 */
import { notFound } from "next/navigation";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { NavChip, NavListItem } from "@/components/nav";
import { getProject } from "@/lib/curriculum";
import { safeHref } from "@/lib/url";

const UNIT_KIND_LABEL: Record<string, string> = {
  overview: "개요",
  feature: "기능",
  component: "컴포넌트",
  hook: "훅",
  data_model: "데이터 모델",
  infra: "인프라",
};

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProject(decodeURIComponent(projectId));
  return { title: project ? `${project.title} · 실전 프로젝트 학습` : "실전 프로젝트 학습" };
}

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProject(decodeURIComponent(projectId));
  if (!project) notFound();

  const repoHref = safeHref(
    project.repoUrl && project.repoRef && project.repoRef !== "HEAD"
      ? `${project.repoUrl}/tree/${project.repoRef}`
      : project.repoUrl,
  );

  return (
    <Box sx={{ maxWidth: 1000 }}>
      <Typography variant="caption" color="text.secondary">
        <NavChip size="small" href="/projects" label="← 실전 프로젝트 학습" clickable />
      </Typography>

      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mt: 2 }} gutterBottom>
        {project.title}
      </Typography>
      {project.summary && (
        <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.8 }}>
          {project.summary}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap", mb: 1 }}>
        {project.stack.map((tech) => (
          <Chip key={tech} size="small" label={tech} />
        ))}
      </Box>
      {repoHref && (
        <Button
          size="small"
          variant="outlined"
          href={repoHref}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ mb: 3 }}
        >
          🔗 저장소{project.repoRef && project.repoRef !== "HEAD" ? ` (${project.repoRef.slice(0, 7)})` : ""}
        </Button>
      )}

      <Divider sx={{ mb: 2 }} />

      <Paper variant="outlined">
        <List dense disablePadding>
          {project.units.map((unit) => (
            <NavListItem
              key={unit.id}
              href={`/unit/${unit.id.split("/").map(encodeURIComponent).join("/")}`}
            >
              <ListItemText
                primary={unit.title}
                secondary={unit.summary ?? undefined}
                slotProps={{
                  primary: { sx: { fontSize: "0.9rem" } },
                  secondary: { sx: { fontSize: "0.75rem", lineHeight: 1.6 } },
                }}
              />
              <Chip
                size="small"
                variant="outlined"
                label={UNIT_KIND_LABEL[unit.unitKind] ?? unit.unitKind}
              />
            </NavListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
