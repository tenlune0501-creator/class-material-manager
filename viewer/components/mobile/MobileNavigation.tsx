"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Drawer from "@mui/material/Drawer";
import { mobileDestination, mobileLessonHref, navigationItems, isMaterialRoute } from "@/lib/navigation";
import { MOBILE_HEADER_HEIGHT, MOBILE_NAV_HEIGHT, type MobileLessonMeta } from "./MobileLayout";

export function MobileNavigation({ lesson, open, setOpen, children }: {
  lesson: MobileLessonMeta | null; open: boolean; setOpen: (open: boolean) => void; children: React.ReactNode;
}) {
  const pathname = usePathname();
  const selected = mobileDestination(pathname);
  const curriculum = navigationItems.find((item) => item.id === "curriculum")!;
  const items = [
    { id: "home", label: "홈", icon: "⌂", href: "/" },
    { id: "curriculum", label: curriculum.label, icon: "▦", href: curriculum.href },
    { id: "lesson", label: "수업", icon: "▤", href: mobileLessonHref(pathname) },
  ];
  return <>
    <AppBar position="fixed" color="default" elevation={0} sx={{ pt: "env(safe-area-inset-top, 0px)", borderBottom: 1, borderColor: "divider" }}>
      <Box sx={{ height: MOBILE_HEADER_HEIGHT, display: "flex", alignItems: "center", gap: 1,
        px: "max(8px, env(safe-area-inset-left, 0px))", minWidth: 0 }}>
        <Button component={NextLink} href={lesson?.href ?? "/curriculum"} aria-label="커리큘럼으로 이동" sx={{ minWidth: 48, minHeight: 48 }}>←</Button>
        <Typography noWrap sx={{ flex: 1, fontWeight: 700, fontSize: "0.95rem" }}>{lesson?.title ?? (isMaterialRoute(pathname) ? "학습자료" : "CMM 학습")}</Typography>
        <Button onClick={() => setOpen(true)} aria-expanded={open} aria-label="더보기 메뉴 열기" sx={{ minWidth: 48, minHeight: 48 }}>⋯</Button>
      </Box>
    </AppBar>
    <Box component="nav" aria-label="주요 탐색" sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1100,
      bgcolor: "background.paper", borderTop: 1, borderColor: "divider", pb: "env(safe-area-inset-bottom, 0px)",
      pl: "env(safe-area-inset-left, 0px)", pr: "env(safe-area-inset-right, 0px)", display: "flex" }}>
      {items.map((item) => <Button key={item.id} component={NextLink} href={item.href}
        onClick={(event) => { if (item.id === "lesson" && pathname.startsWith("/lesson/")) event.preventDefault(); }}
        aria-current={selected === item.id ? "page" : undefined}
        sx={{ flex: 1, minWidth: 0, height: MOBILE_NAV_HEIGHT, borderRadius: 0, flexDirection: "column", color: selected === item.id ? "primary.main" : "text.secondary" }}>
        <Box component="span" aria-hidden sx={{ fontSize: 22 }}>{item.icon}</Box>{item.label}
      </Button>)}
      <Button onClick={() => setOpen(true)} aria-expanded={open} aria-current={selected === "more" ? "page" : undefined}
        sx={{ flex: 1, minWidth: 0, height: MOBILE_NAV_HEIGHT, borderRadius: 0, flexDirection: "column", color: selected === "more" ? "primary.main" : "text.secondary" }}>
        <Box component="span" aria-hidden sx={{ fontSize: 22 }}>☰</Box>더보기
      </Button>
    </Box>
    <Drawer anchor="bottom" open={open} onClose={() => setOpen(false)}
      slotProps={{ paper: { role: "dialog", "aria-label": "더보기", sx: { maxHeight: "85dvh", pb: "env(safe-area-inset-bottom, 0px)", "& .MuiListItemButton-root": { minHeight: 48 } } } }}>
      <Box sx={{ display: "flex", alignItems: "center", px: 2 }}><Typography sx={{ flex: 1, fontWeight: 700 }}>더보기</Typography><Button sx={{ minHeight: 48 }} onClick={() => setOpen(false)}>닫기</Button></Box>
      {children}
    </Drawer>
  </>;
}
