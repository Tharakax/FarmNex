# Quick fix script to resolve session issues
Write-Host "🔧 QUICK FIX FOR SESSION ISSUES" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Stop any running Node processes
Write-Host "`n1. 🛑 Stopping existing Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Navigate to backend and start server
Write-Host "`n2. 🚀 Starting backend server..." -ForegroundColor Yellow
Set-Location "backend"
Start-Process -FilePath "node" -ArgumentList "index.js" -WindowStyle Normal
Write-Host "✅ Backend starting on port 3000" -ForegroundColor Green

# Wait for server to start
Start-Sleep -Seconds 3

# Test backend health
Write-Host "`n3. 🏥 Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend is running: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not responding" -ForegroundColor Red
}

Write-Host "`n📋 WHAT TO DO NOW:" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "1. ✅ Session validation is now TEMPORARILY DISABLED" -ForegroundColor Green
Write-Host "2. ✅ Open your browser and clear cache/localStorage:" -ForegroundColor Green
Write-Host "   - Press F12 → Application → Storage → Clear site data" -ForegroundColor Yellow
Write-Host "3. ✅ Try logging in again - should work without session errors" -ForegroundColor Green
Write-Host "4. ✅ If still issues, paste this in browser console:" -ForegroundColor Green
Write-Host "   localStorage.clear(); sessionStorage.clear(); location.reload();" -ForegroundColor Yellow

Write-Host "`n🎯 IMMEDIATE TEST:" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Magenta
Write-Host "• Navigate to your FarmNex login page" -ForegroundColor White
Write-Host "• Login with your credentials" -ForegroundColor White
Write-Host "• Should now work WITHOUT 'Session expired' errors!" -ForegroundColor White

Write-Host "`n🔄 TO RE-ENABLE SESSION MANAGEMENT LATER:" -ForegroundColor Blue
Write-Host "==========================================" -ForegroundColor Blue
Write-Host "1. In backend/middleware/auth.js - remove '&& false' from line 26" -ForegroundColor White
Write-Host "2. In frontend/src/utils/sessionManager.js - remove the 'return;' from line 27" -ForegroundColor White
Write-Host "3. Restart servers" -ForegroundColor White

Write-Host "`n✨ Session management is temporarily disabled - you can now use the app!" -ForegroundColor Green