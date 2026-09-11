@echo off
rem launcher(CMMTutor.cmd)가 시작한 MeloTTS만 안전하게 종료한다. 원래부터 실행
rem 중이던 MeloTTS는 건드리지 않는다 — scripts\cmm-tutor-stop.ps1 참고.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\cmm-tutor-stop.ps1"
