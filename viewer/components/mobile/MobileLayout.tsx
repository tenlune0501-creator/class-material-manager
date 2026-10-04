"use client";

import { createContext, useContext, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export const MOBILE_NAV_HEIGHT = 64;
export const MOBILE_HEADER_HEIGHT = 56;
export const MOBILE_BOTTOM = `calc(${MOBILE_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`;

const query = "(max-width:899.95px)";
function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function snapshot() { return window.matchMedia(query).matches; }
function serverSnapshot(): boolean | null { return null; }

/** Wait for hydration before desktop's auto-open/focus effects. Never use UA sniffing. */
export function useMobileShell() {
  const narrow = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return { mobile: process.env.NEXT_PUBLIC_CMM_DESKTOP !== "1" && narrow === true, ready: narrow !== null };
}

export interface MobileLessonMeta { title: string; href: string }
export const MobileLessonContext = createContext<(meta: MobileLessonMeta | null) => void>(() => {});
export function useMobileLesson(meta: MobileLessonMeta) {
  const setMeta = useContext(MobileLessonContext);
  useEffect(() => {
    setMeta(meta);
    return () => setMeta(null);
  }, [meta.title, meta.href, setMeta]); // depend on values, not object identity
}

/** The measured dock reserves exactly its own space; AppShell reserves the navigation. */
export function MobileTutorDock({ children, hidden = false }: { children: React.ReactNode; hidden?: boolean }) {
  const dock = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(160);
  useEffect(() => {
    const element = dock.current;
    if (!element) return;
    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <>
    <Box aria-hidden sx={{ height: height + 16 }} />
    <Paper ref={dock} component="section" aria-label="음성 Tutor" square variant="outlined"
      sx={{ visibility: hidden ? "hidden" : "visible", position: "fixed", bottom: MOBILE_BOTTOM, left: 0, right: 0, zIndex: 1100,
        px: "max(16px, env(safe-area-inset-left, 0px))", py: 1, maxHeight: "45dvh", overflowY: "auto" }}>
      {children}
    </Paper>
  </>;
}

/** A presentation-only sheet: closing never changes Tutor active/session state. */
export function MobileTutorStage({ children, title }: { children: React.ReactNode; title: string }) {
  const [open, setOpen] = useState(true);
  return <>
    <MobileTutorDock hidden={open}><Button fullWidth sx={{ minHeight: 48 }} onClick={() => setOpen(true)}>{title} 열기</Button></MobileTutorDock>
    <Dialog fullScreen open={open} onClose={() => setOpen(false)} aria-labelledby="tutor-stage-title"
      slotProps={{ paper: { sx: { height: "100dvh", pt: "env(safe-area-inset-top, 0px)", pb: "env(safe-area-inset-bottom, 0px)" } } }}>
      <Box sx={{ display: "flex", alignItems: "center", px: 2, flexShrink: 0 }}>
        <Typography id="tutor-stage-title" sx={{ flex: 1, fontWeight: 700 }}>{title}</Typography>
        <Button sx={{ minHeight: 48 }} onClick={() => setOpen(false)}>접기</Button>
      </Box>
      <Box sx={{ p: 2, overflowY: "auto", minHeight: 0, "& .MuiButton-root": { minHeight: 48 } }}>{children}</Box>
    </Dialog>
  </>;
}
