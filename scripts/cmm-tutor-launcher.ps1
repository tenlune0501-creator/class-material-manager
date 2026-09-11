# CMM Tutor — 원클릭 launcher.
#
# 이 스크립트는 CMMTutor.cmd 가 호출한다. 하는 일은 딱 세 가지뿐이다:
#   1) 로컬 MeloTTS 컴패니언(local-services/melotts) 상태 확인 → 없으면 "기존 설치"로 시작
#   2) /health 준비될 때까지 짧게 대기 (bounded retry)
#   3) Production CMM Tutor(Vercel)를 Chrome/Edge app 모드 창으로 연다
#
# 새 Python 환경을 만들거나 MeloTTS를 재설치하지 않는다 — local-services/melotts/.venv
# 가 이미 있어야 한다(없으면 README.md 안내로 넘긴다). 포트 8787을 다른 프로그램이
# 쓰고 있으면 무엇인지 모르는 채로 종료하지 않는다.
#
# 경로는 전부 $PSScriptRoot 기준 상대 경로로 계산한다 — 저장소를 어디에 클론해도,
# 경로에 공백이 있어도 그대로 동작해야 한다(문자열을 손으로 이어붙이지 않고
# Join-Path/배열 인자만 쓴다).

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$MeloDir = Join-Path $RepoRoot "local-services\melotts"
$MeloVenvPython = Join-Path $MeloDir ".venv\Scripts\python.exe"
$MeloServerScript = Join-Path $MeloDir "server.py"
$PidMarkerFile = Join-Path $MeloDir ".launcher-started.pid"

$MeloHealthUrl = "http://127.0.0.1:8787/health"
$MeloPort = 8787

# 프로덕션이 바뀌면(도메인 이전 등) 이 한 줄만 고치면 된다.
$ProductionTutorUrl = "https://class-material-manager-dusky.vercel.app/tutor"

$MaxHealthWaitSeconds = 120
$HealthPollIntervalSeconds = 2

function Write-Info($msg) { Write-Host "[CMM Tutor] $msg" -ForegroundColor Cyan }
function Write-Warn2($msg) { Write-Host "[CMM Tutor] $msg" -ForegroundColor Yellow }
function Write-Err2($msg) { Write-Host "[CMM Tutor] $msg" -ForegroundColor Red }

function Test-MeloHealth {
    try {
        $resp = Invoke-RestMethod -Uri $MeloHealthUrl -Method Get -TimeoutSec 2
        return ($resp.status -eq "ok" -and $resp.language -eq "KR")
    } catch {
        return $false
    }
}

function Get-PortOwnerPid($port) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conn) { return $conn.OwningProcess }
    return $null
}

# ── 1) MeloTTS 상태 확인 ──────────────────────────────────────────────────
Write-Info "MeloTTS(한국어 음성) 상태를 확인합니다..."

$startedByThisRun = $false

