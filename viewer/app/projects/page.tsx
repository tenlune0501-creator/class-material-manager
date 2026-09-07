/**
 * 실전 프로젝트 학습 — Project 목록.
 *
 * Project → Unit → 코드/구조 설명 → 관련 Lesson 로 이어진다.
 * `learning_projects` / `project_learning_units`(sync-curriculum projection)을 읽는다.
 */
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { NavCardArea } from "@/components/nav";
import { getProjects } from "@/lib/curriculum";

export const metadata = { title: "실전 프로젝트 학습 · 수업자료 아카이브" };

export default async function ProjectsPage() {
  const projects = await getProjects();

  if (projects.length === 0) {
    return (
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
          실전 프로젝트 학습
        </Typography>
        <Typography color="text.secondary">
          아직 projection 이 없습니다.{" "}
          <Box component="code" sx={{ px: 0.7, py: 0.2, bgcolor: "action.hover", borderRadius: 0.5 }}>
            node src/index.ts sync-curriculum
          </Box>{" "}
          를 실행하세요.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        🏗️ 실전 프로젝트 학습
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        실제로 만든 프로젝트의 코드를 학습 단위(Unit)로 쪼갠 것입니다. 각 Unit은 고정 커밋의 실제
        코드를 근거로 하며, 관련 Lesson으로 이어집니다.
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {projects.map((project) => (
          <Card key={project.id} variant="outlined">
            <NavCardArea
              href={`/projects/${encodeURIComponent(project.id)}`}
              sx={{ p: 2.5, height: "100%", alignItems: "flex-start" }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                {project.title}
              </Typography>
              {project.summary && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.7 }}>
                  {project.summary}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 0.7, flexWrap: "wrap", mb: 1 }}>
                {project.stack.map((tech) => (
                  <Chip key={tech} size="small" label={tech} />
                ))}
              </Box>
              <Divider sx={{ my: 1, width: "100%" }} />
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip size="small" variant="outlined" label={`Unit ${project.unitCount}`} />
                {project.exampleCount > 0 && (
                  <Chip size="small" variant="outlined" color="primary" label={`코드 예제 ${project.exampleCount}`} />
                )}
              </Box>
            </NavCardArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
