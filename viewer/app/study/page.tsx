import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { NavChip, NavListItem } from "@/components/nav";
import { getStudyGuides } from "@/lib/data";
import { getLessonsForMaterials } from "@/lib/curriculum";
import { lessonHref } from "@/lib/url";

export const metadata = { title: "다시 공부하기 · CMM" };

/** Existing material review evidence selects related Lessons; it never substitutes a Material. */
export default async function StudyPage() {
  const { materials } = await getStudyGuides();
  const lessons = await getLessonsForMaterials(materials.filter((item) => item.priority !== "KEEP").map((item) => item.materialId));
  return <Box sx={{ maxWidth: 900 }}>
    <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }} gutterBottom>다시 공부하기</Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>변경 사항이 있는 학습자료와 연결된 Lesson입니다. 수업을 선택해 개념과 예제를 다시 살펴보세요.</Typography>
    {lessons.length > 0 ? <Paper variant="outlined"><List aria-label="복습 Lesson">
      {lessons.map((lesson) => <NavListItem key={lesson.id} href={lessonHref(lesson.id)}>
        <ListItemText primary={lesson.title} secondary="Lesson · AI Tutor와 다시 공부하기" />
      </NavListItem>)}
    </List></Paper> : <Typography sx={{ mb: 2 }}>추천할 복습 Lesson이 없습니다. 커리큘럼에서 다시 보고 싶은 수업을 선택하세요.</Typography>}
    <Box sx={{ mt: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
      <NavChip href="/curriculum" label="커리큘럼에서 Lesson 선택" clickable />
      <NavChip href="/tutor" label="지난 수업 이어하기" clickable />
    </Box>
  </Box>;
}
