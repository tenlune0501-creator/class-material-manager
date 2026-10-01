import ListItemText from "@mui/material/ListItemText";
import { NavListItem } from "@/components/nav";
import { getLessonsForMaterials } from "@/lib/curriculum";
import { lessonHref } from "@/lib/url";

/** 기존 자료 목록에 들어가는 링크만 반환한다. 별도 Tutor 모드/안내 영역을 만들지 않는다. */
export async function MaterialLessonLinks({ materialIds }: { materialIds: string[] }) {
  const lessons = await getLessonsForMaterials(materialIds);
  if (lessons.length === 0) return null;
  return (
    <>
        {lessons.map((lesson) => (
          <NavListItem key={lesson.id} href={lessonHref(lesson.id)}>
            <ListItemText primary={lesson.title} />
          </NavListItem>
        ))}
    </>
  );
}
