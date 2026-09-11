# CMM MeloTTS 로컬 컴패니언 — 최초 1회 설치 스크립트 (Windows PowerShell).
#
# 이 스크립트가 하는 일:
#   1) MeloTTS 원본을 고정 커밋(vendor/)으로 clone (이미 있으면 건너뜀)
#   2) overlay/ 의 CMM 패치 3개 파일을 그 위에 덮어씀 (아래 "왜 패치가 필요한가" 참고)
#   3) Python 3.10/3.11 venv 생성 + 설치
#   4) 상태를 확인
#
# 실행: PowerShell에서
#   cd local-services/melotts
#   ./setup.ps1
#
# ── 왜 patch가 필요한가 (README.md "Windows 네이티브 설치 문제" 절 참고) ──
# MeloTTS 원본은 사용하지 않는 언어(일본어)의 텍스트 모듈을 무조건 import한다.
# 그 모듈이 import하는 MeCab(fugashi)은 Windows에서 MSVC Build Tools 없이는 설치가
# 안 된다. CMM은 한국어만 쓰므로, 실제로 쓰는 언어만 지연 import하도록 3개 파일만
# 최소로 고쳤다(동작은 그대로 — import 시점만 바뀜). 한국어 자체의 형태소 분석기
# (eunjeon)도 Windows에서 Python 3.6 wheel만 있어 winshim/eunjeon.py 가
# `python-mecab-ko`(진짜 Windows wheel 있음)로 대체한다.

$ErrorActionPreference = "Stop"
$here = $PSScriptRoot
$vendorDir = Join-Path $here "vendor"
$pinnedCommit = "209145371cff8fc3bd60d7be902ea69cbdb7965a"

if (-not (Test-Path $vendorDir)) {
    Write-Host "Cloning MeloTTS into vendor/ ..."
    git clone https://github.com/myshell-ai/MeloTTS.git $vendorDir
    Push-Location $vendorDir
    git checkout $pinnedCommit
    Pop-Location
} else {
    Write-Host "vendor/ already exists — skipping clone (delete it to re-clone)."
}

Write-Host "Applying CMM overlay patches..."
Copy-Item (Join-Path $here "overlay/requirements.txt") (Join-Path $vendorDir "requirements.txt") -Force
Copy-Item (Join-Path $here "overlay/text/__init__.py") (Join-Path $vendorDir "melo/text/__init__.py") -Force
Copy-Item (Join-Path $here "overlay/text/cleaner.py") (Join-Path $vendorDir "melo/text/cleaner.py") -Force

# Python 3.10 또는 3.11을 우선 찾는다 — tokenizers==0.13.x(transformers==4.27.4 고정)가
# Windows용 prebuilt wheel을 제공하는 마지막 세대라 3.12+에서는 Rust 컴파일러가 필요해진다.
$pythonCmd = $null
foreach ($candidate in @("py -3.10", "py -3.11", "python3.10", "python3.11")) {
    $parts = $candidate.Split(" ")
    $exe = $parts[0]
    $exeArgs = $parts[1..($parts.Length - 1)]
    try {
        & $exe @exeArgs --version 2>$null | Out-Null
        if ($?) { $pythonCmd = $candidate; break }
    } catch {}
}
if (-not $pythonCmd) {
    Write-Warning "Python 3.10/3.11을 찾지 못했습니다. 3.12+에는 Rust 컴파일러가 추가로 필요합니다."
    Write-Warning "https://www.python.org/downloads/ 에서 3.10 또는 3.11을 설치한 뒤 다시 실행하세요."
    exit 1
}
Write-Host "Using: $pythonCmd"

$venvDir = Join-Path $here ".venv"
if (-not (Test-Path $venvDir)) {
    $parts = $pythonCmd.Split(" ")
    & $parts[0] $parts[1..($parts.Length - 1)] -m venv $venvDir
}

$venvPython = Join-Path $venvDir "Scripts\python.exe"
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -e $vendorDir
& $venvPython -m pip install -r (Join-Path $here "requirements-server.txt")

Write-Host ""
Write-Host "설치 완료. 실행하려면:"
Write-Host "  $venvPython server.py"
Write-Host "첫 요청 때 한국어 모델(수백MB)을 Hugging Face에서 자동으로 받습니다."
