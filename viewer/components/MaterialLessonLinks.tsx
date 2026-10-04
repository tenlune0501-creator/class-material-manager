import ListItemText from "@mui/material/ListItemText";
import { NavListItem } from "@/components/nav";
import { getLessonsForMaterials } from "@/lib/curriculum";
import { lessonHref } from "@/lib/url";

/** Explicit Lesson links; Material titles always retain their original destination. */
export async function MaterialLessonLinks({ materialIds }: { materialIds: string[] }) {
  const lessons = await getLessonsForMaterials(materialIds);
  if (lessons.length === 0) return null;
  return (
    <>
        {lessons.map((lesson) => (
          <NavListItem key={lesson.id} href={lessonHref(lesson.id)}>
            <ListItemText primary={lesson.title} secondary="Lesson · AI Tutor와 학습" />
          </NavListItem>
        ))}
    </>
  );
}
