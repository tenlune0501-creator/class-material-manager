/**
 * 커리큘럼 — Track 목록. 여기서 시작해 Track → Chapter → Lesson → 관련 Project Unit 로 이어진다.
 *
 * ■ 여기서 만들지 않는다
 * `learning_tracks` / `learning_chapters` / `learning_lessons`(sync-curriculum projection)을
 * 읽어 보여주기만 한다. 콘텐츠 갱신은 `node src/index.ts sync-curriculum`.
 */
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { NavCardArea } from "@/components/nav";
import { getTracks } from "@/lib/curriculum";

export const metadata = { title: "커리큘럼 · 수업자료 아카이브" };

export default async function CurriculumPage() {
  const tracks = await getTracks();

  if (tracks.length === 0) {
    return (
      <Box>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
          커리큘럼
        </Typography>
        <Typography color="text.secondary">
          아직 커리큘럼 projection 이 없습니다. 터미널에서{" "}
          <Box component="code" sx={{ px: 0.7, py: 0.2, bgcolor: "action.hover", borderRadius: 0.5 }}>
            node src/index.ts sync-curriculum
          </Box>{" "}
          를 실행하세요.
        </Typography>
      </Box>
    );
  }

  const totalLessons = tracks.reduce((n, t) => n + t.lessonCount, 0);
  const totalChapters = tracks.reduce((n, t) => n + t.chapterCount, 0);

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }} gutterBottom>
        🗺️ 커리큘럼
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 1 }}>
        Track → Chapter → Lesson 순서로 개념을 익히고, 각 Lesson에서 그 개념이 실제 프로젝트 코드에서
        어떻게 조립되는지(Project Unit)로 이어집니다.
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 3 }}>
        Track {tracks.length} · Chapter {totalChapters} · Lesson {totalLessons}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
          gap: 2,
        }}
      >
        {tracks.map((track) => (
          <Card key={track.id} variant="outlined">
            <NavCardArea
              href={`/curriculum/${encodeURIComponent(track.id)}`}
              sx={{ p: 2.5, height: "100%", alignItems: "flex-start" }}
            >
              <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 1, flexWrap: "wrap" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {track.title}
                </Typography>
                {track.kind === "coding_test" && (
                  <Chip size="small" variant="outlined" label="코딩테스트" />
                )}
              </Box>
              {track.summary && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.7 }}>
                  {track.summary}
                </Typography>
              )}
              <Divider sx={{ my: 1, width: "100%" }} />
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip size="small" variant="outlined" label={`Chapter ${track.chapterCount}`} />
                <Chip size="small" variant="outlined" label={`Lesson ${track.lessonCount}`} />
              </Box>
            </NavCardArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
