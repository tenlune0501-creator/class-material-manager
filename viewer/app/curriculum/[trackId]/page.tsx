/**
 * 커리큘럼 — 한 Track 의 Chapter + Lesson 목록.
 */
import { notFound } from "next/navigation";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { NavChip, NavListItem } from "@/components/nav";
import { getTrack } from "@/lib/curriculum";

const MASTERY_LABEL: Record<string, string> = {
  understand: "이해",
  required: "직접 구현",
  practical: "응용·설계",
};

export async function generateMetadata({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  const track = await getTrack(decodeURIComponent(trackId));
  return { title: track ? `${track.title} · 커리큘럼` : "커리큘럼" };
}

export default async function TrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  const track = await getTrack(decodeURIComponent(trackId));
  if (!track) notFound();

  return (
    <Box sx={{ maxWidth: 1000 }}>
      <Typography variant="caption" color="text.secondary">
        <NavChip size="small" href="/curriculum" label="← 커리큘럼" clickable />
      </Typography>

      <Typography variant="h5" component="h1" sx={{ fontWeight: 700, mt: 2 }} gutterBottom>
        {track.title}
      </Typography>
      {track.summary && (
        <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
          {track.summary}
        </Typography>
      )}

      {track.chapters.map((chapter) => (
        <Box key={chapter.id} sx={{ mb: 4 }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, mb: 0.3 }}>
            {chapter.title}
          </Typography>
          {chapter.summary && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {chapter.summary}
            </Typography>
          )}
          <Divider sx={{ mb: 1 }} />
          <Paper variant="outlined">
            <List dense disablePadding>
              {chapter.lessons.map((lesson) => (
                <NavListItem
                  key={lesson.id}
                  href={`/lesson/${lesson.id.split("/").map(encodeURIComponent).join("/")}`}
                >
                  <ListItemText
                    primary={lesson.title}
                    secondary={
                      lesson.estimatedMinutes ? `약 ${lesson.estimatedMinutes}분` : undefined
                    }
                    slotProps={{
                      primary: { sx: { fontSize: "0.9rem" } },
                      secondary: { sx: { fontSize: "0.72rem" } },
                    }}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={MASTERY_LABEL[lesson.mastery] ?? lesson.mastery}
                  />
                </NavListItem>
              ))}
            </List>
          </Paper>
        </Box>
      ))}
    </Box>
  );
}
