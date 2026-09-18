# BeautyNest Cloudflare Tunnel Launcher
param(
    [int]$CustomerPort = 3100,
    [int]$AdminPort = 5175
)

$ToolsDir = Join-Path $PSScriptRoot "tools"
$Cloudflared = Join-Path $ToolsDir "cloudflared.exe"

if (-not (Test-Path $Cloudflared)) {
    Write-Host "Downloading cloudflared..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $ToolsDir -Force | Out-Null
    Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile $Cloudflared
}

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "      Starting BeautyNest Cloudflare Tunnels      " -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

Write-Host "Starting Customer Website Tunnel (Port $CustomerPort)..." -ForegroundColor Green
Start-Process -FilePath $Cloudflared -ArgumentList "tunnel --url http://localhost:$CustomerPort" -NoNewWindow

Write-Host "Starting Admin Dashboard Tunnel (Port $AdminPort)..." -ForegroundColor Green
Start-Process -FilePath $Cloudflared -ArgumentList "tunnel --url http://localhost:$AdminPort --http-host-header localhost:$AdminPort" -NoNewWindow
