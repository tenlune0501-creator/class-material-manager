"use client";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

export function TutorError({ message, onClose }: { message: string; onClose?: () => void }) {
  return <Alert severity="error" onClose={onClose}>
    {message}
    {message.includes("로그인") && <Button sx={{ minHeight: 48 }} onClick={() => {
      window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    }}>다시 로그인</Button>}
  </Alert>;
}