if (Test-MeloHealth) {
    Write-Info "MeloTTS가 이미 실행 중입니다 — 그대로 재사용합니다(중복 실행하지 않습니다)."
} else {
    $ownerPid = Get-PortOwnerPid $MeloPort
    if ($ownerPid) {
        Write-Err2 "포트 $MeloPort 을 다른 프로그램(PID $ownerPid)이 사용 중인데, CMM MeloTTS로는 확인되지 않았습니다."
        Write-Err2 "이 launcher는 원인을 모르는 프로세스를 임의로 종료하지 않습니다."
        Write-Err2 "작업 관리자에서 PID $ownerPid 를 직접 확인한 뒤 필요하면 종료하고 다시 실행해 주세요."
        Write-Err2 "(텍스트 기반 Tutor는 음성 없이도 정상 동작합니다 — 급하면 브라우저에서 직접 열어도 됩니다: $ProductionTutorUrl)"
        Read-Host "엔터를 누르면 이 창을 닫습니다"
        exit 1
    }

    if (-not (Test-Path $MeloVenvPython) -or -not (Test-Path $MeloServerScript)) {
        Write-Warn2 "MeloTTS 설치를 찾지 못했습니다: $MeloVenvPython"
        Write-Warn2 "local-services/melotts/README.md 안내대로 ./setup.ps1 을 먼저 실행하면 음성 기능을 쓸 수 있습니다."
        Write-Warn2 "지금은 음성 없이 텍스트 Tutor로 계속 진행합니다."
    } else {
        Write-Info "MeloTTS를 시작합니다(첫 실행이면 한국어 모델을 내려받느라 오래 걸릴 수 있습니다)..."
        $proc = Start-Process -FilePath $MeloVenvPython -ArgumentList @("server.py") `
            -WorkingDirectory $MeloDir -WindowStyle Hidden -PassThru
        Set-Content -Path $PidMarkerFile -Value $proc.Id -Encoding ascii
        $startedByThisRun = $true

        $elapsed = 0
        $ready = $false
        while ($elapsed -lt $MaxHealthWaitSeconds) {
            Start-Sleep -Seconds $HealthPollIntervalSeconds
            $elapsed += $HealthPollIntervalSeconds
            if (Test-MeloHealth) { $ready = $true; break }
            if ($proc.HasExited) {
                Write-Warn2 "MeloTTS 프로세스가 중간에 종료됐습니다. local-services/melotts 를 직접 확인해 주세요."
                Remove-Item $PidMarkerFile -ErrorAction SilentlyContinue
                break
            }
            Write-Info "MeloTTS 준비 대기 중... (${elapsed}s / ${MaxHealthWaitSeconds}s)"
        }

        if ($ready) {
            Write-Info "MeloTTS 준비 완료."
        } else {
            Write-Warn2 "MeloTTS가 제한 시간(${MaxHealthWaitSeconds}초) 안에 준비되지 않았습니다."
            Write-Warn2 "일단 텍스트 Tutor로 계속 진행합니다 — 준비되면 화면의 음성 스위치가 자동으로 켜질 수 있는 상태가 됩니다."
        }
    }
}

# ── 2) Chrome/Edge 탐지 후 app 모드로 열기 ───────────────────────────────
function Find-AppModeBrowser {
    $candidates = New-Object System.Collections.Generic.List[string]

    foreach ($exeName in @("chrome.exe", "msedge.exe")) {
        foreach ($hive in @("HKLM:", "HKCU:")) {
            $regPath = "$hive\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\$exeName"
            if (Test-Path $regPath) {
                $val = (Get-ItemProperty -Path $regPath -ErrorAction SilentlyContinue).'(default)'
                if ($val -and (Test-Path $val)) { $candidates.Add($val) }
            }
        }
    }

    $commonPaths = @(
        (Join-Path $env:ProgramFiles "Google\Chrome\Application\chrome.exe"),
        (Join-Path ${env:ProgramFiles(x86)} "Google\Chrome\Application\chrome.exe"),
        (Join-Path $env:LOCALAPPDATA "Google\Chrome\Application\chrome.exe"),
        (Join-Path $env:ProgramFiles "Microsoft\Edge\Application\msedge.exe"),
        (Join-Path ${env:ProgramFiles(x86)} "Microsoft\Edge\Application\msedge.exe")
    )
    foreach ($p in $commonPaths) {
        if ($p -and (Test-Path $p)) { $candidates.Add($p) }
    }

    $chrome = $candidates | Where-Object { $_ -match "Chrome" } | Select-Object -First 1
    if ($chrome) { return $chrome }
    $edge = $candidates | Where-Object { $_ -match "Edge" } | Select-Object -First 1
    if ($edge) { return $edge }
    return $null
}

$browser = Find-AppModeBrowser
if ($browser) {
    Write-Info "$browser 로 CMM Tutor를 독립 앱 창으로 엽니다."
    # 같은 URL로 이미 열린 app 창을 재사용하는 기능은 의도적으로 만들지 않았다
    # (Chrome/Edge 창 열거는 복잡도 대비 이득이 적다) — 반복 실행하면 창이 하나씩
    # 더 생긴다. MeloTTS 중복 실행 방지가 실제로 중요한 부분이고, 이 쪽은 단순하게 둔다.
    Start-Process -FilePath $browser -ArgumentList @("--app=$ProductionTutorUrl")
} else {
    Write-Warn2 "Chrome/Edge를 찾지 못해 기본 브라우저로 엽니다(독립 앱 창이 아닌 일반 탭일 수 있습니다)."
    Start-Process $ProductionTutorUrl
}

if ($startedByThisRun) {
    Write-Info "MeloTTS는 이번 실행에서 새로 시작했습니다 — 끄려면 CMMTutor-stop.cmd 를 실행하세요."
}
Write-Info "완료. 이 창은 닫아도 됩니다."
