"use client";

/**
 * Lesson 화면(/lesson/[...id])에 AI Tutor를 그 자리에서 열 수 있도록 붙이는 래퍼.
 *
 * ■ 무엇을 재사용하는가
 * TutorApp을 `layoutMode="sidebar"`로 그대로 재사용한다 — Groq/Qwen 대화, STT, TTS,
 * session lifecycle 은 전부 기존 TutorApp/session API 그대로다. 이 파일이 새로 하는
 * 일은 딱 하나, "이 패널을 화면 어디에 어떻게 보여줄지"뿐이다(위치/폭/열림 상태).
 *
 * ■ 마운트를 유지한다("닫기" ≠ unmount)
 * 최초로 열기 전에는 TutorApp을 마운트조차 하지 않는다(`everOpened`) — Lesson을 그냥
 * 읽기만 해도 Tutor 세션이 생기면 안 되기 때문이다. 한 번 열리고 나면 이후의 "닫기"는
 * 순수 표시(CSS) 토글일 뿐이다(`panelOpen`) — TutorApp은 계속 마운트된 채로 남아
 * messages/sessionId/draft를 그대로 들고 있는다(재오픈하면 대화가 이어진다).
 * TutorApp에는 `active={panelOpen}`을 내려준다 — 닫힌 동안 뒤늦게 도착하는 마이크/STT/
 * TTS/세션시작 응답은 TutorApp 내부에서 조용히 버려진다(제출·재생하지 않는다).
 *
 * ■ Desktop/Mobile을 나눠 두 번 마운트하지 않는다
 * 이 패널 Box는 항상 트리의 같은 자리에 있고, `isWide` 여부에 따라 sx(위치/폭/transform)
 * 만 바뀐다 — MUI Drawer(모달, 기본적으로 닫히면 자식을 unmount)를 쓰지 않고 이 Box
 * 하나로 push(넓은 화면)와 overlay(좁은 화면) 둘 다 표현한다. 그래서 TutorApp이 두 개의
 * 서로 다른 부모 사이를 오가며 리마운트되는 일이 없다.
 *
 * ■ push는 왜 AppShell의 md(900px) 기준이 아닌가
 * Navigation(240) + 본문 패딩(64) + 이 패널(380) + gap(24)을 빼면 900px에서는 Lesson이
 * 약 192px만 남는다 — 2026-09-15에 고친 "3열이 Lesson을 좁게 만든다" 문제를 그대로
 * 재현한다. 그래서 push는 Lesson에 최소 ~650px 이상이 남는 폭(≈1400px+)에서만 켜고,
 * 그보다 좁으면(흔한 1280/1366 노트북 포함) 화면을 밀지 않는 overlay로 보여준다.
 */
