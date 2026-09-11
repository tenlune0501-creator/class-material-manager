# 바탕화면에 "CMM Tutor" 바로가기를 만든다. 관리자 권한이 필요 없다
# (바탕화면 바로가기 생성은 일반 사용자 권한으로 항상 가능하다).
#
# 실행: npm run cmm-install-shortcut
#   또는: powershell -File scripts/install-cmm-shortcut.ps1
#   기존 바로가기를 덮어쓰려면: powershell -File scripts/install-cmm-shortcut.ps1 -Force

param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $PSScriptRoot
$LauncherCmd = Join-Path $RepoRoot "CMMTutor.cmd"
$IconPath = Join-Path $RepoRoot "cmm-tutor.ico"

if (-not (Test-Path $LauncherCmd)) {
    Write-Host "[CMM Tutor] CMMTutor.cmd 를 찾지 못했습니다: $LauncherCmd" -ForegroundColor Red
    exit 1
}

# OneDrive로 리디렉션된 바탕화면도 정확히 찾는다(하드코딩된 %USERPROFILE%\Desktop 대신).
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "CMM Tutor.lnk"

if ((Test-Path $ShortcutPath) -and -not $Force) {
    Write-Host "[CMM Tutor] 바탕화면에 이미 'CMM Tutor.lnk' 가 있습니다 — 기존 것을 그대로 둡니다." -ForegroundColor Yellow
    Write-Host "[CMM Tutor] 덮어쓰려면: powershell -File scripts/install-cmm-shortcut.ps1 -Force" -ForegroundColor Yellow
    exit 0
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($ShortcutPath)
$shortcut.TargetPath = $LauncherCmd
$shortcut.WorkingDirectory = $RepoRoot
$shortcut.Description = "CMM Tutor — 지난 학습 이어서 음성/텍스트 과외"
if (Test-Path $IconPath) {
    $shortcut.IconLocation = "$IconPath,0"
}
$shortcut.Save()

Write-Host "[CMM Tutor] 바탕화면 바로가기를 만들었습니다: $ShortcutPath" -ForegroundColor Green
