/**
 * GET /api/tutor/resume
 *
 * getResumeState()(progress.ts, /tutor 서버 페이지가 이미 쓰는 것과 같은 함수)를 얇게
 * 감싸 JSON으로 돌려준다. /lesson/[...id] 페이지에 임베드된 Tutor Sidebar가 처음 열릴
 * 때만 호출한다(everOpened) — Lesson 페이지 진입만으로는 호출되지 않는다. 그래서 Lesson을
 * 그냥 읽기만 하는 방문에는 이 쿼리 비용이 붙지 않는다(getResumeState는 진도/커리큘럼/
 * 세션/복습을 합쳐 여러 테이블을 읽는다 — /tutor 방문 시에만 쓰던 비용을 Lesson 페이지
 * 전체에 항상 붙이지 않기 위한 선택).
 */
import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getResumeState } from "@/lib/tutor/progress";
import { toResumeStateDTO } from "@/lib/tutor/resume-dto";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const resume = await getResumeState();
  return NextResponse.json(toResumeStateDTO(resume));
}
