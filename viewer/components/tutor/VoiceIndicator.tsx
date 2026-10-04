"use client";

/**
 * 음성 상태를 보여주는 원형 Indicator — 하나의 컴포넌트가 VoiceState 값에 따라
 * recording(듣는 중) / transcribing / thinking / speaking / idle / error 를 모두 표현한다
 * (상태별로 원을 따로 만들지 않는다).
 *
 * ■ 마이크 레벨은 "보여주기"에만 쓴다
 * recording 중에는 실제 마이크 입력 레벨(Web Audio AnalyserNode)에 따라 원이 커지고
 * 바깥 파동이 진해진다. 이 값은 이 컴포넌트 안에서만 쓰이고 밖으로 나가지 않는다 —
 * 녹음을 끝내는 판단(VAD/침묵 감지)에는 쓰지 않는다. 녹음 종료는 언제나 사용자의
 * [말하기 끝]뿐이다. 그래서 이 컴포넌트는 콜백 prop을 하나도 받지 않는다.
 *
 * ■ 렌더 비용
 * 레벨은 React state가 아니라 root 요소의 CSS 변수(--voice-level)로 매 프레임 쓴다 —
 * 애니메이션 동안 React 리렌더가 일어나지 않는다. 스트림 자체(MediaStream)의 소유·정지는
 * TutorApp 책임이고, 여기서는 분석용 AudioContext/AnalyserNode만 만들고 정리한다.
 *
 * ■ prefers-reduced-motion
 * 반복 애니메이션(파동/호흡/회전)을 끄고, recording 레벨은 크기 변화 대신 바깥 링의
 * 진하기로만 보여준다.
 */
import { useEffect, useRef } from "react";
import { keyframes } from "@emotion/react";

import Box from "@mui/material/Box";

import { micLevelFromRms, type VoiceState } from "@/lib/tutor/voice-state";

const ripple = keyframes`
  0% { transform: scale(1); opacity: 0.45; }
  100% { transform: scale(1.6); opacity: 0; }
`;

const breathe = keyframes`
  0%, 100% { transform: scale(0.92); }
  50% { transform: scale(1.04); }
`;

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export function VoiceIndicator({ state, stream, compact = false }: { state: VoiceState; stream: MediaStream | null; compact?: boolean }) {
  const SIZE = compact ? 36 : 88;
  const CORE = compact ? 24 : 52;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty("--voice-level", "0");
    if (state !== "recording" || !stream) return;

    const AudioCtx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    let ctx: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode;
    let analyser: AnalyserNode;
    try {
      ctx = new AudioCtx();
      source = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
    } catch {
      // 분석을 못 해도 녹음 자체와는 무관하다 — 원이 조용히 정지 상태로 보일 뿐. 이미 만든
      // AudioContext는 닫는다(이 경로는 cleanup 함수를 등록하지 않으므로).
      void ctx?.close().catch(() => {});
      return;
    }
    const audioCtx = ctx;
    analyser.fftSize = 512;
    // destination에는 연결하지 않는다 — 내 목소리가 스피커로 되돌아 나오면 안 된다.
    source.connect(analyser);
    // 자동 시작(사용자 제스처 밖)이면 suspended로 만들어질 수 있다 — 분석에만 필요하다.
    void audioCtx.resume().catch(() => {});

    const buffer = new Float32Array(analyser.fftSize);
    let smoothed = 0;
    let frame = 0;
    const tick = () => {
      analyser.getFloatTimeDomainData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
      const level = micLevelFromRms(Math.sqrt(sum / buffer.length));
      // 커질 때는 빠르게, 작아질 때는 천천히 — 말소리에 반응하되 떨림은 줄인다.
      smoothed = level > smoothed ? smoothed * 0.4 + level * 0.6 : smoothed * 0.85 + level * 0.15;
      el.style.setProperty("--voice-level", smoothed.toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      try {
        source.disconnect();
        analyser.disconnect();
      } catch {
        // 이미 끊긴 노드 — 무시
      }
      void audioCtx.close().catch(() => {});
      el.style.setProperty("--voice-level", "0");
    };
  }, [state, stream]);

  const busy = state !== "idle" && state !== "error";
  const coreColor = state === "error" ? "error.main" : busy ? "primary.main" : "action.disabled";
  const ringColor = state === "error" ? "error.main" : "primary.main";

  // 상태별 차이는 이 세 값(원/바깥 링 두 겹의 움직임)뿐이다 — 요소는 항상 같다.
  const coreMotion =
    state === "recording"
      ? { transform: "scale(calc(1 + var(--voice-level) * 0.4))" } // 실제 입력 레벨로 크기 변화
      : state === "speaking"
        ? { animation: `${breathe} 1.2s ease-in-out infinite` }
        : state === "thinking"
          ? { animation: `${breathe} 2.4s ease-in-out infinite` }
          : {};
  const ring1Motion =
    state === "recording"
      ? {
          opacity: "calc(0.12 + var(--voice-level) * 0.5)",
          transform: "scale(calc(1.15 + var(--voice-level) * 0.55))",
          transition: "transform 90ms linear, opacity 90ms linear",
        }
      : state === "speaking"
        ? { animation: `${ripple} 1.6s ease-out infinite` }
        : {};
  const ring2Motion =
    state === "recording"
      ? { animation: `${ripple} 2.6s ease-out infinite` } // 조용할 때도 "듣고 있다"는 느린 잔물결
      : state === "speaking"
        ? { animation: `${ripple} 1.6s ease-out 0.8s infinite` }
        : {};

  return (
    <Box
      ref={rootRef}
      aria-hidden
      data-voice-state={state}
      sx={{
        "--voice-level": 0,
        position: "relative",
        width: SIZE,
        height: SIZE,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,

        "& .vi-ring": {
          position: "absolute",
          width: CORE,
          height: CORE,
          borderRadius: "50%",
          bgcolor: ringColor,
          opacity: 0,
          pointerEvents: "none",
        },
        "& .vi-ring-1": ring1Motion,
        "& .vi-ring-2": ring2Motion,
        "& .vi-core": {
          position: "relative",
          width: CORE,
          height: CORE,
          borderRadius: "50%",
          bgcolor: coreColor,
          transition: "transform 90ms linear, background-color 200ms ease",
          ...coreMotion,
        },
        // transcribing — 원 둘레를 도는 얇은 호(처리 중)
        "& .vi-arc": {
          position: "absolute",
          inset: -6,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "primary.main",
          display: state === "transcribing" ? "block" : "none",
          animation: `${spin} 1.1s linear infinite`,
        },

        "@media (prefers-reduced-motion: reduce)": {
          "& .vi-ring, & .vi-core, & .vi-arc": { animation: "none", transition: "none" },
          "& .vi-core": { transform: "none" },
          "& .vi-ring-1": { transform: "scale(1.3)" },
          "& .vi-ring-2": { opacity: 0 },
          // 움직임 없이도 상태가 구분되게: 처리 중 호는 정지된 채로 보인다.
        },
      }}
    >
      <span className="vi-ring vi-ring-1" />
      <span className="vi-ring vi-ring-2" />
      <Box className="vi-core">
        <span className="vi-arc" />
      </Box>
    </Box>
  );
}
