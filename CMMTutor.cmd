@echo off
rem CMM Tutor 원클릭 실행 — 바탕화면 바로가기의 대상(target)으로 이 파일을 가리킨다.
rem 실제 로직은 scripts\cmm-tutor-launcher.ps1 에 있다. %~dp0 로 이 파일 자신의
rem 위치를 기준으로 삼으므로, 저장소를 어디에 두거나 경로에 공백이 있어도 그대로 동작한다.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\cmm-tutor-launcher.ps1"
