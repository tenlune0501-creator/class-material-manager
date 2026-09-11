# CMM Tutor — launcher가 시작한 MeloTTS만 안전하게 종료한다.
#
# 브라우저 app 모드 창이 실제로 닫혔는지는 이 스크립트가 감지하지 않는다(신뢰성 있게
# 감지하기 어려움 — viewer/docs/AI-TUTOR.md "종료 정책" 참고). 그 대신 사용자가
# 필요할 때 이 스크립트(CMMTutor-stop.cmd)를 직접 실행해 끈다.
#
# ■ 왜 프로세스 "트리"를 다루는가
# 이 환경의 Python 3.10 venv는 `.venv\Scripts\python.exe`가 실제 인터프리터
# (`...\Python310\python.exe`)를 **자식 프로세스로 재실행**한다 — 포트 8787을 실제로
# 리스닝하는 것은 자식 쪽이다. 그래서 launcher가 기록한 PID(부모)와 포트 소유
# PID(자식)가 다를 수 있다. 이는 오탐(다른 프로그램이 포트를 가로챔)이 아니라 정상
# 동작이므로, "기록된 PID 또는 그 자손 중 하나가 지금 포트를 쓰고 있는가"로 판단한다.
#
# 안전 규칙:
#   - .launcher-started.pid 마커가 없으면(재사용 중이었거나 이미 정리됨) 아무 것도
#     하지 않는다.
#   - 마커 PID가 지금도 실제로 존재하고, python.exe 계열이고, (자신 또는 자손 중
#     하나가) 지금도 8787을 리스닝하고 있을 때만 그 트리 전체를 종료한다.
#   - 위 조건이 하나라도 안 맞으면 종료하지 않고 이유를 설명한다(PID 재사용으로
#     엉뚱한 최신 프로세스를 죽이는 사고를 막는다).

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$MeloDir = Join-Path $RepoRoot "local-services\melotts"
$PidMarkerFile = Join-Path $MeloDir ".launcher-started.pid"
$MeloPort = 8787

function Write-Info($msg) { Write-Host "[CMM Tutor] $msg" -ForegroundColor Cyan }
function Write-Warn2($msg) { Write-Host "[CMM Tutor] $msg" -ForegroundColor Yellow }

# 루트 PID 자신 + 모든 자손 PID를 돌려준다(venv 래퍼 -> 실제 인터프리터 같은 구조 대응).
function Get-ProcessTreeIds([int]$RootProcessId) {
    $all = Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId
    $result = New-Object System.Collections.Generic.List[int]
    $queue = New-Object System.Collections.Generic.Queue[int]
    $queue.Enqueue($RootProcessId)
    while ($queue.Count -gt 0) {
        $current = $queue.Dequeue()
        if ($result.Contains($current)) { continue }
        $result.Add($current)
        foreach ($child in ($all | Where-Object { $_.ParentProcessId -eq $current })) {
            $queue.Enqueue([int]$child.ProcessId)
        }
    }
    return $result
}

if (-not (Test-Path $PidMarkerFile)) {
    Write-Info "launcher가 이번에 시작한 MeloTTS가 없습니다(원래 실행 중이었거나 이미 꺼져 있음)."
    Write-Info "아무 것도 종료하지 않습니다."
    Read-Host "엔터를 누르면 창을 닫습니다"
    exit 0
}

$markedPid = [int](Get-Content -Path $PidMarkerFile -Raw).Trim()
$proc = Get-Process -Id $markedPid -ErrorAction SilentlyContinue

if (-not $proc) {
    Write-Info "기록된 프로세스(PID $markedPid)가 이미 종료돼 있습니다. 마커만 정리합니다."
    Remove-Item $PidMarkerFile -ErrorAction SilentlyContinue
    Read-Host "엔터를 누르면 창을 닫습니다"
    exit 0
}

if ($proc.ProcessName -ne "python") {
    Write-Warn2 "PID $markedPid 가 python 프로세스가 아닙니다(현재: $($proc.ProcessName))."
    Write-Warn2 "다른 프로그램이 이 PID를 재사용한 것으로 보여 종료하지 않습니다."
    Remove-Item $PidMarkerFile -ErrorAction SilentlyContinue
    Read-Host "엔터를 누르면 창을 닫습니다"
    exit 1
}

$treeIds = Get-ProcessTreeIds -RootProcessId $markedPid

$portOwner = Get-NetTCPConnection -LocalPort $MeloPort -State Listen -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty OwningProcess

if (-not $portOwner -or -not ($treeIds -contains [int]$portOwner)) {
    Write-Warn2 "PID $markedPid (와 그 하위 프로세스)가 지금은 포트 $MeloPort 를 쓰고 있지 않습니다."
    Write-Warn2 "다른 프로세스로 바뀌었을 수 있어 안전을 위해 종료하지 않습니다."
    Write-Warn2 "필요하면 작업 관리자에서 PID $markedPid 를 직접 확인해 주세요."
    Read-Host "엔터를 누르면 창을 닫습니다"
    exit 1
}

Write-Info "MeloTTS(PID $markedPid 및 하위 프로세스 $($treeIds -join ', '))를 종료합니다..."
foreach ($id in $treeIds) {
    Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
}
Remove-Item $PidMarkerFile -ErrorAction SilentlyContinue
Write-Info "종료했습니다."
Read-Host "엔터를 누르면 창을 닫습니다"