import { useEffect, useRef, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import useMediaQuery from "@mui/material/useMediaQuery";

import { TutorApp } from "@/components/tutor/TutorApp";
import type { ResumeStateDTO } from "@/lib/tutor/resume-dto";

/** Lesson 최소 가독 폭(~650px)을 지키면서 Tutor 패널(380)까지 동시에 보여주는 데 필요한
 * 화면 폭. 위 파일 주석의 계산 근거를 그대로 코드 값으로 옮긴 것 — AppShell의 breakpoint와
 * 우연히 같을 필요는 없다(서로 다른 판단이다). */
const PUSH_MIN_WIDTH_PX = 1400;
const PANEL_WIDTH = 380;

export interface LessonTutorSidebarLesson {
  id: string;
  title: string;
  trackTitle: string;
  chapterTitle: string;
}

export function LessonTutorSidebar({
  lesson,
  ttsConfigured,
  initialOpen = false,
  children,
}: {
  lesson: LessonTutorSidebarLesson;
  ttsConfigured: boolean;
  /** /tutor(수업 선택)에서 이 Lesson으로 들어왔을 때 — 패널을 처음부터 열어 수업을 시작한다. */
  initialOpen?: boolean;
  children: React.ReactNode;
}) {
  const isWide = useMediaQuery(`(min-width:${PUSH_MIN_WIDTH_PX}px)`);

  const [everOpened, setEverOpened] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  /** panelOpen과 다른 프레임으로 움직인다 — 열 때는 즉시 false(바로 상호작용 가능),
   * 닫을 때는 한 프레임 늦춰 true(inert 적용)로 만든다. panelOpen이 바뀌는 바로 그
   * 렌더에서 (닫히는 요소가 focus를 들고 있는 채로) inert까지 함께 적용하면 브라우저가
   * 강제로 focus를 치우면서 페이지 스크롤을 맨 위로 되돌리는 현상이 있었다(실브라우저
   * 재검증 중 발견 — "닫으면 스크롤 위치를 잃지 않는다" 회귀). 한 프레임 늦추면 그
   * 사이 blur/focus 이동이 먼저 끝나 있다. */
  const [panelInert, setPanelInert] = useState(false);
  const [resume, setResume] = useState<ResumeStateDTO | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeLoading, setResumeLoading] = useState(false);

  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelOpen) {
      setPanelInert(false);
      return;
    }
    const id = requestAnimationFrame(() => setPanelInert(true));
    return () => cancelAnimationFrame(id);
  }, [panelOpen]);

  async function ensureResumeLoaded() {
    if (resume || resumeLoading) return;
    setResumeLoading(true);
    setResumeError(null);
    try {
      const res = await fetch("/api/tutor/resume");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Tutor 정보를 불러오지 못했습니다.");
      setResume(data as ResumeStateDTO);
    } catch (err) {
      setResumeError(err instanceof Error ? err.message : "Tutor 정보를 불러오지 못했습니다.");
    } finally {
      setResumeLoading(false);
    }
  }

  /** 클릭/키 핸들러 안에서 직접 focus를 옮긴다(별도 effect가 아니다) — DOM이 갱신된
   * 다음 프레임까지 두 번 기다려(double rAF) 방금 마운트/언마운트된 요소로도 확실히
   * 옮긴다. state 변화에 반응하는 effect로 만들면 실행 시점을 예측하기 어렵다.
   * preventScroll: 닫을 때 토글 버튼(Lesson 스크롤 위쪽)으로 focus가 이동하면서 브라우저
   * 기본 동작이 그 버튼을 보이게 스크롤을 맨 위로 되돌리면 "닫으면 스크롤 위치를 잃지
   * 않는다"가 깨진다 — 실브라우저 재검증 중 발견. */
  function focusAfterPaint(getTarget: () => HTMLElement | null) {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => getTarget()?.focus({ preventScroll: true })),
    );
  }

  function handleOpen() {
    setEverOpened(true);
    setPanelOpen(true);
    void ensureResumeLoaded();
    focusAfterPaint(() => panelRef.current);
  }

  function handleClose() {
    // 패널(또는 그 안의 요소)이 지금 focus를 들고 있는 채로 곧 inert가 되면, 브라우저가
    // 그 focus를 강제로 지우면서 페이지 스크롤을 맨 위로 되돌리는 현상이 있었다(실브라우저
    // 재검증 중 발견 — "닫으면 스크롤 위치를 잃지 않는다" 회귀). inert가 적용되기 전에
    // 우리가 먼저 명시적으로 blur해 그 강제 처리를 피하고, 토글 버튼으로의 focus 이동은
    // 아래 focusAfterPaint(preventScroll)가 그대로 맡는다.
    if (panelRef.current?.contains(document.activeElement)) {
      (document.activeElement as HTMLElement | null)?.blur();
    }
    setPanelOpen(false);
    focusAfterPaint(() => toggleButtonRef.current);
  }

  // 수업 선택 화면에서 들어온 경우: 사용자가 버튼을 누른 것과 똑같이 연다(같은 경로 재사용 —
  // resume 로딩·TutorApp 마운트·focus 처리가 전부 handleOpen 한 곳에 있다). 마운트 시 1회.
  useEffect(() => {
    if (initialOpen) handleOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escape로 닫는다(모든 폭에서) — 열려 있을 때만 리스너를 붙인다.
  useEffect(() => {
    if (!panelOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelOpen]);

  // 좁은 화면에서 패널이 modal로 열려 있는 동안: 배경(Lesson+토글 버튼)을 inert로
  // 만들어 키보드/스크린리더가 뒤로 넘어가지 못하게 막는다(Codex 최종 리뷰: backdrop은
  // 포인터만 막고 키보드 focus 격리가 없었다). 넓은 화면(push)에서는 모달이 아니라
  // 나란히 쓰는 패널이라 배경을 막지 않는다.
  const backgroundInert = !isWide && panelOpen;

  return (
    <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", minWidth: 0 }}>
      <Box sx={{ flex: 1, minWidth: 0 }} inert={backgroundInert || undefined}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          {!panelOpen && (
            <Button
              ref={toggleButtonRef}
              variant="contained"
              size="small"
              onClick={handleOpen}
              aria-expanded={panelOpen}
            >
              🎧 AI Tutor
            </Button>
          )}
        </Box>
        {children}
      </Box>

      {/* 좁은 화면의 backdrop — 넓은 화면(push)에서는 필요 없어 렌더하지 않는다. */}
      {!isWide && panelOpen && (
        <Box
          onClick={handleClose}
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.4)",
            zIndex: (t) => t.zIndex.drawer - 1,
          }}
        />
      )}

      {/* 항상 같은 자리에 있는 하나의 Box — isWide에 따라 push(형제 열)과 overlay(고정
          패널) 사이를 sx만으로 오간다. TutorApp을 다른 부모로 옮기지 않는다.
          닫혀 있는 동안(everOpened && !panelOpen)은 width:0/transform으로만 가려지고
          display:none이 아니므로, inert 없이는 안의 버튼·입력이 계속 Tab 대상이자
          스크린리더에 노출된다(Codex 최종 리뷰에서 발견) — inert로 명시적으로 막는다. */}
      <Box
        ref={panelRef}
        inert={panelInert || undefined}
        tabIndex={-1}
        role={!isWide && panelOpen ? "dialog" : undefined}
        aria-modal={!isWide && panelOpen ? true : undefined}
        aria-label="AI Tutor"
        sx={{
          display: everOpened ? "block" : "none",
          position: isWide ? "sticky" : "fixed",
          top: { xs: 56, sm: 64 },
          right: 0,
          height: { xs: `calc(100vh - 56px)`, sm: `calc(100vh - 64px)` },
          width: isWide ? (panelOpen ? PANEL_WIDTH : 0) : `min(88vw, ${PANEL_WIDTH}px)`,
          flexShrink: 0,
          zIndex: isWide ? "auto" : (t) => t.zIndex.drawer,
          transform: isWide ? "none" : panelOpen ? "translateX(0)" : "translateX(100%)",
          transition: "width 0.2s ease, transform 0.2s ease",
          overflow: isWide && !panelOpen ? "hidden" : "auto",
          bgcolor: "background.paper",
          borderLeft: isWide ? "1px solid" : "none",
          borderColor: "divider",
          boxShadow: isWide ? "none" : 4,
          p: isWide && !panelOpen ? 0 : 2,
        }}
      >
        {resumeError ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center", py: 4 }}>
            <Alert severity="error" sx={{ width: "100%" }}>
              {resumeError}
            </Alert>
            <Button size="small" variant="outlined" onClick={() => void ensureResumeLoaded()}>
              다시 시도
            </Button>
          </Box>
        ) : resume ? (
          <TutorApp
            layoutMode="sidebar"
            active={panelOpen}
            onRequestClose={handleClose}
            initialLesson={lesson}
            ttsConfigured={ttsConfigured}
            lastSession={resume.lastSession}
            inProgressLesson={resume.inProgressLesson}
            nextLesson={resume.nextLesson}
            dueReviewCount={resume.dueReviewCount}
            dueReviewItems={resume.dueReviewItems}
            allLessons={resume.allLessons}
            lessonProgress={resume.lessonProgress}
          />
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Box>
    </Box>
  );
}
