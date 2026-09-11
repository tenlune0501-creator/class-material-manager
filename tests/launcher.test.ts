/**
 * CMM Tutor 원클릭 launcher(Windows)의 핵심 안전 규칙을 정적으로 확인한다.
 * viewer-tutor.test.ts 와 같은 방식 — 실제 프로세스/브라우저를 띄우지 않고 소스
 * 텍스트만 검사한다(실제 동작은 이번 작업에서 Windows 환경에 직접 실행해 검증했다 —
 * 완료 보고 "실제 Windows launcher 검증 결과" 참고).
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { readFile } from "node:fs/promises";

const launcherCmd = await readFile("CMMTutor.cmd", "utf8");
const stopCmd = await readFile("CMMTutor-stop.cmd", "utf8");
const launcherPs1 = await readFile("scripts/cmm-tutor-launcher.ps1", "utf8");
const stopPs1 = await readFile("scripts/cmm-tutor-stop.ps1", "utf8");
const installShortcutPs1 = await readFile("scripts/install-cmm-shortcut.ps1", "utf8");
const melottsGitignore = await readFile("local-services/melotts/.gitignore", "utf8");
const rootPackageJson = await readFile("package.json", "utf8");

describe("launcher 진입점 (.cmd)", () => {
  it("자기 위치(%~dp0) 기준 상대 경로로 ps1을 호출한다 (경로 하드코딩 금지)", () => {
    assert.ok(launcherCmd.includes("%~dp0scripts\\cmm-tutor-launcher.ps1"));
    assert.ok(stopCmd.includes("%~dp0scripts\\cmm-tutor-stop.ps1"));
    assert.ok(!/[A-Z]:\\Users\\/.test(launcherCmd), ".cmd에 절대경로를 하드코딩하면 안 된다");
    assert.ok(!/[A-Z]:\\Users\\/.test(stopCmd));
  });
});

describe("MeloTTS 자동 시작 — 기존 환경만 재사용한다", () => {
  it("기존 venv 경로만 참조하고, 새로 설치/재설치하지 않는다", () => {
    assert.ok(launcherPs1.includes(".venv\\Scripts\\python.exe"));
    assert.ok(!/pip install|python -m venv/i.test(launcherPs1), "launcher가 직접 설치하면 안 된다");
  });

  it("실행 전 /health로 먼저 확인하고, 정상이면 재사용한다(중복 실행 방지)", () => {
    assert.ok(launcherPs1.includes("Test-MeloHealth"));
    assert.ok(launcherPs1.includes("이미 실행 중입니다"));
  });

  it("포트 충돌 시 소유 프로세스를 확인만 하고 임의로 종료하지 않는다", () => {
    assert.ok(launcherPs1.includes("Get-PortOwnerPid"));
    assert.ok(!/Stop-Process/.test(launcherPs1.split("Get-PortOwnerPid")[1]?.split("function Find-AppModeBrowser")[0] ?? ""));
    assert.ok(launcherPs1.includes("임의로 종료하지 않습니다"));
  });

  it("127.0.0.1(loopback)만 참조한다 — 0.0.0.0 바인딩 지시 없음", () => {
    assert.ok(launcherPs1.includes("127.0.0.1:8787"));
    assert.ok(!launcherPs1.includes("0.0.0.0"));
  });

  it("/health 준비 전에는 브라우저를 열지 않는다 (대기 로직이 브라우저 실행보다 먼저 온다)", () => {
    const healthWaitIdx = launcherPs1.indexOf("MaxHealthWaitSeconds");
    const browserOpenIdx = launcherPs1.indexOf("Find-AppModeBrowser");
    assert.ok(healthWaitIdx > -1 && browserOpenIdx > -1 && healthWaitIdx < browserOpenIdx);
  });

  it("시작한 프로세스의 PID를 기록해 나중에 안전하게 종료할 수 있게 한다", () => {
    assert.ok(launcherPs1.includes(".launcher-started.pid"));
    assert.ok(melottsGitignore.includes(".launcher-started.pid"), "마커 파일은 git에 커밋되면 안 된다");
  });
});

describe("MeloTTS 종료 — launcher가 시작한 것만, PID 재사용 사고 방지", () => {
  it("마커 파일이 없으면 아무 것도 하지 않는다", () => {
    assert.ok(stopPs1.includes("아무 것도 종료하지 않습니다"));
  });

  it("python 프로세스가 아니면(PID 재사용 의심) 종료하지 않는다", () => {
    assert.ok(stopPs1.includes('$proc.ProcessName -ne "python"'));
  });

  it("venv 래퍼→실제 인터프리터 자식 구조를 대비해 프로세스 트리로 확인·종료한다", () => {
    assert.ok(stopPs1.includes("Get-ProcessTreeIds"));
    assert.ok(stopPs1.includes("treeIds -contains"), "포트 소유 PID가 트리 안에 있는지 확인해야 한다");
  });

  it("포트를 쓰고 있지 않으면(다른 프로세스로 바뀌었을 수 있음) 종료하지 않는다", () => {
    assert.ok(stopPs1.includes("안전을 위해 종료하지 않습니다"));
  });
});

describe("브라우저 app 모드 탐지", () => {
  it("Chrome을 먼저, Edge를 다음으로 찾고 레지스트리 App Paths를 우선 확인한다", () => {
    assert.ok(launcherPs1.includes("App Paths"));
    const chromeIdx = launcherPs1.indexOf('$_ -match "Chrome"');
    const edgeIdx = launcherPs1.indexOf('$_ -match "Edge"');
    assert.ok(chromeIdx > -1 && edgeIdx > -1 && chromeIdx < edgeIdx);
  });

  it("--app= 플래그로 독립 앱 창을 연다", () => {
    assert.ok(launcherPs1.includes("--app=$ProductionTutorUrl"));
  });

  it("특정 PC의 절대경로 하나만 가정하지 않는다(여러 후보 경로 확인)", () => {
    const commonPathsCount = (launcherPs1.match(/ProgramFiles/g) ?? []).length;
    assert.ok(commonPathsCount >= 3, "Program Files / Program Files (x86) / LOCALAPPDATA 등 여러 경로를 확인해야 한다");
  });

  it("Chrome/Edge 둘 다 없으면 기본 브라우저로 폴백한다", () => {
    assert.ok(launcherPs1.includes("기본 브라우저로 엽니다"));
  });
});

describe("진입 URL", () => {
  it("Production Vercel Tutor URL을 가리킨다 (localhost가 아님)", () => {
    assert.ok(launcherPs1.includes("https://class-material-manager-dusky.vercel.app/tutor"));
  });
});

describe("보안", () => {
  it("launcher는 GROQ_API_KEY/Supabase secret을 전혀 다루지 않는다", () => {
    for (const src of [launcherCmd, stopCmd, launcherPs1, stopPs1, installShortcutPs1]) {
      assert.ok(!/GROQ_API_KEY|SUPABASE_SERVICE_ROLE_KEY|gsk_/i.test(src));
    }
  });

  it("command-line 인자로 비밀정보를 넘기지 않는다(전달하는 인자는 URL/파일명뿐)", () => {
    assert.ok(!/-ArgumentList[^\n]*(key|secret|token)/i.test(launcherPs1));
  });
});

describe("바탕화면 바로가기 설치", () => {
  it("기존 바로가기를 기본적으로 덮어쓰지 않는다(-Force일 때만)", () => {
    assert.ok(installShortcutPs1.includes("-not $Force"));
    assert.ok(installShortcutPs1.includes("그대로 둡니다"));
  });

  it("OneDrive로 리디렉션된 바탕화면도 올바르게 찾는다(하드코딩된 USERPROFILE 경로 아님)", () => {
    assert.ok(installShortcutPs1.includes('GetFolderPath("Desktop")'));
    assert.ok(!/\$env:USERPROFILE\\Desktop/.test(installShortcutPs1));
  });

  it("관리자 권한을 요구하지 않는다(RunAs/Elevate 없음)", () => {
    assert.ok(!/RunAs|-Verb\s+runas/i.test(installShortcutPs1));
  });

  it("TargetPath/WorkingDirectory를 CMMTutor.cmd/저장소 루트로 정확히 설정한다", () => {
    assert.ok(installShortcutPs1.includes("$shortcut.TargetPath = $LauncherCmd"));
    assert.ok(installShortcutPs1.includes("$shortcut.WorkingDirectory = $RepoRoot"));
  });

  it("기존 PWA 아이콘을 재사용한다(새 아이콘을 그리지 않음)", () => {
    assert.ok(installShortcutPs1.includes("cmm-tutor.ico"));
  });

  it("npm run cmm-install-shortcut 로 실행할 수 있다", () => {
    assert.ok(rootPackageJson.includes("cmm-install-shortcut"));
    assert.ok(rootPackageJson.includes("install-cmm-shortcut.ps1"));
  });
});

describe("트레이/상시 실행 금지", () => {
  it("시스템 트레이, 부팅 자동 실행, 상시 daemon 관련 코드가 없다", () => {
    for (const src of [launcherPs1, stopPs1]) {
      assert.ok(!/NotifyIcon|SystemTray|StartupFolder|Register-ScheduledTask|schtasks/i.test(src));
    }
  });
});
