@echo off
chcp 65001 > nul
echo ==============================================
echo   جاري تشغيل سيستم متابعة مصاريف الشقة...
echo ==============================================
start "" "http://localhost:3000"
cmd.exe /c npm run dev
pause
