"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import Markdown from "react-markdown";
import type { ChatMessage } from "./TutorSidebar";

/** Presentation only: the controller owns messages and expanded state. */
export function TutorHistory({ messages, expanded, onToggle }: {
  messages: ChatMessage[]; expanded: boolean; onToggle: () => void;
}) {
  const id = useId();
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const opened = useRef(false);
  const position = useRef(0);

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!expanded || !element) return;
    if (!opened.current || follow.current) element.scrollTop = element.scrollHeight;
    else element.scrollTop = position.current;
    opened.current = true;
    // Keep the latest visible on layout changes too, without moving a reader of older turns.
    const observer = new ResizeObserver(() => {
      if (follow.current) element.scrollTop = element.scrollHeight;
    });
    observer.observe(element);
    if (content.current) observer.observe(content.current);
    return () => observer.disconnect();
  }, [expanded, messages]);

  return <Box data-tutor-history sx={{ display: "flex", flexDirection: "column", flex: expanded ? "1 1 0" : "0 0 auto", minHeight: 0, minWidth: 0 }}>
    <Button aria-expanded={expanded} aria-controls={id} onClick={onToggle}
      sx={{ minHeight: 44, flexShrink: 0, alignSelf: "flex-start" }}>
      {expanded ? "대화 기록 닫기" : "대화 기록 보기"}
    </Button>
    <Paper id={id} ref={viewport} hidden={!expanded} role="region" aria-label="대화 기록" tabIndex={0} variant="outlined"
      onScroll={(event) => {
        const element = event.currentTarget;
        position.current = element.scrollTop;
        follow.current = element.scrollHeight - element.clientHeight - element.scrollTop <= 48;
      }}
      sx={{ minHeight: 0, minWidth: 0, flex: "1 1 0", overflowY: "auto", overflowX: "hidden", overscrollBehavior: "contain", overflowAnchor: "none", p: 1,
        "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: -2 } }}>
      <Box ref={content} sx={{ display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
        {messages.map((message, index) => <Box key={index} sx={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "100%", minWidth: 0,
          bgcolor: "action.hover", borderRadius: 2, p: 1, overflowWrap: "anywhere", fontSize: "0.85rem", lineHeight: 1.6,
          "& p": { my: 0.5, whiteSpace: "pre-wrap" }, "& ul, & ol": { pl: 2.5 },
          "& pre": { maxWidth: "100%", overflowX: "auto", whiteSpace: "pre", bgcolor: "background.paper", p: 1 },
          "& pre code": { overflowWrap: "normal" }, "& img": { maxWidth: "100%" } }}>
          <Typography variant="caption" color="text.secondary">{message.role === "user" ? "나" : "Tutor"}</Typography>
          <Markdown>{message.content}</Markdown>
        </Box>)}
        {messages.length === 0 && <Typography variant="caption">아직 대화가 없습니다.</Typography>}
      </Box>
    </Paper>
  </Box>;
}
